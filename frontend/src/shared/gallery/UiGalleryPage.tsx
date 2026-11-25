// Dev-only Design System & UI Kit Showcase – US-15-012 (NM-0195). No production WF-ID; route /dev/ui mounts only when import.meta.env.DEV.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@/shared/lib/statusMeta';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { HcDangerButton } from '@/shared/ui/buttons/HcDangerButton';
import { HcPrimaryButton } from '@/shared/ui/buttons/HcPrimaryButton';
import { HcSecondaryButton } from '@/shared/ui/buttons/HcSecondaryButton';
import { HcSosButton } from '@/shared/ui/buttons/HcSosButton';
import { HcTextButton } from '@/shared/ui/buttons/HcTextButton';
import { BookingCard } from '@/shared/ui/cards/BookingCard';
import { CaregiverCard } from '@/shared/ui/cards/CaregiverCard';
import { CareRecipientCard } from '@/shared/ui/cards/CareRecipientCard';
import { ShiftCard } from '@/shared/ui/cards/ShiftCard';
import { ShiftOfferCard } from '@/shared/ui/cards/ShiftOfferCard';
import { HcChatBubble } from '@/shared/ui/display/HcChatBubble';
import { HcIcon } from '@/shared/ui/display/HcIcon';
import { HcListTile } from '@/shared/ui/display/HcListTile';
import { HcRatingStars } from '@/shared/ui/display/HcRatingStars';
import { HcSectionHeader } from '@/shared/ui/display/HcSectionHeader';
import { HcStatusBadge } from '@/shared/ui/display/HcStatusBadge';
import { HcTimeline } from '@/shared/ui/display/HcTimeline';
import { HcVerifiedAvatar } from '@/shared/ui/display/HcVerifiedAvatar';
import { PriceBreakdownTable } from '@/shared/ui/display/PriceBreakdownTable';
import { AllergyAlert } from '@/shared/ui/domain/AllergyAlert';
import { HcEmergencyBanner } from '@/shared/ui/domain/HcEmergencyBanner';
import { HcLiveTrackingMap } from '@/shared/ui/domain/HcLiveTrackingMap';
import { HcMapPicker } from '@/shared/ui/domain/HcMapPicker';
import { HcMapView } from '@/shared/ui/domain/HcMapView';
import { VitalSignField } from '@/shared/ui/domain/VitalSignField';
import { HcInstallPwaBanner } from '@/shared/ui/feedback/HcInstallPwaBanner';
import { HcPermissionState } from '@/shared/ui/feedback/HcPermissionState';
import { HcCheckbox } from '@/shared/ui/inputs/HcCheckbox';
import { HcChip } from '@/shared/ui/inputs/HcChip';
import { HcDateTimePicker } from '@/shared/ui/inputs/HcDateTimePicker';
import { HcDropdown } from '@/shared/ui/inputs/HcDropdown';
import { HcFileUpload, type HcUploadedFile } from '@/shared/ui/inputs/HcFileUpload';
import { HcOtpField } from '@/shared/ui/inputs/HcOtpField';
import { HcPhoneField } from '@/shared/ui/inputs/HcPhoneField';
import { HcRadioOption } from '@/shared/ui/inputs/HcRadioOption';
import { HcSwitch } from '@/shared/ui/inputs/HcSwitch';
import { HcTextField } from '@/shared/ui/inputs/HcTextField';
import { HcBottomSheet } from '@/shared/ui/navigation/HcBottomSheet';
import { HcConfirmDialog } from '@/shared/ui/navigation/HcConfirmDialog';
import { HcPageHeader } from '@/shared/ui/navigation/HcPageHeader';
import { HcSnackbar } from '@/shared/ui/navigation/HcSnackbar';
import { HcStepper } from '@/shared/ui/navigation/HcStepper';
import { HcTabs, type HcTabItem } from '@/shared/ui/navigation/HcTabs';
import { HcEmptyState } from '@/shared/ui/states/HcEmptyState';
import { HcErrorState } from '@/shared/ui/states/HcErrorState';
import { HcLoading } from '@/shared/ui/states/HcLoading';
import { HcOfflineBanner } from '@/shared/ui/states/HcOfflineBanner';
import { HcBarChart } from '@/shared/ui/web/HcBarChart';
import { HcDataTable, type HcDataTableColumn } from '@/shared/ui/web/HcDataTable';
import { HcDataTableActionCell } from '@/shared/ui/web/HcDataTableActionCell';
import { HcDataTableBadgeCell } from '@/shared/ui/web/HcDataTableBadgeCell';
import { HcDataTableCell } from '@/shared/ui/web/HcDataTableCell';
import { HcDetailDrawer } from '@/shared/ui/web/HcDetailDrawer';
import { HcFilterBar } from '@/shared/ui/web/HcFilterBar';
import { HcKpiCard } from '@/shared/ui/web/HcKpiCard';
import { HcLineChart } from '@/shared/ui/web/HcLineChart';

type DemoBookingRow = {
  code: string;
  recipient: string;
  ward: string;
  caregiver: string;
  service: string;
  startAt: string;
  totalVnd: number;
  status: keyof typeof bookingStatusMeta;
};

