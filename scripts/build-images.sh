#!/usr/bin/env bash
# Build every image of the "full" profile with ONE Maven run (US-15-002).
# Uses ./mvnw when JDK 25 is installed, otherwise Maven inside Docker (no local JDK needed).
# Cách chạy (từ gốc repo):  bash scripts/build-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if java -version 2>&1 | grep -q '"25'; then
  (cd backend && sh mvnw -B -ntp -DskipTests package)
else
  MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)/backend:/work" -v homecare-m2:/root/.m2 -w /work \
    maven:3.9-eclipse-temurin-25 mvn -B -ntp -DskipTests package
fi

# Runtime images only copy the JARs: fast and light, safe to build in parallel.
docker compose -f infra/docker-compose.yml --profile full build
echo "Images ready. Start: docker compose -f infra/docker-compose.yml --profile full up -d"
