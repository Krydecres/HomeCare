#!/usr/bin/env python3
"""Create infra/.env with random secrets for local development (US-15-002, R-17).

- Never overwrites an existing value; only fills the empty keys of infra/.env.example.
- infra/.env is git-ignored. The values are dev-only test secrets; never reuse them anywhere else.

Cách chạy:  python scripts/init-dev-env.py
"""
import base64
import re
import secrets
from pathlib import Path

INFRA = Path(__file__).resolve().parent.parent / "infra"
EXAMPLE = INFRA / ".env.example"
TARGET = INFRA / ".env"


def generate(key: str) -> str:
    if key == "HOMECARE_ENCRYPTION_KEY":
        return base64.b64encode(secrets.token_bytes(32)).decode()  # AES-256
    if key == "GARAGE_RPC_SECRET":
        return secrets.token_hex(32)
    if key == "HOMECARE_WEB_URL":
        return "http://localhost:5173"
    if key == "GARAGE_ACCESS_KEY_ID":
        return "GK" + secrets.token_hex(12)
    if key == "GARAGE_SECRET_ACCESS_KEY":
        return secrets.token_hex(32)
    return secrets.token_urlsafe(24)


def read_env(path: Path) -> dict[str, str]:
    values = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
            if m:
                values[m.group(1)] = m.group(2)
    return values


def main() -> None:
    existing = read_env(TARGET)
    lines = []
    created = 0
    for line in EXAMPLE.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
        if not m:
            lines.append(line)
            continue
        key, default = m.group(1), m.group(2)
        value = existing.get(key) or default or generate(key)
        if key not in existing or not existing[key]:
            created += 1
        lines.append(f"{key}={value}")
    TARGET.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{TARGET} ready ({created} value(s) generated). Dev users log in with HOMECARE_DEV_USER_PASSWORD.")


if __name__ == "__main__":
    main()
