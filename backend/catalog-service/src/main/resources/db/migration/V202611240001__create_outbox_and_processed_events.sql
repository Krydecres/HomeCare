-- catalog-service: Transactional Outbox + idempotent consumer tables (US-15-004, DD-0001..DD-0008, R-09).
-- Schema catalog is created by infra/postgres/init (owner catalog_svc); Flyway runs with default-schema=catalog.

CREATE TABLE outbox_events (
    id             uuid         PRIMARY KEY,
    aggregate_type varchar(60)  NOT NULL,
    aggregate_id   uuid         NOT NULL,
    event_type     varchar(80)  NOT NULL,
    payload        jsonb        NOT NULL,
    created_at     timestamptz  NOT NULL,
    updated_at     timestamptz  NOT NULL,
    published_at   timestamptz,
    version        bigint       NOT NULL DEFAULT 0
);

CREATE INDEX ix_outbox_events_unpublished ON outbox_events (created_at) WHERE published_at IS NULL;

CREATE TABLE processed_events (
    event_id     uuid         NOT NULL,
    consumer     varchar(80)  NOT NULL,
    processed_at timestamptz  NOT NULL,
    PRIMARY KEY (event_id, consumer)
);
