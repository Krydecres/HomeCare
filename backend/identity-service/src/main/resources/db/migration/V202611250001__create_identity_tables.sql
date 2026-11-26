-- identity-service tables (DD-0009 → DD-0024, DD-0141 → DD-0143). US-01-001 → 009, US-14-001 → 003.
-- Personal data is stored encrypted (*_enc, EncryptedStringConverter) and searched by keyed hash (*_hash, LookupHasher).

CREATE TABLE accounts (
    id                    uuid         PRIMARY KEY,
    keycloak_user_id      varchar(64)  NOT NULL UNIQUE,
    phone_enc             text,
    phone_hash            char(64)     UNIQUE,
    email_enc             text,
    email_hash            char(64)     UNIQUE,
    display_name_enc      text,
    status                varchar(20)  NOT NULL CHECK (status IN ('ACTIVE', 'LOCKED', 'PENDING_DELETION', 'DELETED')),
    locked_reason         text,
    deletion_requested_at timestamptz,
    deleted_at            timestamptz,
    created_at            timestamptz  NOT NULL,
    updated_at            timestamptz  NOT NULL,
    version               bigint       NOT NULL DEFAULT 0,
    created_by            uuid,
    updated_by            uuid,
    CONSTRAINT ck_accounts_login_id CHECK (status = 'DELETED' OR phone_hash IS NOT NULL OR email_hash IS NOT NULL)
);

CREATE TABLE account_roles (
    id             uuid         PRIMARY KEY,
    account_id     uuid         NOT NULL REFERENCES accounts (id),
    role           varchar(30)  NOT NULL CHECK (role IN ('CUSTOMER', 'ELDER', 'CAREGIVER_PENDING', 'CAREGIVER',
                                                         'DISPATCHER', 'ADMIN', 'ACCOUNTANT', 'PARTNER_ORG')),
    partner_org_id uuid,
    granted_by     uuid,
    granted_at     timestamptz  NOT NULL,
    revoked_at     timestamptz,
    revoked_reason text,
    created_at     timestamptz  NOT NULL,
    updated_at     timestamptz  NOT NULL,
    version        bigint       NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX ux_account_roles_active ON account_roles (account_id, role) WHERE revoked_at IS NULL;

CREATE TABLE consents (
    id             uuid         PRIMARY KEY,
    account_id     uuid         NOT NULL REFERENCES accounts (id),
    consent_type   varchar(40)  NOT NULL CHECK (consent_type IN ('TERMS', 'PRIVACY', 'HEALTH_DATA', 'LOCATION',
                                                                 'CARE_PHOTO', 'MARKETING', 'CAREGIVER_CODE',
                                                                 'PARTNER_SHARING')),
    policy_version varchar(20)  NOT NULL,
    channel        varchar(20)  NOT NULL,
    accepted_at    timestamptz  NOT NULL,
    withdrawn_at   timestamptz,
    created_at     timestamptz  NOT NULL,
    updated_at     timestamptz  NOT NULL,
    version        bigint       NOT NULL DEFAULT 0
);
CREATE INDEX ix_consents_account ON consents (account_id, consent_type);

CREATE TABLE login_sessions (
    id               uuid         PRIMARY KEY,
    account_id       uuid         NOT NULL REFERENCES accounts (id),
    session_ref_hash char(64)     NOT NULL UNIQUE,
    user_agent       varchar(255),
    ip_hash          char(64),
    last_active_at   timestamptz  NOT NULL,
    revoked_at       timestamptz,
    created_at       timestamptz  NOT NULL,
    updated_at       timestamptz  NOT NULL,
    version          bigint       NOT NULL DEFAULT 0
);
CREATE INDEX ix_login_sessions_account ON login_sessions (account_id);

CREATE TABLE web_push_subscriptions (
    id              uuid         PRIMARY KEY,
    account_id      uuid         NOT NULL REFERENCES accounts (id),
    endpoint_enc    text         NOT NULL,
    endpoint_hash   char(64)     NOT NULL UNIQUE,
    p256dh_enc      text         NOT NULL,
    auth_secret_enc text         NOT NULL,
    last_seen_at    timestamptz  NOT NULL,
    created_at      timestamptz  NOT NULL,
    updated_at      timestamptz  NOT NULL,
    version         bigint       NOT NULL DEFAULT 0
);

CREATE TABLE data_export_requests (
    id         uuid         PRIMARY KEY,
    account_id uuid         NOT NULL REFERENCES accounts (id),
    status     varchar(20)  NOT NULL CHECK (status IN ('PENDING', 'READY', 'EXPIRED')),
    file_key   text,
    expires_at timestamptz,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    version    bigint       NOT NULL DEFAULT 0
);
CREATE INDEX ix_data_export_requests_pending ON data_export_requests (created_at) WHERE status = 'PENDING';
