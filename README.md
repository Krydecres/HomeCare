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

Tài khoản dev (mật khẩu = `HOMECARE_DEV_USER_PASSWORD` trong `infra/.env`): `dev.customer`, `dev.elder`, `dev.caregiver`,
`dev.pending`, `dev.dispatcher`, `dev.admin`, `dev.accountant`, `dev.partner`. Role nội bộ bắt buộc OTP (cài app TOTP ở lần đầu).

| Công cụ | URL |
|---|---|
| Web | http://localhost:5173 |
| Swagger gộp | http://localhost:8080/swagger-ui (đăng nhập trước) |
| Keycloak admin | http://localhost:8180 (admin / `KEYCLOAK_ADMIN_PASSWORD`) |
| RabbitMQ | http://localhost:15672 (homecare / `RABBITMQ_PASSWORD`) |
| Zipkin | http://localhost:9411 |

## Kiểm tra trước khi tạo PR

```bash
cd backend && ./mvnw spotless:apply verify       # format + build + unit/integration test (Testcontainers, cần Docker) + ArchitectureTest
cd frontend && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm test:e2e
python -X utf8 scripts/check-naming.py            # tên phải có trong 11_Naming_Registry
```
