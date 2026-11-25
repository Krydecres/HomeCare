import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HcChatBubble } from './HcChatBubble';
import { HcIcon } from './HcIcon';
import { HcListTile } from './HcListTile';
import { HcRatingStars } from './HcRatingStars';
import { HcSectionHeader } from './HcSectionHeader';
import { HcTimeline } from './HcTimeline';
import { HcVerifiedAvatar } from './HcVerifiedAvatar';

describe('HomeCare display components (US-15-012)', () => {
  it('renders decorative and labelled HcIcon properly for screen readers', () => {
    const { container } = render(
      <div>
        <HcIcon name="favorite" />
        <HcIcon name="verified" label="Đã xác minh chứng chỉ" />
      </div>,
    );

    const decorative = container.querySelector('[aria-hidden="true"]');
    expect(decorative).toHaveTextContent('favorite');
    expect(screen.getByRole('img', { name: 'Đã xác minh chứng chỉ' })).toHaveTextContent('verified');
  });

  it('extracts initials and displays verified badge in HcVerifiedAvatar', () => {
    render(
      <div>
        <HcVerifiedAvatar name="Nguyễn Thị Lan" verified />
        <HcVerifiedAvatar name="Minh" />
      </div>,
    );

    expect(screen.getByLabelText('Nguyễn Thị Lan')).toHaveTextContent('NL');
    expect(screen.getByLabelText('Minh')).toHaveTextContent('MI');
    expect(screen.getByLabelText('Đã xác minh')).toBeInTheDocument();
  });

  it('supports interactive clicks in HcListTile and renders HcSectionHeader slots', async () => {
    const user = userEvent.setup();
    const onTile = vi.fn();

    render(
      <div>
        <HcSectionHeader
          title="Hồ sơ điều dưỡng"
          subtitle="Danh sách đã xác minh"
          badge={<span>3 người</span>}
          action={<button type="button">Xem tất cả</button>}
        />
        <HcListTile title="Trần Văn Minh" subtitle="Hạng C3" onClick={onTile} chevron />
        <HcListTile title="Mục tĩnh" subtitle="Chỉ xem" />
      </div>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Hồ sơ điều dưỡng' })).toBeInTheDocument();
    expect(screen.getByText('3 người')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Trần Văn Minh/ }));
    expect(onTile).toHaveBeenCalledTimes(1);
  });

  it('renders chronological items in HcTimeline and masked warning in HcChatBubble', () => {
    render(
      <div>
        <HcTimeline
          items={[
            { id: '1', title: 'Bắt đầu ca', time: '08:00', actor: 'Điều dưỡng Minh', tone: 'success' },
            { id: '2', title: 'Đo huyết áp', time: '08:30', detail: '125/80 mmHg', tone: 'info' },
          ]}
        />
        <HcChatBubble
          side="theirs"
          senderName="Điều dưỡng Trần Văn Minh"
          message="Tôi đã tới cổng hẻm"
          timestamp="07:55"
          masked
        />
        <HcChatBubble side="mine" message="Vâng mời anh vào" timestamp="07:56" />
      </div>,
    );

    expect(screen.getByText('Bắt đầu ca')).toBeInTheDocument();
    expect(screen.getByText('125/80 mmHg')).toBeInTheDocument();
    expect(screen.getByText('Điều dưỡng Trần Văn Minh')).toBeInTheDocument();
    expect(screen.getByText(/Thông tin liên lạc được che/)).toBeInTheDocument();
  });

  it('supports both interactive star selection and read-only count display in HcRatingStars', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(<HcRatingStars value={3} onChange={onChange} label="Chọn số sao" />);
    const star4 = screen.getByRole('radio', { name: 'Đánh giá 4 trên 5 sao' });
    await user.click(star4);
    expect(onChange).toHaveBeenCalledWith(4);

    rerender(<HcRatingStars value={4.9} count={128} />);
    expect(screen.getByText('4,9')).toBeInTheDocument();
    expect(screen.getByText('(128)')).toBeInTheDocument();
  });
});
