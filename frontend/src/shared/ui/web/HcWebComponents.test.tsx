import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HcInstallPwaBanner } from '../feedback/HcInstallPwaBanner';
import { HcPermissionState } from '../feedback/HcPermissionState';
import { HcBottomSheet } from '../navigation/HcBottomSheet';
import { HcConfirmDialog } from '../navigation/HcConfirmDialog';
import { HcOfflineBanner } from '../states/HcOfflineBanner';
import { HcBarChart } from './HcBarChart';
import { HcDataTable, type HcDataTableColumn } from './HcDataTable';
import { HcDataTableActionCell } from './HcDataTableActionCell';
import { HcDataTableBadgeCell } from './HcDataTableBadgeCell';
import { HcDataTableCell } from './HcDataTableCell';
import { HcDetailDrawer } from './HcDetailDrawer';
import { HcDetailDrawerHeader } from './HcDetailDrawerHeader';
import { HcFilterBar } from './HcFilterBar';
import { HcKpiCard } from './HcKpiCard';
import { HcLineChart } from './HcLineChart';

type Row = { id: string; name: string; amount: number; statusLabel: string };

const SAMPLE_ROWS: Row[] = [
  { id: 'BK-000123', name: 'Bà Nguyễn Thị Lan', amount: 540000, statusLabel: 'Đang chăm sóc' },
  { id: 'BK-000124', name: 'Bé Na', amount: 680000, statusLabel: 'Đã xác nhận' },
];

