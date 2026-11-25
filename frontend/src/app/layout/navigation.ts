import type { HcNavEntry } from '@/shared/ui/navigation/HcSideNav';

/**
 * Menus per role, exactly as 17_UI_Standards UI-10 (customer), UI-11 (caregiver), UI-13 (internal web).
 * Labels are i18n keys (src/i18n/vi.json); feature owners plug their pages into these paths (18_Code_Packages).
 */
type NavDef = Omit<HcNavEntry, 'label'> & { labelKey: string };

export const CUSTOMER_NAV: NavDef[] = [
  { to: '/customer', icon: 'home', labelKey: 'nav.home', end: true },
  { to: '/customer/bookings', icon: 'event_note', labelKey: 'nav.bookings' },
  { to: '/customer/care-recipients', icon: 'family_restroom', labelKey: 'nav.careRecipients' },
  { to: '/customer/notifications', icon: 'notifications', labelKey: 'nav.notifications' },
];

export const CAREGIVER_NAV: NavDef[] = [
  { to: '/caregiver', icon: 'home', labelKey: 'nav.home', end: true },
  { to: '/caregiver/schedule', icon: 'calendar_month', labelKey: 'nav.schedule' },
  { to: '/caregiver/earnings', icon: 'payments', labelKey: 'nav.earnings' },
  { to: '/caregiver/notifications', icon: 'notifications', labelKey: 'nav.notifications' },
];

export const DISPATCHER_NAV: NavDef[] = [
  { to: '/dispatch', icon: 'dashboard', labelKey: 'nav.dispatchBoard', end: true },
  { to: '/dispatch/incidents', icon: 'emergency', labelKey: 'nav.incidents' },
  { to: '/dispatch/complaints', icon: 'report', labelKey: 'nav.complaints' },
  { to: '/dispatch/assisted-booking', icon: 'support_agent', labelKey: 'nav.assistedBooking' },
];

export const ADMIN_NAV: NavDef[] = [
  { to: '/admin', icon: 'space_dashboard', labelKey: 'nav.overview', end: true },
  { to: '/admin/caregiver-review', icon: 'how_to_reg', labelKey: 'nav.caregiverReview' },
  { to: '/admin/partner-orgs', icon: 'local_hospital', labelKey: 'nav.partnerOrgs' },
  { to: '/admin/services', icon: 'sell', labelKey: 'nav.servicesPricing' },
  { to: '/admin/service-areas', icon: 'map', labelKey: 'nav.areasHospitals' },
  { to: '/admin/policies', icon: 'policy', labelKey: 'nav.policies' },
  { to: '/admin/users', icon: 'group', labelKey: 'nav.users' },
  { to: '/admin/audit-logs', icon: 'history', labelKey: 'nav.auditLog' },
  { to: '/admin/reports', icon: 'monitoring', labelKey: 'nav.reports' },
  { to: '/admin/moderation', icon: 'gavel', labelKey: 'nav.moderation' },
];

export const ACCOUNTANT_NAV: NavDef[] = [
  { to: '/accounting', icon: 'account_balance', labelKey: 'nav.reconciliation', end: true },
  { to: '/accounting/payouts', icon: 'payments', labelKey: 'nav.payouts' },
  { to: '/accounting/refunds', icon: 'currency_exchange', labelKey: 'nav.refunds' },
  { to: '/accounting/revenue', icon: 'bar_chart', labelKey: 'nav.revenue' },
];

export const PARTNER_NAV: NavDef[] = [
  { to: '/partner', icon: 'how_to_reg', labelKey: 'nav.staffApproval', end: true },
  { to: '/partner/role-change-requests', icon: 'swap_horiz', labelKey: 'nav.roleChangeRequests' },
  { to: '/partner/staff', icon: 'badge', labelKey: 'nav.affiliatedStaff' },
  { to: '/partner/revenue', icon: 'receipt_long', labelKey: 'nav.partnerRevenue' },
];

export type { NavDef };
