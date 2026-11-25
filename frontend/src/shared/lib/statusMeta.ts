/**
 * Status badge metadata maps (UI-40, UI-41, UI-43, UI-44, NM-0295).
 * Every enum value pairs Vietnamese text + semantic tone + Material Symbol icon (UI-24, UI-60).
 */
export type HcStatusTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export type HcStatusMeta = {
  label: string;
  tone: HcStatusTone;
  icon: string;
};

/** UI-40 BookingStatus (DD-0078). */
export const bookingStatusMeta = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', tone: 'warning', icon: 'schedule' },
  SEARCHING: { label: 'Đang tìm nhân viên', tone: 'info', icon: 'person_search' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'primary', icon: 'event_available' },
  IN_PROGRESS: { label: 'Đang chăm sóc', tone: 'success', icon: 'medical_services' },
  COMPLETED: { label: 'Hoàn thành', tone: 'neutral', icon: 'check_circle' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral', icon: 'cancel' },
  NO_MATCH: { label: 'Chưa tìm được nhân viên', tone: 'danger', icon: 'person_off' },
} as const satisfies Record<string, HcStatusMeta>;

/** UI-41 ShiftStatus (DD-0082). */
export const shiftStatusMeta = {
  SCHEDULED: { label: 'Đã lên lịch', tone: 'neutral', icon: 'event' },
  ASSIGNED: { label: 'Đã có nhân viên', tone: 'primary', icon: 'badge' },
  EN_ROUTE: { label: 'Đang đến', tone: 'info', icon: 'directions_car' },
  CHECKED_IN: { label: 'Đã đến nơi', tone: 'success', icon: 'location_on' },
  CHECKED_OUT: { label: 'Đã kết thúc ca', tone: 'info', icon: 'task_alt' },
  COMPLETED: { label: 'Hoàn thành', tone: 'neutral', icon: 'verified' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral', icon: 'cancel' },
  NO_SHOW: { label: 'Nhân viên không đến', tone: 'danger', icon: 'warning' },
  REPLACED: { label: 'Đã thay người', tone: 'warning', icon: 'swap_horiz' },
} as const satisfies Record<string, HcStatusMeta>;

/** UI-44 PartnerOrgStatus (DD-0060). */
export const partnerOrgStatusMeta = {
  PENDING_VERIFICATION: { label: 'Chờ xác minh', tone: 'info', icon: 'hourglass_top' },
  ACTIVE: { label: 'Hoạt động', tone: 'success', icon: 'verified' },
  SUSPENDED: { label: 'Tạm khóa', tone: 'danger', icon: 'block' },
  TERMINATED: { label: 'Ngừng hợp tác', tone: 'neutral', icon: 'domain_disabled' },
} as const satisfies Record<string, HcStatusMeta>;

/** UI-44 EarningStatus (DD-0113). */
export const earningStatusMeta = {
  PENDING: { label: 'Chờ', tone: 'warning', icon: 'hourglass_empty' },
  AVAILABLE: { label: 'Khả dụng', tone: 'success', icon: 'account_balance_wallet' },
  DISPUTED: { label: 'Đang khiếu nại', tone: 'danger', icon: 'gavel' },
  PAID_OUT: { label: 'Đã chi', tone: 'neutral', icon: 'payments' },
} as const satisfies Record<string, HcStatusMeta>;

/** UI-43 supplementary status maps for internal web workflows. */
export const urgencyMeta = {
  URGENT: { label: 'Gấp', tone: 'danger', icon: 'bolt' },
  HIGH: { label: 'Cao', tone: 'warning', icon: 'priority_high' },
  NORMAL: { label: 'Thường', tone: 'neutral', icon: 'schedule' },
} as const satisfies Record<string, HcStatusMeta>;

export const incidentPriorityMeta = {
  P1: { label: 'P1', tone: 'danger', icon: 'emergency' },
  P2: { label: 'P2', tone: 'warning', icon: 'warning' },
  P3: { label: 'P3', tone: 'info', icon: 'info' },
  P4: { label: 'P4', tone: 'neutral', icon: 'flag' },
} as const satisfies Record<string, HcStatusMeta>;

export const incidentStatusMeta = {
  OPEN: { label: 'Chưa xử lý', tone: 'danger', icon: 'error' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: 'warning', icon: 'pending' },
  CLOSED: { label: 'Đã đóng', tone: 'success', icon: 'check_circle' },
} as const satisfies Record<string, HcStatusMeta>;

export const serviceAreaStatusMeta = {
  ACTIVE: { label: 'Hoạt động', tone: 'success', icon: 'check_circle' },
  COMING_SOON: { label: 'Sắp mở', tone: 'info', icon: 'upcoming' },
  SUSPENDED: { label: 'Tạm ngưng', tone: 'danger', icon: 'pause_circle' },
} as const satisfies Record<string, HcStatusMeta>;

export const policyStatusMeta = {
  DRAFT: { label: 'Nháp', tone: 'neutral', icon: 'edit_note' },
  ACTIVE: { label: 'Đang áp dụng', tone: 'success', icon: 'check_circle' },
  EXPIRED: { label: 'Hết hiệu lực', tone: 'neutral', icon: 'history' },
} as const satisfies Record<string, HcStatusMeta>;
