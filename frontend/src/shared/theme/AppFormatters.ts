/**
 * UI-50 formats (vi-VN, display in Asia/Ho_Chi_Minh; the server stores UTC – R-18). NM-0187.
 * Date dd/MM/yyyy · time HH:mm (24h) · money "1.250.000 ₫" · phone "0912 345 678" · distance "2,3 km" ·
 * duration "4 giờ 30 phút".
 */
const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});
const timeFormat = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
});
const moneyFormat = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const distanceFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

export const AppFormatters = {
  date: (value: string | Date): string => dateFormat.format(new Date(value)),
  time: (value: string | Date): string => timeFormat.format(new Date(value)),
  dateTime: (value: string | Date): string => `${AppFormatters.time(value)} ${AppFormatters.date(value)}`,
  /** Money is always an integer amount of VND (R-18). */
  money: (vnd: number): string => moneyFormat.format(vnd).replace(/\s/g, ' '),
  phone: (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : raw;
  },
  distanceKm: (km: number): string => `${distanceFormat.format(km)} km`,
  duration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} phút`;
    return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
  },
} as const;