describe('HomeCare web data, overlays, charts, and feedback components (TC-US-15-012-5 & 6)', () => {
  it('supports sorting, pagination, and non-bubbling action clicks in HcDataTable', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    const onPageChange = vi.fn();

    const columns: HcDataTableColumn<Row>[] = [
      {
        key: 'id',
        header: 'Mã đơn',
        sortable: true,
        isRawTd: true,
        renderCell: (row) => (
          <HcDataTableCell numeric nowrap>
            {row.id}
          </HcDataTableCell>
        ),
        renderMobileValue: (row) => row.id,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        isRawTd: true,
        renderCell: (row) => <HcDataTableBadgeCell label={row.statusLabel} tone="info" />,
        renderMobileValue: (row) => row.statusLabel,
      },
      {
        key: 'actions',
        header: 'Thao tác',
        isRawTd: true,
        hideOnMobile: true,
        renderCell: (row) => (
          <HcDataTableActionCell primaryLabel="Xem chi tiết" onPrimaryClick={() => onAction(row.id)} />
        ),
      },
    ];

    render(
      <HcDataTable
        columns={columns}
        rows={SAMPLE_ROWS}
        getRowKey={(r) => r.id}
        sort={{ key: 'id', direction: 'asc' }}
        onSortChange={onSort}
        onRowClick={onRowClick}
        pagination={{ page: 1, pageSize: 2, total: 6, onPageChange }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Mã đơn' }));
    expect(onSort).toHaveBeenCalledWith('id');

    const viewButtons = screen.getAllByRole('button', { name: 'Xem chi tiết' });
    await user.click(viewButtons[0]!);
    expect(onAction).toHaveBeenCalledWith('BK-000123');
    expect(onRowClick).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders HcKpiCard, HcFilterBar, and charts', async () => {
    const user = userEvent.setup();
    const onKpi = vi.fn();
    const onSearch = vi.fn();

    render(
      <div>
        <HcKpiCard label="Ca đang diễn ra" value={24} delta={{ value: '+14%', tone: 'up' }} active onClick={onKpi} />
        <HcFilterBar search="Lan" onSearchChange={onSearch} onReset={vi.fn()} />
        <HcLineChart
          title="Xu hướng đơn"
          data={[{ day: 'T2', total: 10 }]}
          xKey="day"
          series={[{ dataKey: 'total', label: 'Tổng đơn', colorToken: 'primary' }]}
        />
        <HcBarChart title="Doanh thu phường" data={[]} xKey="ward" series={[{ dataKey: 'amount', label: 'VND' }]} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /Ca đang diễn ra/ }));
    expect(onKpi).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('img', { name: 'Xu hướng đơn' })).toBeInTheDocument();
    expect(screen.getByText('Chưa có dữ liệu biểu đồ')).toBeInTheDocument();
  });

  it('opens and closes HcDetailDrawer cleanly', async () => {
    const user = userEvent.setup();
    const onDrawerClose = vi.fn();

    render(
      <HcDetailDrawer open onOpenChange={onDrawerClose} title="Chi tiết BK-000123">
        <p>Nội dung chi tiết</p>
      </HcDetailDrawer>,
    );

    expect(screen.getByRole('heading', { name: 'Chi tiết BK-000123' })).toBeInTheDocument();
    expect(screen.getByText('Nội dung chi tiết')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đóng khung chi tiết' }));
    expect(onDrawerClose).toHaveBeenCalledWith(false);
  });

  it('renders HcOfflineBanner, HcPermissionState, HcInstallPwaBanner, HcConfirmDialog, and HcBottomSheet', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onInstall = vi.fn();

    const { rerender } = render(
      <div>
        <HcBottomSheet open={false} onOpenChange={vi.fn()} title="Chọn nhanh">
          <span>Body</span>
        </HcBottomSheet>
        <HcOfflineBanner pendingCount={2} snapshotAt="2026-11-26T00:45:00Z" />
        <HcPermissionState permission="camera" status="denied" />
        <HcInstallPwaBanner platform="android" onInstall={onInstall} />
      </div>,
    );

    expect(screen.getByText(/2 thao tác đang chờ đồng bộ/)).toBeInTheDocument();
    expect(screen.getByText(/Quyền Máy ảnh đang bị chặn/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cài đặt ngay' }));
    expect(onInstall).toHaveBeenCalledTimes(1);

    rerender(
      <HcConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="Xác nhận hủy?"
        description="Thao tác này không thể hoàn tác"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('covers HcDataTable loading/error/empty states, HcDetailDrawerHeader standalone, HcFilterBar reset, and populated HcBarChart', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onReset = vi.fn();
    const onSearchChange = vi.fn();
    const onHeaderClose = vi.fn();
    const emptyCols: HcDataTableColumn<Row>[] = [{ key: 'id', header: 'Mã đơn', renderCell: (r) => r.id }];

    const { rerender } = render(
      <div>
        <HcDetailDrawerHeader title="Tiêu đề độc lập" subtitle="Phụ đề" onClose={onHeaderClose} />
        <HcFilterBar search="BK" onSearchChange={onSearchChange} activeFilterCount={2} onReset={onReset} />
        <HcBarChart
          title="Doanh thu tuần"
          data={[{ ward: 'Quy Nhơn Nam', amount: 1500000 }]}
          xKey="ward"
          valueFormatter={(v) => `${Math.round(v / 1000)}k`}
          series={[{ dataKey: 'amount', label: 'Doanh thu', colorToken: 'success', stacked: true }]}
        />
        <HcDataTable columns={emptyCols} rows={[]} getRowKey={(r) => r.id} loading />
      </div>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Tiêu đề độc lập' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đóng khung chi tiết' }));
    expect(onHeaderClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Xóa bộ lọc/ }));
    expect(onReset).toHaveBeenCalledTimes(1);

    await user.type(screen.getByRole('searchbox'), '1');
    expect(onSearchChange).toHaveBeenCalled();
    expect(screen.getByRole('img', { name: 'Doanh thu tuần' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<HcDataTable columns={emptyCols} rows={[]} getRowKey={(r) => r.id} error={{ onRetry }} />);
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<HcDataTable columns={emptyCols} rows={[]} getRowKey={(r) => r.id} empty={{ title: 'Không có đơn' }} />);
    expect(screen.getByText('Không có đơn')).toBeInTheDocument();
  });
});