const COLOR_SWATCHES = [
  { name: 'primary', cssVar: '--hc-color-primary', swatchClass: 'bg-hc-primary text-hc-on-primary' },
  { name: 'primarySubtle', cssVar: '--hc-color-primary-subtle', swatchClass: 'bg-hc-primary-subtle text-hc-primary' },
  { name: 'surface', cssVar: '--hc-color-surface', swatchClass: 'bg-hc-surface text-hc-text-primary' },
  { name: 'background', cssVar: '--hc-color-background', swatchClass: 'bg-hc-background text-hc-text-primary' },
  { name: 'success', cssVar: '--hc-color-success', swatchClass: 'bg-hc-success text-hc-on-primary' },
  { name: 'successSubtle', cssVar: '--hc-color-success-subtle', swatchClass: 'bg-hc-success-subtle text-hc-success' },
  { name: 'warning', cssVar: '--hc-color-warning', swatchClass: 'bg-hc-warning text-hc-on-primary' },
  { name: 'warningSubtle', cssVar: '--hc-color-warning-subtle', swatchClass: 'bg-hc-warning-subtle text-hc-warning' },
  { name: 'danger', cssVar: '--hc-color-danger', swatchClass: 'bg-hc-danger text-hc-on-primary' },
  { name: 'dangerSubtle', cssVar: '--hc-color-danger-subtle', swatchClass: 'bg-hc-danger-subtle text-hc-danger' },
  { name: 'info', cssVar: '--hc-color-info', swatchClass: 'bg-hc-info text-hc-on-primary' },
  { name: 'infoSubtle', cssVar: '--hc-color-info-subtle', swatchClass: 'bg-hc-info-subtle text-hc-info' },
] as const;

const STATUS_GROUPS: { title: string; entries: [string, HcStatusMeta][] }[] = [
  { title: 'UI-40 Lịch đặt', entries: Object.entries(bookingStatusMeta) },
  { title: 'UI-41 Ca làm việc', entries: Object.entries(shiftStatusMeta) },
  { title: 'UI-42 Bệnh viện đối tác', entries: Object.entries(partnerOrgStatusMeta) },
  { title: 'UI-43 Thu nhập & Chi trả', entries: Object.entries(earningStatusMeta) },
  { title: 'UI-44 Khẩn cấp', entries: Object.entries(urgencyMeta) },
  { title: 'UI-44 Mức độ sự cố', entries: Object.entries(incidentPriorityMeta) },
  { title: 'UI-44 Trạng thái sự cố', entries: Object.entries(incidentStatusMeta) },
  { title: 'UI-44 Khu vực phục vụ', entries: Object.entries(serviceAreaStatusMeta) },
  { title: 'UI-44 Chính sách & Giá', entries: Object.entries(policyStatusMeta) },
];

const DEMO_BOOKING_ROWS: DemoBookingRow[] = [
  {
    code: 'BK-000123',
    recipient: 'Bà Nguyễn Thị Lan (78 tuổi)',
    ward: 'Phường Quy Nhơn Nam',
    caregiver: 'Điều dưỡng Trần Văn Minh',
    service: 'Chăm sóc người cao tuổi tại nhà',
    startAt: '2026-11-26T01:00:00Z',
    totalVnd: 540000,
    status: 'IN_PROGRESS',
  },
  {
    code: 'BK-000124',
    recipient: 'Bé Na (3 tuần tuổi)',
    ward: 'Phường Quy Nhơn Bắc',
    caregiver: 'Điều dưỡng Lê Thu Hà',
    service: 'Chăm sóc mẹ và bé sau sinh',
    startAt: '2026-11-26T06:30:00Z',
    totalVnd: 680000,
    status: 'CONFIRMED',
  },
  {
    code: 'BK-000125',
    recipient: 'Ông Võ Thanh Sơn (69 tuổi)',
    ward: 'Phường Quy Nhơn Tây',
    caregiver: 'Đang ghép điều dưỡng',
    service: 'Theo dõi sau xuất viện',
    startAt: '2026-11-26T08:00:00Z',
    totalVnd: 460000,
    status: 'SEARCHING',
  },
  {
    code: 'BK-000126',
    recipient: 'Bà Đặng Thị Hoa (82 tuổi)',
    ward: 'Phường Quy Nhơn Nam',
    caregiver: 'Điều dưỡng Trần Văn Minh',
    service: 'Hỗ trợ sinh hoạt ban ngày',
    startAt: '2026-11-25T07:00:00Z',
    totalVnd: 520000,
    status: 'COMPLETED',
  },
  {
    code: 'BK-000127',
    recipient: 'Ông Huỳnh Văn Ba (74 tuổi)',
    ward: 'Phường Ghềnh Ráng',
    caregiver: 'Điều dưỡng Nguyễn Ngọc Ánh',
    service: 'Chăm sóc bệnh nhân tại viện',
    startAt: '2026-11-25T11:00:00Z',
    totalVnd: 920000,
    status: 'CANCELLED',
  },
];

const DEMO_LINE_DATA = [
  { day: 'T2', bookings: 18, completed: 16 },
  { day: 'T3', bookings: 24, completed: 21 },
  { day: 'T4', bookings: 22, completed: 20 },
  { day: 'T5', bookings: 29, completed: 26 },
  { day: 'T6', bookings: 34, completed: 31 },
  { day: 'T7', bookings: 38, completed: 35 },
  { day: 'CN', bookings: 31, completed: 29 },
];

const DEMO_BAR_DATA = [
  { ward: 'Quy Nhơn Nam', elderly: 14500000, postOp: 8200000 },
  { ward: 'Quy Nhơn Bắc', elderly: 9800000, postOp: 6400000 },
  { ward: 'Quy Nhơn Tây', elderly: 6100000, postOp: 4200000 },
  { ward: 'Ghềnh Ráng', elderly: 7300000, postOp: 5100000 },
];

