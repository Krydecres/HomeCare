#!/usr/bin/env bash
# Runs once when the postgres volume is empty (US-15-002, OQ-001).
# One database "homecare"; each service owns ONE schema with ONE login role that has rights only on that schema
# (R-07: no cross-schema access). Passwords come from environment variables (infra/.env), never from this file.
set -euo pipefail

psql_admin() {
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" "$@"
}

psql_admin <<'SQL'
CREATE EXTENSION IF NOT EXISTS postgis;
-- Nobody but the admin may create objects in public (PostGIS types stay usable).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL

create_schema() {
  local schema="$1" role="$2" password="$3"
  if [ -z "$password" ]; then
    echo "Missing password for $role – run scripts/init-dev-env.py" >&2
    exit 1
  fi
  psql_admin -v schema="$schema" -v role="$role" -v password="$password" <<'SQL'
CREATE ROLE :"role" LOGIN PASSWORD :'password';
CREATE SCHEMA :"schema" AUTHORIZATION :"role";
REVOKE ALL ON SCHEMA :"schema" FROM PUBLIC;
ALTER ROLE :"role" SET search_path = :"schema", public;
SQL
  echo "schema $schema -> role $role"
}

create_schema identity      identity_svc      "${DB_PASSWORD_IDENTITY:-}"
create_schema customer      customer_svc      "${DB_PASSWORD_CUSTOMER:-}"
create_schema caregiver     caregiver_svc     "${DB_PASSWORD_CAREGIVER:-}"
create_schema catalog       catalog_svc       "${DB_PASSWORD_CATALOG:-}"
create_schema booking       booking_svc       "${DB_PASSWORD_BOOKING:-}"
create_schema dispatch      dispatch_svc      "${DB_PASSWORD_DISPATCH:-}"
create_schema care_record   care_record_svc   "${DB_PASSWORD_CARE_RECORD:-}"
create_schema payment       payment_svc       "${DB_PASSWORD_PAYMENT:-}"
create_schema notification  notification_svc  "${DB_PASSWORD_NOTIFICATION:-}"
create_schema review        review_svc        "${DB_PASSWORD_REVIEW:-}"
create_schema incident      incident_svc      "${DB_PASSWORD_INCIDENT:-}"
create_schema report        report_svc        "${DB_PASSWORD_REPORT:-}"
create_schema keycloak      keycloak_svc      "${DB_PASSWORD_KEYCLOAK:-}"

# btree_gist is needed by the exclusion constraint that prevents double-booking a caregiver (02_Tech_Stack).
psql_admin -c "CREATE EXTENSION IF NOT EXISTS btree_gist;"
