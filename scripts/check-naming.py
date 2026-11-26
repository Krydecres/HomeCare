#!/usr/bin/env python3
"""Kiểm tra mọi tên trong code đã được đăng ký trong 11_Naming_Registry (R-10, R-11, R-34).

- Java (backend/**/src/main/java/**/*.java): class, interface, enum, record, @interface.
- React (frontend/src/**/*.tsx, bỏ qua *.test.tsx, *.stories.tsx):
    + component export có tên kết thúc bằng "Page" (ở bất kỳ đâu),
    + mọi component export (PascalCase) trong frontend/src/shared/ui.
- Chấp nhận MỌI tên đã đăng ký (Proposed, Approved, Implemented, Renamed...) trừ Deprecated
  (R-10 bản nới 26/11/2026: tên không cần duyệt, chỉ cần có trong registry).
- Báo lỗi nếu code dùng tên Deprecated hoặc tên nằm ở cột "Tên cũ" (kiểm tra ở MỌI export PascalCase của .tsx).
- Ngoại lệ (đã được review) ghi trong scripts/naming-ignore.txt, mỗi dòng 1 tên.

Cách chạy:  python3 scripts/check-naming.py
            python3 scripts/check-naming.py --registry docs/backlog/11_Naming_Registry.csv --root .
Mã thoát 1 nếu có lỗi (dùng trong CI).
"""
import argparse
import csv
import re
import sys
from pathlib import Path

BAD_STATUSES = {"Deprecated"}

JAVA_DECL = re.compile(
    r"^\s*(?:@\w+(?:\([^)]*\))?\s+)*"
    r"(?:(?:public|protected|private|abstract|final|static|sealed|non-sealed|strictfp)\s+)*"
    r"(?:class|interface|enum|record|@interface)\s+([A-Z][A-Za-z0-9_]*)",
    re.MULTILINE,
)
# export function XxxPage(  |  export default function XxxPage(  |  export const XxxPage = ...
TSX_DECL = re.compile(
    r"^\s*export\s+(?:default\s+)?(?:function\s+([A-Z][A-Za-z0-9_]*)"
    r"|(?:const|let)\s+([A-Z][A-Za-z0-9_]*)\s*(?::[^=]+)?=)",
    re.MULTILINE,
)
TSX_SKIP_SUFFIXES = (".test.tsx", ".spec.tsx", ".stories.tsx")


def split_names(cell: str) -> list[str]:
    """Tách ô tên: phân cách bằng , ; | xuống dòng; bỏ phần chú thích trong ngoặc.
    Quy ước "(+ …ServiceImpl)" nghĩa là mỗi XxxService có XxxServiceImpl cùng tên."""
    text = cell or ""
    with_impl = "ServiceImpl" in text and "(+" in text
    text = re.sub(r"\([^)]*\)", "", text)
    names = [n.strip() for n in re.split(r"[,;|\n]", text) if n.strip()]
    names = [n for n in names if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_.\-]*", n)]
    if with_impl:
        names += [n + "Impl" for n in names if n.endswith("Service")]
    return names


def load_registry(path: Path):
    allowed, banned = set(), {}
    with path.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    if not rows:
        sys.exit(f"[check-naming] Registry rỗng: {path}")
    header = rows[0]

    def col(name: str) -> int:
        for i, h in enumerate(header):
            if h.strip().lower().startswith(name.lower()):
                return i
        sys.exit(f"[check-naming] Không tìm thấy cột '{name}' trong {path}")

    c_id, c_name, c_status, c_old = col("NM ID"), col("Tên hiện tại"), col("Trạng thái"), col("Tên cũ")
    for r in rows[1:]:
        if len(r) <= max(c_name, c_status):
            continue
        nm_id = r[c_id].strip() if c_id < len(r) else ""
        status = r[c_status].strip()
        names = split_names(r[c_name])
        if status in BAD_STATUSES:
            for n in names:
                banned[n] = f"{nm_id} trạng thái {status}"
        else:
            allowed.update(names)
        if c_old < len(r):
            for n in split_names(r[c_old]):
                if n not in names:  # tên cũ trùng tên hiện tại thì bỏ qua
                    banned.setdefault(n, f"{nm_id} là TÊN CŨ, đã đổi thành {', '.join(names)}")
    return allowed, banned


def load_ignore(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return {l.strip() for l in path.read_text(encoding="utf-8").splitlines()
            if l.strip() and not l.strip().startswith("#")}


def line_of(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def scan(root: Path):
    found = []  # (name, file, line, must_register) – tên cũ/Deprecated bị chặn ở mọi export
    for f in root.glob("backend/**/src/main/java/**/*.java"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        for m in JAVA_DECL.finditer(text):
            found.append((m.group(1), f, line_of(text, m.start()), True))
    for f in root.glob("frontend/src/**/*.tsx"):
        if f.name.endswith(TSX_SKIP_SUFFIXES):
            continue
        in_shared_ui = "frontend/src/shared/ui/" in f.as_posix()
        text = f.read_text(encoding="utf-8", errors="ignore")
        for m in TSX_DECL.finditer(text):
            name = m.group(1) or m.group(2)
            must_register = in_shared_ui or name.endswith("Page")
            found.append((name, f, line_of(text, m.start()), must_register))
    return found


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--registry", default="docs/backlog/11_Naming_Registry.csv")
    ap.add_argument("--ignore", default="scripts/naming-ignore.txt")
    a = ap.parse_args()
    root = Path(a.root).resolve()
    reg = Path(a.registry) if Path(a.registry).is_absolute() else root / a.registry
    ign = Path(a.ignore) if Path(a.ignore).is_absolute() else root / a.ignore
    if not reg.exists():
        print(f"[check-naming] Thiếu {reg}. Chạy scripts/export-backlog.sh trước.")
        return 1

    allowed, banned = load_registry(reg)
    ignore = load_ignore(ign)
    errors = []
    for name, f, line, must_register in scan(root):
        rel = f.relative_to(root)
        if name in banned:
            errors.append(f"  ✗ {rel}:{line}  '{name}' — {banned[name]}")
        elif must_register and name not in allowed and name not in ignore:
            errors.append(f"  ✗ {rel}:{line}  '{name}' chưa đăng ký trong 11_Naming_Registry — tìm tên cùng nghĩa để dùng lại, không có thì tự thêm dòng")

    if errors:
        print("[check-naming] LỖI — thêm/cập nhật 11_Naming_Registry rồi export lại CSV (R-10, R-11):")
        print("\n".join(errors))
        return 1
    print("[check-naming] OK — mọi tên đều đã đăng ký.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
