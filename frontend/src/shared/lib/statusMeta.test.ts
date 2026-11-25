import { describe, expect, it } from 'vitest';
import {
  bookingStatusMeta,
  earningStatusMeta,
  incidentPriorityMeta,
  incidentStatusMeta,
  partnerOrgStatusMeta,
  policyStatusMeta,
  serviceAreaStatusMeta,
  shiftStatusMeta,
  urgencyMeta,
  type HcStatusMeta,
} from './statusMeta';

const VALID_TONES = new Set(['neutral', 'primary', 'info', 'success', 'warning', 'danger']);

describe('Shared UI-40 -> UI-44 status metadata maps (NM-0295)', () => {
  const groups: [string, Record<string, HcStatusMeta>][] = [
    ['bookingStatusMeta', bookingStatusMeta],
    ['shiftStatusMeta', shiftStatusMeta],
    ['partnerOrgStatusMeta', partnerOrgStatusMeta],
    ['earningStatusMeta', earningStatusMeta],
    ['urgencyMeta', urgencyMeta],
    ['incidentPriorityMeta', incidentPriorityMeta],
    ['incidentStatusMeta', incidentStatusMeta],
    ['serviceAreaStatusMeta', serviceAreaStatusMeta],
    ['policyStatusMeta', policyStatusMeta],
  ];

  it.each(groups)('%s exposes non-empty Vietnamese labels, icons, and valid tones for every key', (_name, map) => {
    const entries = Object.entries(map);
    expect(entries.length).toBeGreaterThan(0);

    for (const [, meta] of entries) {
      expect(meta.label.trim().length).toBeGreaterThan(0);
      expect(meta.icon.trim().length).toBeGreaterThan(0);
      expect(VALID_TONES.has(meta.tone)).toBe(true);
    }
  });
});
