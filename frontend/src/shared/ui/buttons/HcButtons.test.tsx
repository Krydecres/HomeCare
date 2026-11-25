import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HcDangerButton } from './HcDangerButton';
import { HcPrimaryButton } from './HcPrimaryButton';
import { HcSecondaryButton } from './HcSecondaryButton';
import { HcSosButton } from './HcSosButton';
import { HcTextButton } from './HcTextButton';

describe('HomeCare button family and 3s SOS hold safety button (TC-US-15-012-1)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Primary, Secondary, Danger, and Text buttons and handles loading/click states', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    const onDanger = vi.fn();
    const onText = vi.fn();

    render(
      <div>
        <HcPrimaryButton icon="add" onClick={onPrimary}>
          Đặt lịch
        </HcPrimaryButton>
        <HcPrimaryButton loading onClick={onPrimary}>
          Đang lưu
        </HcPrimaryButton>
        <HcSecondaryButton dense onClick={onSecondary}>
          Xem thêm
        </HcSecondaryButton>
        <HcDangerButton onClick={onDanger}>Hủy đơn</HcDangerButton>
        <HcTextButton tone="danger" onClick={onText}>
          Xóa nháp
        </HcTextButton>
      </div>,
    );

    const loadingBtn = screen.getByRole('button', { name: /Đang lưu/ });
    expect(loadingBtn).toBeDisabled();
    expect(loadingBtn).toHaveAttribute('aria-busy', 'true');

    await user.click(screen.getByRole('button', { name: /Đặt lịch/ }));
    await user.click(screen.getByRole('button', { name: /Xem thêm/ }));
    await user.click(screen.getByRole('button', { name: /Hủy đơn/ }));
    await user.click(screen.getByRole('button', { name: /Xóa nháp/ }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(onDanger).toHaveBeenCalledTimes(1);
    expect(onText).toHaveBeenCalledTimes(1);
  });

  it('requires full hold duration before firing HcSosButton and supports keyboard Enter hold', () => {
    vi.useFakeTimers();
    const onActivate = vi.fn();

    render(<HcSosButton floating={false} holdMs={1000} onActivate={onActivate} />);
    const sos = screen.getByRole('button', { name: /Giữ 3 giây để gửi SOS khẩn cấp/ });

    // Releasing before holdMs completes must NOT activate SOS
    fireEvent.pointerDown(sos);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onActivate).not.toHaveBeenCalled();
    fireEvent.pointerUp(sos);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onActivate).not.toHaveBeenCalled();

    // Holding full duration via keyboard Enter triggers SOS
    fireEvent.keyDown(sos, { key: 'Enter' });
    act(() => {
      vi.advanceTimersByTime(1050);
    });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});