export function UiGalleryPage() {
  const { t } = useTranslation();

  // Elder accessibility preview toggle (.hc-elder -> x1.25 scale)
  const [elderMode, setElderMode] = useState(false);

  // Actions & overlays state
  const [sosTriggeredCount, setSosTriggeredCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(2);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('Đã lưu thao tác mẫu');

  // Inputs state
  const [recipientNameInput, setRecipientNameInput] = useState('Bà Nguyễn Thị Lan');
  const [noteInput, setNoteInput] = useState('Cần hỗ trợ đo huyết áp buổi sáng và nhắc uống thuốc sau ăn.');
  const [phoneInput, setPhoneInput] = useState('0912345678');
  const [scheduleDate, setScheduleDate] = useState('2026-11-26T08:00');
  const [serviceChoice, setServiceChoice] = useState('elder-home');
  const [otpValue, setOtpValue] = useState('482');
  const [uploadedFiles, setUploadedFiles] = useState<HcUploadedFile[]>([
    { name: 'giay-ra-vien-bvdk-binh-dinh.pdf', sizeBytes: 428000 },
  ]);
  const [consentChecked, setConsentChecked] = useState(true);
  const [selectedShiftHours, setSelectedShiftHours] = useState('4h');
  const [selectedTags, setSelectedTags] = useState<string[]>(['hygiene', 'vitals']);
  const [ratingValue, setRatingValue] = useState(5);

  // Domain & medical state
  const [spo2Value, setSpo2Value] = useState('92');
  const [tempValue, setTempValue] = useState('37.9');
  const [pickedCoords, setPickedCoords] = useState({ lat: 13.7829, lng: 109.2196 });

  // Web & Data state
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'code',
    direction: 'asc',
  });
  const [page, setPage] = useState(1);
  const [drawerRow, setDrawerRow] = useState<DemoBookingRow | null>(null);

  const triggerToast = (msg: string) => {
    setSnackMessage(msg);
    setSnackOpen(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  };

  const filteredRows = DEMO_BOOKING_ROWS.filter((row) => {
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
    const q = tableSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      row.code.toLowerCase().includes(q) ||
      row.recipient.toLowerCase().includes(q) ||
      row.caregiver.toLowerCase().includes(q) ||
      row.ward.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  }).sort((a, b) => {
    const dir = sortState.direction === 'asc' ? 1 : -1;
    if (sortState.key === 'totalVnd') {
      return (a.totalVnd - b.totalVnd) * dir;
    }
    return a.code.localeCompare(b.code) * dir;
  });

  const handleSort = (key: string) => {
    setSortState((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  };

  const tableColumns: HcDataTableColumn<DemoBookingRow>[] = [
    {
      key: 'code',
      header: 'Mã đơn',
      sortable: true,
      nowrap: true,
      isRawTd: true,
      renderCell: (row) => (
        <HcDataTableCell numeric nowrap>
          {row.code}
        </HcDataTableCell>
      ),
      renderMobileValue: (row) => <span className="hc-tabular font-semibold">{row.code}</span>,
    },
    {
      key: 'recipient',
      header: 'Người cần chăm sóc',
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-hc-text-primary">{row.recipient}</span>
          <span className="text-hc-caption text-hc-text-secondary">
            {row.service} · {row.ward}
          </span>
        </div>
      ),
      renderMobileValue: (row) => `${row.recipient} · ${row.ward}`,
    },
    {
      key: 'startAt',
      header: 'Bắt đầu',
      nowrap: true,
      isRawTd: true,
      renderCell: (row) => (
        <HcDataTableCell nowrap muted>
          {AppFormatters.dateTime(row.startAt)}
        </HcDataTableCell>
      ),
      renderMobileValue: (row) => AppFormatters.dateTime(row.startAt),
    },
    {
      key: 'totalVnd',
      header: 'Thanh toán',
      align: 'right',
      sortable: true,
      nowrap: true,
      isRawTd: true,
      renderCell: (row) => (
        <HcDataTableCell align="right" numeric nowrap>
          {AppFormatters.money(row.totalVnd)}
        </HcDataTableCell>
      ),
      renderMobileValue: (row) => <span className="hc-tabular font-semibold">{AppFormatters.money(row.totalVnd)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      nowrap: true,
      isRawTd: true,
      renderCell: (row) => {
        const meta = bookingStatusMeta[row.status];
        return <HcDataTableBadgeCell label={meta.label} tone={meta.tone} icon={meta.icon} />;
      },
      renderMobileValue: (row) => {
        const meta = bookingStatusMeta[row.status];
        return <HcStatusBadge label={meta.label} tone={meta.tone} icon={meta.icon} />;
      },
    },
    {
      key: 'actions',
      header: t('ui.tableActions'),
      align: 'right',
      nowrap: true,
      isRawTd: true,
      hideOnMobile: true,
      renderCell: (row) => (
        <HcDataTableActionCell
          primaryLabel={t('ui.viewDetails')}
          primaryIcon="visibility"
          onPrimaryClick={() => setDrawerRow(row)}
          overflowActions={[
            {
              label: 'Sao chép mã đơn',
              icon: 'content_copy',
              onClick: () => triggerToast(`Đã chọn đơn ${row.code}`),
            },
            {
              label: 'Đánh dấu cần kiểm tra',
              icon: 'flag',
              tone: 'danger',
              onClick: () => triggerToast(`Đã gắn cờ kiểm tra ${row.code}`),
            },
          ]}
        />
      ),
    },
  ];

  const tabs: HcTabItem[] = [
    {
      value: 'foundations',
      label: t('gallery.tabFoundations'),
      icon: 'palette',
      content: (
        <div className="flex flex-col gap-hc-lg">
          <p className="m-0 rounded-hc-sm border border-hc-border bg-hc-primary-subtle px-hc-md py-hc-ms text-hc-body text-hc-text-primary">
            {t('gallery.overviewHint')}
          </p>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.colorTokensTitle')} />
            <div className="grid grid-cols-2 gap-hc-ms sm:grid-cols-3 lg:grid-cols-4">
              {COLOR_SWATCHES.map((swatch) => (
                <article
                  key={swatch.name}
                  className="flex flex-col overflow-hidden rounded-hc-sm border border-hc-border bg-hc-surface shadow-hc-card"
                >
                  <div
                    className={`flex h-16 items-end px-hc-ms py-hc-sm text-hc-caption font-semibold ${swatch.swatchClass}`}
                  >
                    <span>{swatch.name}</span>
                  </div>
                  <div className="px-hc-ms py-hc-sm">
                    <code className="text-hc-caption text-hc-text-secondary">{swatch.cssVar}</code>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.typographyTitle')} />
            <div className="flex flex-col gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface p-hc-lg shadow-hc-card">
              <p className="m-0 text-hc-display text-hc-text-primary">Display 28/700 · Chăm sóc tận tâm tại nhà</p>
              <p className="m-0 text-hc-title text-hc-text-primary">Title 20/600 · Bà Nguyễn Thị Lan, 78 tuổi</p>
              <p className="m-0 text-hc-subtitle text-hc-text-primary">Subtitle 18/600 · Ca sáng 08:00 – 12:00</p>
              <p className="m-0 text-hc-body text-hc-text-primary">
                Body 16/400 · Điều dưỡng thuộc bệnh viện đối tác đã xác minh chứng chỉ hành nghề và hồ sơ sức khỏe.
              </p>
              <p className="hc-tabular m-0 text-hc-caption text-hc-text-secondary">
                Caption 13/400 & Tabular · {AppFormatters.dateTime('2026-11-26T01:00:00Z')} ·{' '}
                {AppFormatters.money(1250000)} · {AppFormatters.phone('0912345678')} · {AppFormatters.distanceKm(2.3)} ·{' '}
                {AppFormatters.duration(270)}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.statusMapsTitle')} />
            <div className="grid grid-cols-1 gap-hc-md md:grid-cols-2 lg:grid-cols-3">
              {STATUS_GROUPS.map((group) => (
                <article
                  key={group.title}
                  className="flex flex-col gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card"
                >
                  <h3 className="m-0 text-hc-subtitle text-hc-text-primary">{group.title}</h3>
                  <div className="flex flex-wrap gap-hc-sm">
                    {group.entries.map(([key, meta]) => (
                      <HcStatusBadge key={key} label={meta.label} tone={meta.tone} icon={meta.icon} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ),
    },
    {
      value: 'actions',
      label: t('gallery.tabActions'),
      icon: 'touch_app',
      content: (
        <div className="flex flex-col gap-hc-lg">
          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.buttonsTitle')} />
            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <article className="flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
                <div className="flex flex-wrap items-center gap-hc-sm">
                  <HcPrimaryButton icon="add" onClick={() => triggerToast('Đã bấm nút Chính')}>
                    Đặt lịch chăm sóc
                  </HcPrimaryButton>
                  <HcSecondaryButton icon="schedule" onClick={() => triggerToast('Đã bấm nút Phụ')}>
                    Xem lịch ca
                  </HcSecondaryButton>
                  <HcDangerButton icon="cancel" onClick={() => setConfirmOpen(true)}>
                    Hủy đơn đặt
                  </HcDangerButton>
                </div>
                <div className="flex flex-wrap items-center gap-hc-sm">
                  <HcPrimaryButton dense loading>
                    Đang xử lý
                  </HcPrimaryButton>
                  <HcSecondaryButton dense disabled>
                    Tạm khóa
                  </HcSecondaryButton>
                  <HcTextButton icon="info" onClick={() => triggerToast('Chính sách hoàn hủy 24 giờ')}>
                    Xem quy định
                  </HcTextButton>
                  <HcTextButton icon="delete" tone="danger" onClick={() => setConfirmOpen(true)}>
                    Xóa nháp
                  </HcTextButton>
                </div>
              </article>

              <article className="flex flex-col justify-between gap-hc-sm rounded-hc-sm border border-hc-danger bg-hc-danger-subtle p-hc-md">
                <div className="flex flex-col gap-hc-xs">
                  <h3 className="m-0 text-hc-subtitle text-hc-danger">Nút SOS khẩn cấp trong ca (UI-21)</h3>
                  <p className="m-0 text-hc-body text-hc-text-primary">
                    Nhấn giữ 3 giây (hoặc Enter/Space) để kích hoạt cảnh báo an toàn tức thì. Đã kích hoạt:{' '}
                    <strong className="hc-tabular">{sosTriggeredCount}</strong> lần.
                  </p>
                </div>
                <HcSosButton
                  holdMs={1200}
                  onActivate={() => {
                    setSosTriggeredCount((c) => c + 1);
                    triggerToast('Đã phát tín hiệu SOS khẩn cấp tới điều phối viên!');
                  }}
                />
              </article>
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.navigationTitle')} />
            <div className="flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
              <HcStepper
                steps={['Chọn người thân', 'Chọn dịch vụ & giờ', 'Xác nhận chi phí', 'Thanh toán']}
                currentStep={stepIndex}
              />
              <div className="flex flex-wrap items-center gap-hc-sm">
                <HcSecondaryButton dense disabled={stepIndex <= 1} onClick={() => setStepIndex((s) => s - 1)}>
                  Bước trước
                </HcSecondaryButton>
                <HcPrimaryButton dense disabled={stepIndex >= 4} onClick={() => setStepIndex((s) => s + 1)}>
                  Bước tiếp theo
                </HcPrimaryButton>
                <HcSecondaryButton dense icon="bottom_sheets" onClick={() => setSheetOpen(true)}>
                  Mở Bottom Sheet
                </HcSecondaryButton>
                <HcSecondaryButton dense icon="verified_user" onClick={() => setConfirmOpen(true)}>
                  Mở Hộp thoại xác nhận
                </HcSecondaryButton>
                <HcSecondaryButton
                  dense
                  icon="notifications_active"
                  onClick={() => triggerToast('Điều dưỡng Trần Văn Minh đã nhận ca BK-000123')}
                >
                  Hiện Snackbar
                </HcSecondaryButton>
              </div>
            </div>

            <HcSnackbar
              open={snackOpen}
              message={snackMessage}
              tone="success"
              actionLabel="Hoàn tác"
              onAction={() => setSnackOpen(false)}
              onClose={() => setSnackOpen(false)}
            />
          </section>
        </div>
      ),
    },
    {
      value: 'inputs',
      label: t('gallery.tabInputs'),
      icon: 'edit_note',
      content: (
        <div className="grid grid-cols-1 gap-hc-lg lg:grid-cols-2">
          <section className="flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
            <HcSectionHeader title={t('gallery.inputsTitle')} />
            <HcTextField
              label="Họ tên người cần chăm sóc"
              required
              leadingIcon="person"
              value={recipientNameInput}
              onChange={(e) => setRecipientNameInput(e.target.value)}
              hint="Ví dụ: Bà Nguyễn Thị Lan, 78 tuổi"
            />
            <HcPhoneField
              label="Số điện thoại người đặt"
              required
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            <HcDateTimePicker
              label="Thời gian bắt đầu ca"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <HcDropdown
              label="Loại hình dịch vụ"
              required
              value={serviceChoice}
              onValueChange={setServiceChoice}
              options={[
                {
                  value: 'elder-home',
                  label: 'Chăm sóc người cao tuổi tại nhà',
                  description: 'Hỗ trợ sinh hoạt & đo sinh hiệu',
                },
                { value: 'post-op', label: 'Chăm sóc sau phẫu thuật', description: 'Điều dưỡng viên C2 trở lên' },
                {
                  value: 'maternity',
                  label: 'Chăm sóc mẹ và bé sau sinh',
                  description: 'Bé Na – tắm bé & theo dõi vàng da',
                },
              ]}
            />
            <HcTextField
              label="Lưu ý chăm sóc đặc biệt"
              multiline
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <HcOtpField
              label="Mã xác thực OTP bàn giao ca"
              required
              value={otpValue}
              onChange={setOtpValue}
              hint="Hỗ trợ dán đủ 6 chữ số cùng lúc"
            />
          </section>

          <section className="flex flex-col gap-hc-md rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
            <HcSectionHeader title={t('gallery.selectorsTitle')} />

            <div className="flex flex-col gap-hc-xs">
              <span className="text-hc-caption font-semibold text-hc-text-primary">Nhu cầu hỗ trợ (HcChip)</span>
              <div className="flex flex-wrap gap-hc-sm">
                {[
                  { id: 'hygiene', label: 'Vệ sinh cá nhân', icon: 'clean_hands', count: 2 },
                  { id: 'vitals', label: 'Đo huyết áp & SpO₂', icon: 'monitor_heart' },
                  { id: 'meals', label: 'Hỗ trợ ăn uống', icon: 'restaurant' },
                  { id: 'rehab', label: 'Tập vận động nhẹ', icon: 'accessibility_new' },
                ].map((chip) => (
                  <HcChip
                    key={chip.id}
                    label={chip.label}
                    icon={chip.icon}
                    count={chip.count}
                    selected={selectedTags.includes(chip.id)}
                    onClick={() => toggleTag(chip.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-hc-sm" role="radiogroup" aria-label="Thời lượng ca mẫu">
              <span className="text-hc-caption font-semibold text-hc-text-primary">
                Chọn gói thời lượng (HcRadioOption)
              </span>
              <HcRadioOption
                name="shift-duration"
                value="4h"
                checked={selectedShiftHours === '4h'}
                onChange={setSelectedShiftHours}
                title="Ca tiêu chuẩn 4 giờ"
                description="Phù hợp chăm sóc buổi sáng hoặc chiều"
                trailing={<span className="hc-tabular font-bold text-hc-primary">{AppFormatters.money(540000)}</span>}
              />
              <HcRadioOption
                name="shift-duration"
                value="8h"
                checked={selectedShiftHours === '8h'}
                onChange={setSelectedShiftHours}
                title="Ca cả ngày 8 giờ"
                description="Điều dưỡng theo sát lịch uống thuốc & ăn uống"
                trailing={<span className="hc-tabular font-bold text-hc-primary">{AppFormatters.money(960000)}</span>}
              />
            </div>

            <HcFileUpload
              label="Giấy ra viện / Đơn thuốc đính kèm"
              files={uploadedFiles}
              maxSizeMb={10}
              onFilesAdd={(added) =>
                setUploadedFiles((prev) => [...prev, ...added.map((f) => ({ name: f.name, sizeBytes: f.size }))])
              }
              onFileRemove={(idx) => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
            />

            <HcCheckbox
              label="Tôi xác nhận HomeCare không thay thế dịch vụ cấp cứu 115"
              description="Đồng ý điều khoản bảo mật hồ sơ sức khỏe người thân"
              checked={consentChecked}
              onCheckedChange={setConsentChecked}
            />

            <HcRatingStars
              label="Đánh giá chất lượng ca chăm sóc"
              value={ratingValue}
              onChange={setRatingValue}
              count={42}
            />
          </section>
        </div>
      ),
    },
    {
      value: 'domain',
      label: t('gallery.tabDomain'),
      icon: 'medical_services',
      content: (
        <div className="flex flex-col gap-hc-lg">
          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.medicalAlertsTitle')} />
            <div className="flex flex-col gap-hc-sm">
              <HcEmergencyBanner />
              <HcEmergencyBanner hospitalMode departmentName="Khoa Lão – BVĐK Tỉnh Gia Lai" />
              <AllergyAlert
                allergies={['Penicillin (phát ban nặng)', 'Sữa bò nguyên kem']}
                ppeWarning="Cần đeo khẩu trang N95 khi chăm sóc do người bệnh đang giảm miễn dịch."
              />
            </div>
            <div className="grid grid-cols-1 gap-hc-md md:grid-cols-2">
              <VitalSignField
                label="Nồng độ oxy máu (SpO₂)"
                unit="%"
                value={spo2Value}
                onChange={setSpo2Value}
                warnLow={94}
                dangerLow={90}
                required
              />
              <VitalSignField
                label="Nhiệt độ cơ thể"
                unit="°C"
                value={tempValue}
                onChange={setTempValue}
                warnHigh={37.5}
                dangerHigh={39}
                required
              />
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.cardsTitle')} />
            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <CareRecipientCard
                fullName="Bà Nguyễn Thị Lan"
                ageLabel="78 tuổi"
                relationship="Mẹ ruột · Anh Phạm Minh Tuấn đặt hộ"
                addressSummary="Phường Quy Nhơn Nam, Gia Lai"
                mobilityLabel="Đi lại cần gậy chống, cần hỗ trợ đứng lên"
                livesAlone
                hasAllergies
              />
              <CaregiverCard
                displayName="Điều dưỡng Trần Văn Minh"
                roleTitle="Điều dưỡng viên · BVĐK Tỉnh Gia Lai"
                level="Hạng C3"
                rating={4.9}
                reviewCount={128}
                yearsExperience={7}
                distanceKm={2.3}
                verifiedBadges={['Chứng chỉ hành nghề', 'Đào tạo sơ cứu', 'Khám sức khỏe 2026']}
              />
              <BookingCard
                bookingCode="BK-000123"
                serviceName="Chăm sóc người cao tuổi tại nhà"
                recipientName="Bà Nguyễn Thị Lan"
                wardName="Phường Quy Nhơn Nam, Gia Lai"
                startAt="2026-11-26T01:00:00Z"
                durationMinutes={270}
                totalVnd={540000}
                status="IN_PROGRESS"
                urgency="HIGH"
                caregiverName="Điều dưỡng Trần Văn Minh"
                actions={
                  <HcSecondaryButton dense icon="visibility" onClick={() => setDrawerRow(DEMO_BOOKING_ROWS[0] ?? null)}>
                    {t('ui.viewDetails')}
                  </HcSecondaryButton>
                }
              />
              <ShiftOfferCard
                serviceName="Chăm sóc mẹ và bé sau sinh (Bé Na, 3 tuần tuổi)"
                startAt="2026-11-26T07:00:00Z"
                endAt="2026-11-26T11:00:00Z"
                wardName="Phường Quy Nhơn Nam"
                distanceKm={2.3}
                estimatedNetVnd={480000}
                expiresInLabel="Còn 04:30"
                recipientSummary="Bé Na 3 tuần tuổi · Mẹ sinh thường"
                safetyWarnings={['Đo thân nhiệt trước vào phòng', 'Bé sơ sinh 3 tuần']}
                onAccept={() => triggerToast('Đã nhận ca chăm sóc Bé Na!')}
                onDecline={() => triggerToast('Đã từ chối đề nghị ca')}
              />
            </div>

            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <ShiftCard
                shiftCode="CA-000451"
                serviceName="Chăm sóc buổi sáng · BK-000123"
                recipientName="Bà Nguyễn Thị Lan"
                locationLabel="Phường Quy Nhơn Nam, Gia Lai"
                startAt="2026-11-26T01:00:00Z"
                endAt="2026-11-26T05:30:00Z"
                status="CHECKED_IN"
                caregiverName="Điều dưỡng Trần Văn Minh"
              />
              <PriceBreakdownTable
                items={[
                  { label: 'Phí chăm sóc cơ bản (4 giờ 30 phút)', amountVnd: 500000 },
                  { label: 'Phụ phí khung giờ cao điểm', amountVnd: 60000, tone: 'surcharge' },
                  {
                    label: 'Ưu đãi khách hàng thân thiết',
                    note: 'Áp dụng gói tháng',
                    amountVnd: -20000,
                    tone: 'discount',
                  },
                ]}
                totalVnd={540000}
                policyNote="Hoàn 100% nếu hủy trước giờ bắt đầu 24 giờ."
              />
            </div>

            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
                <h3 className="m-0 text-hc-subtitle text-hc-text-primary">Nhật ký & Thảo luận ca</h3>
                <HcTimeline
                  items={[
                    {
                      id: '1',
                      title: 'Điều dưỡng check-in tại nhà',
                      time: '08:00',
                      actor: 'Điều dưỡng Trần Văn Minh',
                      tone: 'success',
                      icon: 'check_circle',
                    },
                    {
                      id: '2',
                      title: 'Đo huyết áp 130/80 mmHg · Nhắc uống thuốc sáng',
                      time: '08:25',
                      detail: 'Tình trạng tỉnh táo, ăn hết phần cháo.',
                      tone: 'info',
                      icon: 'monitor_heart',
                    },
                    {
                      id: '3',
                      title: 'Dự kiến bàn giao ca với Anh Phạm Minh Tuấn',
                      time: '12:30',
                      tone: 'neutral',
                      icon: 'schedule',
                    },
                  ]}
                />
              </article>
              <article className="flex flex-col gap-hc-ms rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
                <h3 className="m-0 text-hc-subtitle text-hc-text-primary">Tin nhắn bảo mật (che SĐT/địa chỉ)</h3>
                <HcChatBubble
                  side="theirs"
                  senderName="Điều dưỡng Trần Văn Minh"
                  message="Tôi đã tới cổng hẻm tại phường Quy Nhơn Nam, liên hệ qua HomeCare để vào nhà."
                  timestamp="07:55"
                  masked
                />
                <HcChatBubble
                  side="mine"
                  senderName="Anh Phạm Minh Tuấn"
                  message="Vâng, bà Lan đang ở phòng khách tầng trệt, cửa đã mở sẵn ạ."
                  timestamp="07:57"
                />
                <HcListTile
                  leading={<HcVerifiedAvatar name="Điều dưỡng Trần Văn Minh" verified size="sm" />}
                  title="Hồ sơ năng lực đối tác"
                  subtitle="Xác minh bởi Bệnh viện Đa khoa Tỉnh Gia Lai"
                  chevron
                  onClick={() => triggerToast('Mở hồ sơ Điều dưỡng Trần Văn Minh')}
                />
              </article>
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.mapsTitle')} />
            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-3">
              <HcMapView
                latitude={13.7829}
                longitude={109.2196}
                label="Bệnh viện Đa khoa Tỉnh"
                geofenceRadiusMeters={250}
              />
              <HcMapPicker
                latitude={pickedCoords.lat}
                longitude={pickedCoords.lng}
                defaultLatitude={13.7829}
                defaultLongitude={109.2196}
                addressLabel="Phường Quy Nhơn Nam, Gia Lai"
                onChange={(lat, lng) => setPickedCoords({ lat, lng })}
              />
              <HcLiveTrackingMap
                caregiverLat={13.7765}
                caregiverLng={109.2241}
                destinationLat={13.7829}
                destinationLng={109.2196}
                caregiverLabel="Điều dưỡng Trần Văn Minh"
                destinationLabel="Nhà Bà Nguyễn Thị Lan"
                distanceKm={1.2}
                etaMinutes={6}
                lastUpdatedAt="2026-11-26T00:55:00Z"
              />
            </div>
          </section>
        </div>
      ),
    },
    {
      value: 'web',
      label: t('gallery.tabWeb'),
      icon: 'analytics',
      content: (
        <div className="flex flex-col gap-hc-lg">
          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.kpiAndChartsTitle')} />
            <div className="grid grid-cols-1 gap-hc-ms sm:grid-cols-2 lg:grid-cols-4">
              <HcKpiCard
                label="Tổng đơn trong tuần"
                value={196}
                icon="calendar_month"
                tone="primary"
                delta={{ value: '+14%', tone: 'up', label: 'so với tuần trước' }}
                active={statusFilter === 'ALL'}
                onClick={() => setStatusFilter('ALL')}
              />
              <HcKpiCard
                label="Ca đang diễn ra"
                value={24}
                icon="medical_services"
                tone="success"
                delta={{ value: '+3 ca', tone: 'up' }}
                active={statusFilter === 'IN_PROGRESS'}
                onClick={() => setStatusFilter('IN_PROGRESS')}
              />
              <HcKpiCard
                label="Chờ điều phối"
                value={7}
                icon="schedule"
                tone="warning"
                hint="Bấm để lọc danh sách"
                active={statusFilter === 'SEARCHING'}
                onClick={() => setStatusFilter('SEARCHING')}
              />
              <HcKpiCard
                label="Đơn đã hủy"
                value={2}
                icon="report_problem"
                tone="danger"
                delta={{ value: '-1', tone: 'down', label: 'giảm nhẹ' }}
                active={statusFilter === 'CANCELLED'}
                onClick={() => setStatusFilter('CANCELLED')}
              />
            </div>

            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <HcLineChart
                title="Lịch chăm sóc 7 ngày gần nhất"
                subtitle="So sánh tổng đơn đặt và số ca hoàn thành"
                data={DEMO_LINE_DATA}
                xKey="day"
                series={[
                  { dataKey: 'bookings', label: 'Đơn đặt mới', colorToken: 'primary' },
                  { dataKey: 'completed', label: 'Ca hoàn thành', colorToken: 'success' },
                ]}
              />
              <HcBarChart
                title="Doanh thu dịch vụ theo phường"
                subtitle="Đơn vị tính bằng VND (chỉ số minh họa)"
                data={DEMO_BAR_DATA}
                xKey="ward"
                valueFormatter={(v) => `${Math.round(v / 1000000)} tr`}
                series={[
                  { dataKey: 'elderly', label: 'Người cao tuổi', colorToken: 'primary', stacked: true },
                  { dataKey: 'postOp', label: 'Sau phẫu thuật', colorToken: 'info', stacked: true },
                ]}
              />
            </div>
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.tableAndDrawerTitle')} />
            <HcFilterBar
              search={tableSearch}
              onSearchChange={setTableSearch}
              searchLabel="Tìm nhanh mã đơn, bệnh nhân hoặc điều dưỡng"
              searchPlaceholder="VD: BK-000123, Bà Nguyễn Thị Lan…"
              activeFilterCount={statusFilter === 'ALL' ? 0 : 1}
              resultSummary={`${filteredRows.length} đơn phù hợp`}
              onReset={() => {
                setTableSearch('');
                setStatusFilter('ALL');
              }}
              actions={
                <HcPrimaryButton dense icon="add" onClick={() => triggerToast('Mở form tạo đơn hộ')}>
                  Tạo đơn mới
                </HcPrimaryButton>
              }
            >
              <div className="w-full md:w-56">
                <HcDropdown
                  label="Trạng thái"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'IN_PROGRESS', label: bookingStatusMeta.IN_PROGRESS.label },
                    { value: 'CONFIRMED', label: bookingStatusMeta.CONFIRMED.label },
                    { value: 'SEARCHING', label: bookingStatusMeta.SEARCHING.label },
                    { value: 'COMPLETED', label: bookingStatusMeta.COMPLETED.label },
                    { value: 'CANCELLED', label: bookingStatusMeta.CANCELLED.label },
                  ]}
                />
              </div>
            </HcFilterBar>

            <HcDataTable
              columns={tableColumns}
              rows={filteredRows}
              getRowKey={(row) => row.code}
              caption="Danh sách ca chăm sóc minh họa"
              sort={sortState}
              onSortChange={handleSort}
              selectedRowKey={drawerRow?.code}
              onRowClick={(row) => setDrawerRow(row)}
              mobileTitle={(row) => row.recipient}
              mobileStatus={(row) => (
                <HcStatusBadge
                  label={bookingStatusMeta[row.status].label}
                  tone={bookingStatusMeta[row.status].tone}
                  icon={bookingStatusMeta[row.status].icon}
                />
              )}
              mobileFooter={(row) => (
                <HcSecondaryButton dense icon="visibility" onClick={() => setDrawerRow(row)}>
                  {t('ui.viewDetails')}
                </HcSecondaryButton>
              )}
              pagination={{
                page,
                pageSize: 5,
                total: 12,
                onPageChange: setPage,
              }}
            />
          </section>

          <section className="flex flex-col gap-hc-md">
            <HcSectionHeader title={t('gallery.statesAndFeedbackTitle')} />
            <HcOfflineBanner
              pendingCount={2}
              snapshotAt="2026-11-26T00:45:00Z"
              onRetrySync={() => triggerToast('Đang đồng bộ 2 thay đổi khi ngoại tuyến…')}
            />
            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-2">
              <HcPermissionState
                permission="geolocation"
                status="prompt"
                onRequest={() => triggerToast('Đã yêu cầu quyền vị trí')}
              />
              <HcPermissionState permission="camera" status="denied" />
              <HcInstallPwaBanner
                platform="android"
                onInstall={() => triggerToast('Cài PWA Android')}
                onDismiss={() => {}}
              />
              <HcInstallPwaBanner platform="ios" onDismiss={() => {}} />
            </div>
            <div className="grid grid-cols-1 gap-hc-md lg:grid-cols-3">
              <HcLoading variant="rows" lines={3} />
              <HcEmptyState
                icon="event_busy"
                title="Chưa có lịch hẹn nào"
                hint="Đặt lịch mới để điều dưỡng hỗ trợ tận nhà."
              />
              <HcErrorState onRetry={() => triggerToast('Đang thử tải lại…')} />
            </div>
          </section>
        </div>
      ),
    },
  ];

  return (
    <div className={elderMode ? 'hc-elder min-h-screen bg-hc-background' : 'min-h-screen bg-hc-background'}>
      <main className="mx-auto flex w-full max-w-hc-content flex-col gap-hc-lg px-hc-md py-hc-lg md:px-hc-lg">
        <HcPageHeader
          title={t('gallery.title')}
          subtitle={t('gallery.subtitle')}
          badge={<HcStatusBadge label={t('gallery.devBadge')} tone="info" icon="construction" />}
          actions={
            <div className="w-full sm:w-auto">
              <HcSwitch label={t('gallery.elderToggle')} checked={elderMode} onCheckedChange={setElderMode} />
            </div>
          }
        />

        <HcTabs items={tabs} defaultValue="foundations" />
      </main>

      <HcConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        title="Xác nhận hủy đơn đặt BK-000123?"
        description="Theo chính sách hiện hành, hủy trước 24 giờ được hoàn 100% chi phí. Bạn có chắc muốn tiếp tục?"
        confirmLabel="Xác nhận hủy"
        onConfirm={() => {
          setConfirmOpen(false);
          triggerToast('Đã xác nhận thao tác trong hộp thoại');
        }}
      />

      <HcBottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Chọn nhanh điều dưỡng phù hợp"
        description="Hiển thị dạng trượt từ đáy trên điện thoại và hộp thoại ở giữa trên máy tính."
      >
        <div className="flex flex-col gap-hc-sm">
          <HcListTile
            leading={<HcVerifiedAvatar name="Điều dưỡng Trần Văn Minh" verified size="md" />}
            title="Điều dưỡng Trần Văn Minh · Hạng C3"
            subtitle="Cách 2,3 km · 4,9★ (128 đánh giá)"
            chevron
            onClick={() => {
              setSheetOpen(false);
              triggerToast('Đã chọn Điều dưỡng Trần Văn Minh');
            }}
          />
          <HcListTile
            leading={<HcVerifiedAvatar name="Điều dưỡng Lê Thu Hà" verified size="md" />}
            title="Điều dưỡng Lê Thu Hà · Hạng C2"
            subtitle="Cách 3,1 km · Chuyên chăm sóc mẹ và bé"
            chevron
            onClick={() => {
              setSheetOpen(false);
              triggerToast('Đã chọn Điều dưỡng Lê Thu Hà');
            }}
          />
        </div>
      </HcBottomSheet>

      <HcDetailDrawer
        open={drawerRow !== null}
        onOpenChange={(open) => {
          if (!open) setDrawerRow(null);
        }}
        title={drawerRow ? `Chi tiết đơn ${drawerRow.code}` : ''}
        subtitle={drawerRow ? `${drawerRow.recipient} · ${drawerRow.ward}` : undefined}
        badge={
          drawerRow ? (
            <HcStatusBadge
              label={bookingStatusMeta[drawerRow.status].label}
              tone={bookingStatusMeta[drawerRow.status].tone}
              icon={bookingStatusMeta[drawerRow.status].icon}
            />
          ) : undefined
        }
        footer={
          drawerRow ? (
            <>
              <HcSecondaryButton dense onClick={() => setDrawerRow(null)}>
                {t('ui.close')}
              </HcSecondaryButton>
              <HcPrimaryButton
                dense
                icon="check"
                onClick={() => {
                  const code = drawerRow.code;
                  setDrawerRow(null);
                  triggerToast(`Đã xác nhận kiểm tra đơn ${code}`);
                }}
              >
                Xác nhận điều phối
              </HcPrimaryButton>
            </>
          ) : undefined
        }
      >
        {drawerRow && (
          <div className="flex flex-col gap-hc-md">
            <HcListTile
              leading={<HcIcon name="medical_services" className="text-hc-primary" />}
              title={drawerRow.service}
              subtitle={`${drawerRow.caregiver} · ${AppFormatters.dateTime(drawerRow.startAt)}`}
            />
            <PriceBreakdownTable
              items={[{ label: drawerRow.service, amountVnd: drawerRow.totalVnd }]}
              totalVnd={drawerRow.totalVnd}
            />
            <HcTimeline
              items={[
                { id: 'd1', title: 'Đơn đặt đã xác nhận thanh toán', time: '07:15', tone: 'success', icon: 'payments' },
                {
                  id: 'd2',
                  title: `Phân công ${drawerRow.caregiver}`,
                  time: '07:30',
                  tone: 'primary',
                  icon: 'person_check',
                },
              ]}
            />
          </div>
        )}
      </HcDetailDrawer>
    </div>
  );
}
