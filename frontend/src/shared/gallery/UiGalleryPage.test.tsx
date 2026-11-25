import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/renderRoute';

describe('UiGalleryPage at /dev/ui (TC-US-15-012-7 & 8)', () => {
  it('renders all tabs, switches live elder mode class, and opens detail drawer from data table', async () => {
    const user = userEvent.setup();
    const { container } = (() => {
      renderRoute('/dev/ui');
      return { container: document.body };
    })();

    expect(
      await screen.findByRole('heading', { name: 'Bộ chuẩn giao diện HomeCare' }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Bảng màu chuẩn (UI-03 & UI-03b)')).toBeInTheDocument();

    const elderSwitch = screen.getByRole('switch', { name: /Chế độ người cao tuổi/ });
    expect(elderSwitch).toHaveAttribute('aria-checked', 'false');
    await user.click(elderSwitch);
    expect(container.querySelector('.hc-elder')).not.toBeNull();

    await user.click(screen.getByRole('tab', { name: /Nút & Điều hướng/ }));
    expect(screen.getByText(/Nút SOS khẩn cấp trong ca/)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Biểu mẫu & Nhập liệu/ }));
    expect(screen.getByRole('group', { name: /Mã xác thực OTP/ })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Thẻ nghiệp vụ & Y tế/ }));
    expect(screen.getAllByText('Bà Nguyễn Thị Lan').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('tab', { name: /Bảng, Biểu đồ & Trạng thái/ }));
    expect(screen.getByText('Lịch chăm sóc 7 ngày gần nhất')).toBeInTheDocument();
    expect(screen.getAllByText('BK-000123').length).toBeGreaterThan(0);

    const viewButtons = screen.getAllByRole('button', { name: 'Xem chi tiết' });
    await user.click(viewButtons[0]!);
    expect(screen.getByRole('heading', { name: /Chi tiết đơn BK-000123/ })).toBeInTheDocument();
  }, 15000);
});
