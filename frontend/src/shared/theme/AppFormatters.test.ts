import { describe, expect, it } from 'vitest';
import { AppFormatters } from './AppFormatters';

describe('AppFormatters (UI-50)', () => {
  it('TC-US-15-008-2: formats date/time in Asia/Ho_Chi_Minh from a UTC instant', () => {
    expect(AppFormatters.date('2026-11-24T17:30:00Z')).toBe('25/11/2026');
    expect(AppFormatters.time('2026-11-24T17:30:00Z')).toBe('00:30');
  });

  it('formats money, phone, distance and duration', () => {
    expect(AppFormatters.money(1250000)).toBe('1.250.000 ₫');
    expect(AppFormatters.phone('0912345678')).toBe('0912 345 678');
    expect(AppFormatters.distanceKm(2.34)).toBe('2,3 km');
    expect(AppFormatters.duration(270)).toBe('4 giờ 30 phút');
    expect(AppFormatters.duration(45)).toBe('45 phút');
  });
});
