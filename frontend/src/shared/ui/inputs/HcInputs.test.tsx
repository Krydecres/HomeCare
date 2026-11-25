import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HcCheckbox } from './HcCheckbox';
import { HcChip } from './HcChip';
import { HcDateTimePicker } from './HcDateTimePicker';
import { HcDropdown } from './HcDropdown';
import { HcFileUpload } from './HcFileUpload';
import { HcOtpField } from './HcOtpField';
import { HcPhoneField } from './HcPhoneField';
import { HcRadioOption } from './HcRadioOption';
import { HcSwitch } from './HcSwitch';
import { HcTextField } from './HcTextField';

describe('HomeCare form input components (TC-US-15-012-2)', () => {
  it('renders HcTextField with label, required marker, error alert, and updates value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<HcTextField label="Họ và tên" required error="Vui lòng nhập họ tên" value="" onChange={onChange} />);

    const input = screen.getByLabelText(/Họ và tên/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập họ tên');

    await user.type(input, 'Lan');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports digit typing, paste splitting, and backspace in HcOtpField', () => {
    function ControlledOtp() {
      const [otp, setOtp] = useState('');
      return (
        <div>
          <HcOtpField label="Mã OTP" value={otp} onChange={setOtp} length={6} />
          <output data-testid="otp-value">{otp}</output>
        </div>
      );
    }

    render(<ControlledOtp />);
    const digit1 = screen.getByLabelText('Số OTP thứ 1');
    const digit2 = screen.getByLabelText('Số OTP thứ 2');

    fireEvent.paste(digit1, {
      clipboardData: { getData: () => '12a3456b' },
    });
    expect(screen.getByTestId('otp-value')).toHaveTextContent('123456');

    fireEvent.change(digit2, { target: { value: '9' } });
    expect(screen.getByTestId('otp-value')).toHaveTextContent('193456');

    const digit6 = screen.getByLabelText('Số OTP thứ 6');
    fireEvent.change(digit6, { target: { value: '' } });
    fireEvent.keyDown(digit6, { key: 'Backspace' });
    expect(screen.getByTestId('otp-value')).toHaveTextContent('1934');
  });

  it('toggles HcCheckbox, HcSwitch, HcRadioOption, and HcChip cleanly', async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    const onSwitch = vi.fn();
    const onRadio = vi.fn();
    const onChip = vi.fn();

    render(
      <div>
        <HcCheckbox label="Đồng ý điều khoản" checked={false} onCheckedChange={onChecked} />
        <HcSwitch label="Chế độ người cao tuổi" checked={false} onCheckedChange={onSwitch} />
        <HcRadioOption name="shift" value="4h" checked={false} onChange={onRadio} title="Ca 4 giờ" />
        <HcChip label="Đo sinh hiệu" selected={false} count={3} onClick={onChip} />
      </div>,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onChecked).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('switch'));
    expect(onSwitch).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('radio'));
    expect(onRadio).toHaveBeenCalledWith('4h');

    const chip = screen.getByRole('button', { name: /Đo sinh hiệu/ });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await user.click(chip);
    expect(onChip).toHaveBeenCalled();
  });

  it('lists uploaded files and triggers remove callback in HcFileUpload', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <HcFileUpload
        label="Giấy ra viện"
        files={[{ name: 'giay-ra-vien.pdf', sizeBytes: 256000 }]}
        onFilesAdd={vi.fn()}
        onFileRemove={onRemove}
      />,
    );

    expect(screen.getByText('giay-ra-vien.pdf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Gỡ tệp/ }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('renders HcPhoneField, HcDateTimePicker, and selects an option in HcDropdown', async () => {
    const user = userEvent.setup();
    const onPhone = vi.fn();
    const onDate = vi.fn();
    const onDropdown = vi.fn();

    render(
      <div>
        <HcPhoneField label="Số điện thoại" required value="0912345678" onChange={onPhone} />
        <HcDateTimePicker label="Ngày bắt đầu" mode="date" value="2026-11-26" onChange={onDate} />
        <HcDropdown
          label="Dịch vụ"
          placeholder="Chọn dịch vụ"
          onValueChange={onDropdown}
          options={[
            { value: 'elder', label: 'Chăm sóc người cao tuổi' },
            { value: 'baby', label: 'Chăm sóc mẹ và bé' },
          ]}
        />
      </div>,
    );

    const phoneInput = screen.getByLabelText(/Số điện thoại/);
    expect(phoneInput).toHaveAttribute('type', 'tel');
    await user.type(phoneInput, '9');
    expect(onPhone).toHaveBeenCalled();

    const dateInput = screen.getByLabelText(/Ngày bắt đầu/);
    expect(dateInput).toHaveAttribute('type', 'date');
    fireEvent.change(dateInput, { target: { value: '2026-11-27' } });
    expect(onDate).toHaveBeenCalled();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Chăm sóc mẹ và bé' }));
    expect(onDropdown).toHaveBeenCalledWith('baby');
  });
});
