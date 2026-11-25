#!/usr/bin/env bash
# Export toàn bộ sheet của Google Sheet "BacklogSOA" thành CSV vào docs/backlog/
# Yêu cầu: Sheet được chia sẻ "Bất kỳ ai có đường liên kết đều có thể xem".
# Cách chạy: bash scripts/export-backlog.sh
set -euo pipefail

SHEET_ID="1vDcaNERk0rVuWwJB1E1nSSgjEPIZZiWqv06KFli6ick"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/docs/backlog"
mkdir -p "$OUT_DIR"

# tên file : gid (sheetId)
SHEETS=(
  "00_README:0"
  "01_AI_RULES:101"
  "02_Tech_Stack:102"
  "03_Epics:103"
  "04_Backlog:104"
  "05_Scenarios:105"
  "06_Open_Questions:106"
  "07_Team:107"
  "08_Wireframes:108"
  "09_Service_Catalog:109"
  "10_API_Contract:110"
  "11_Naming_Registry:111"
  "12_Data_Dictionary:112"
  "13_RBAC:113"
  "14_Glossary:114"
  "15_Change_Log:115"
  "16_WF_Packages:116"
  "17_UI_Standards:117"
  "18_Code_Packages:118"
  "99_Lists:199"
)

for entry in "${SHEETS[@]}"; do
  name="${entry%%:*}"
  gid="${entry##*:}"
  url="https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}"
  echo "-> ${name}.csv"
  curl -fsSL "$url" -o "${OUT_DIR}/${name}.csv"
done

echo "Xong. File nằm ở ${OUT_DIR}"
