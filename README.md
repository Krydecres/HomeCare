# HomeCare – đặt lịch & điều phối chăm sóc tại nhà

Đồ án SOA. **Đọc [AGENTS.md](AGENTS.md) trước khi code** (quy tắc bắt buộc cho người và AI). Nguồn sự thật: Google Sheet
"BacklogSOA" (bản sao `docs/backlog/*.csv`, cập nhật bằng `bash scripts/export-backlog.sh`).

## Kiến trúc

- **SOA hướng microservice + Spring MVC** (`09_Service_Catalog`): 15 service Spring Boot + Keycloak + 1 web React.
  Mỗi service: `controller → service (+impl) → repository`, DTO `record` + MapStruct, schema DB riêng, ArchUnit kiểm tra.
- **api-gateway là BFF**: trình duyệt chỉ có cookie phiên `HC_SESSION` (HttpOnly) + cookie `XSRF-TOKEN`; token Keycloak nằm
  trong session Redis ở gateway và được chuyển xuống service bằng TokenRelay. Service chỉ tin JWT (không tin header `X-User-*`).
- Đồng bộ: `@HttpExchange` + Eureka + Resilience4j. Bất đồng bộ: RabbitMQ `homecare.events` + Transactional Outbox
  (`homecare-common`).

```
browser ──► web (Vite/nginx, same origin) ──► api-gateway (BFF, :8080) ──► lb://<service> (Eureka)
                                                  │  OAuth2 + PKCE                │ JWT (JWKS, iss, aud)
                                                  ▼                               ▼
                                           Keycloak (:8180)        PostgreSQL+PostGIS (1 schema/service)
                                           Redis (session)         RabbitMQ (outbox → homecare.events)
```

| Thư mục | Nội dung |
|---|---|
| `backend/` | Maven multi-module (Java 25, Spring Boot 4.1.3, Spring Cloud 2025.1.5): `homecare-common`, `discovery-server`, `config-server`, `api-gateway`, 12 service nghiệp vụ |
| `frontend/` | 1 web React 19 + TypeScript strict + Vite, TanStack Query, Zustand, React Router 7, Tailwind 4 + Radix, openapi-fetch |
| `infra/` | `docker-compose.yml`, init PostgreSQL, realm Keycloak, RabbitMQ, Garage (S3), config-repo |
| `scripts/` | export backlog, kiểm tra tên, sinh `.env` dev, sinh realm Keycloak, sinh route gateway |
| `docs/backlog/` | CSV export của Google Sheet + `PENDING_CHANGES.md` |

## Chạy trên máy

Cần: Docker Desktop, Node 24+, pnpm 10, JDK 25 (hoặc build backend bằng Docker như dưới).

```bash
python scripts/init-dev-env.py                                   # 1 lần: tạo infra/.env với secret ngẫu nhiên
docker compose -f infra/docker-compose.yml --profile infra up -d # PostgreSQL, Redis, RabbitMQ, Keycloak, Zipkin, Garage
bash scripts/init-storage.sh                                     # 1 lần: bucket S3 trên Garage

cd backend && ./mvnw verify                                      # hoặc: docker run --rm -v "$PWD:/work" -w /work maven:3.9-eclipse-temurin-25 mvn verify
cd frontend && pnpm install && pnpm dev                          # http://localhost:5173
```

Chạy service từ IDE: nạp biến môi trường từ `infra/.env` (`DB_PASSWORD=<DB_PASSWORD_xxx>`, `RABBITMQ_PASSWORD`, `KEYCLOAK_BFF_CLIENT_SECRET`…).
Toàn bộ hệ thống trong Docker: `bash scripts/build-images.sh` (build JAR 1 lần rồi đóng image) rồi `docker compose -f infra/docker-compose.yml --profile full up -d` (web ở :5173). Nên cấp cho Docker Desktop ≥ 8 GB RAM.

### Windows PowerShell (chạy nhanh FE Vite + BE Docker)

```powershell
# 1. Tạo infra/.env (1 lần, nếu máy chưa cài Python thì dùng Docker Python)
cd d:\homecare
docker run --rm -v "${PWD}:/work" -w /work python:3.12-slim python3 scripts/init-dev-env.py

# 2. Build 17 module Backend (JDK 25) & bật toàn bộ stack
cd d:\homecare\backend
.\mvnw.cmd -B -ntp -DskipTests package
cd d:\homecare
docker compose -f infra/docker-compose.yml --profile full build
docker compose -f infra/docker-compose.yml --profile full up -d

# 3. Nếu muốn dùng Vite dev (:5173, có HMR + /dev/ui) thay vì nginx trong container:
docker compose -f infra/docker-compose.yml stop web
cd d:\homecare\frontend
corepack pnpm dev
```

*(Lưu ý: nếu dùng Command Prompt `cmd.exe`, phải gõ `cd /d d:\homecare` để chuyển ổ đĩa; khởi tạo bucket Garage S3 chạy 1 lần qua `bash scripts/init-storage.sh` hoặc `docker compose exec garage /garage ...`.)*

Tài khoản dev (mật khẩu nằm ở biến `HOMECARE_DEV_USER_PASSWORD` trong `infra/.env`): `dev.customer`, `dev.elder`, `dev.caregiver`,
`dev.pending`, `dev.dispatcher`, `dev.admin`, `dev.accountant`, `dev.partner`. Role nội bộ bắt buộc OTP (cài app TOTP ở lần đầu).
Keycloak tắt tự đăng ký (`registrationAllowed: false` theo `OQ-037`); màn `/register` (`WF-S-02`) hiện là placeholder chờ `US-01-001` hoàn thiện.

| Công cụ | URL |
|---|---|
| Web chính | http://localhost:5173 |
| UI Kit Gallery (chỉ khi `pnpm dev`) | http://localhost:5173/dev/ui |
| Swagger gộp | http://localhost:8080/swagger-ui (đăng nhập trước) |
| Eureka Discovery | http://localhost:8761 |
| Keycloak admin | http://localhost:8180 (admin / `KEYCLOAK_ADMIN_PASSWORD`) |
| RabbitMQ | http://localhost:15672 (homecare / `RABBITMQ_PASSWORD`) |
| Zipkin | http://localhost:9411 |

## Bộ UI Kit & Design System (`US-15-012`)

- **Tokens & Formats**: `frontend/src/shared/theme/{theme.css, tokens.ts, AppFormatters.ts}`, map trạng thái `UI-40`→`UI-44` ở `frontend/src/shared/lib/statusMeta.ts`.
- **Component dùng chung**: `frontend/src/shared/ui/{buttons, inputs, display, cards, domain, navigation, states, feedback, web}` (dùng 100% CSS var `--hc-*`, responsive `1440×900` và `390×844`, hỗ trợ `.hc-elder` ×1.25).
- **Xem trực tiếp**: mở `http://localhost:5173/dev/ui` khi chạy `pnpm dev` (bị loại khỏi production build).

## Kiểm tra trước khi tạo PR

```bash
cd backend && ./mvnw spotless:apply verify       # format + build + unit/integration test (Testcontainers, cần Docker) + ArchitectureTest
cd frontend && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm test:e2e
python -X utf8 scripts/check-naming.py            # tên phải có trong 11_Naming_Registry
```
