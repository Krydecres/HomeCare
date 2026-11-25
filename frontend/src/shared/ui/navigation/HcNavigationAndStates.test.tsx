import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { HcInstallPwaBanner } from '../feedback/HcInstallPwaBanner';
import { HcPermissionState } from '../feedback/HcPermissionState';
import { HcEmptyState } from '../states/HcEmptyState';
import { HcErrorState } from '../states/HcErrorState';
import { HcLoading } from '../states/HcLoading';
import { HcBottomSheet } from './HcBottomSheet';
import { HcPageHeader } from './HcPageHeader';
import { HcSnackbar } from './HcSnackbar';
import { HcStepper } from './HcStepper';
import { HcTabs } from './HcTabs';

describe('HomeCare navigation, overlays, states, and feedback units (US-15-012)', () => {
  it('renders HcPageHeader with both onBack callback and Router Link modes', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <HcPageHeader title="Quản lý ca" subtitle="Tổng quan" onBack={onBack} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Quản lý ca' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onBack).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <HcPageHeader title="Chi tiết" backTo="/customer" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Quay lại' })).toHaveAttribute('href', '/customer');
  });

  it('switches tab panels in HcTabs and clamps bounds in HcStepper', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <HcStepper steps={['Chọn người thân', 'Chọn giờ', 'Xác nhận']} currentStep={99} />
        <HcTabs
          items={[
            { value: 'one', label: 'Đang chờ', count: 3, content: <div>Nội dung tab một</div> },
            { value: 'two', label: 'Hoàn thành', count: 5, content: <div>Nội dung tab hai</div> },
          ]}
          defaultValue="one"
        />
      </div>,
    );

    expect(screen.getByText('Bước 3/3')).toBeInTheDocument();
    expect(screen.getByText('Nội dung tab một')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Hoàn thành/ }));
    expect(screen.getByText('Nội dung tab hai')).toBeInTheDocument();
  });

  it('handles HcSnackbar closed/open states, danger alert role, action, and close callbacks', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onClose = vi.fn();

    const { rerender, container } = render(<HcSnackbar open={false} message="Ẩn" />);
    expect(container).toBeEmptyDOMElement();

    rerender(
      <HcSnackbar
        open
        tone="danger"
        message="Mất kết nối máy chủ"
        actionLabel="Thử lại"
        onAction={onAction}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Mất kết nối máy chủ');
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders open HcBottomSheet and dismisses cleanly', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <HcBottomSheet open onOpenChange={onOpenChange} title="Chọn ca" description="Danh sách ca khả dụng">
        <p>Nội dung sheet</p>
      </HcBottomSheet>,
    );

    expect(screen.getByRole('dialog', { name: 'Chọn ca' })).toBeInTheDocument();
    expect(screen.getByText('Nội dung sheet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders HcLoading variants, HcEmptyState, HcErrorState, prompt HcPermissionState, and iOS HcInstallPwaBanner', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onRequestPerm = vi.fn();

    render(
      <div>
        <HcLoading variant="cards" lines={2} />
        <HcLoading variant="table" lines={2} />
        <HcEmptyState title="Trống" hint="Chưa có dữ liệu" />
        <HcErrorState title="Lỗi tải" onRetry={onRetry} />
        <HcPermissionState permission="geolocation" status="prompt" onRequest={onRequestPerm} />
        <HcInstallPwaBanner platform="ios" onDismiss={vi.fn()} />
      </div>,
    );

    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Trống')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cho phép truy cập' }));
    expect(onRequestPerm).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/Safari iPhone/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cài đặt ngay' })).not.toBeInTheDocument();
  });
});
