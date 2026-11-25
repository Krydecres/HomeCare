package vn.homecare.common.event;

import java.io.Serializable;
import java.util.UUID;

/** Composite key of {@link ProcessedEvent}: PK (event_id, consumer), DD-0008. */
public record ProcessedEventId(UUID eventId, String consumer) implements Serializable {}
