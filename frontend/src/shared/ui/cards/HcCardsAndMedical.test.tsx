import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingCard } from './BookingCard';
import { CaregiverCard } from './CaregiverCard';
import { CareRecipientCard } from './CareRecipientCard';
import { PriceBreakdownTable } from '../display/PriceBreakdownTable';
import { AllergyAlert } from '../domain/AllergyAlert';
import { HcEmergencyBanner } from '../domain/HcEmergencyBanner';
import { HcLiveTrackingMap } from '../domain/HcLiveTrackingMap';
import { HcMapPicker } from '../domain/HcMapPicker';
import { HcMapView } from '../domain/HcMapView';
import { VitalSignField } from '../domain/VitalSignField';
import { ShiftCard } from './ShiftCard';
import { ShiftOfferCard } from './ShiftOfferCard';

describe('HomeCare domain cards and medical safety widgets (TC-US-15-012-3 & 4)', () => {
  it('evaluates normal, warning, and danger states in VitalSignField', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <VitalSignField label="SpO2" unit="%" value="97" onChange={onChange} warnLow={94} dangerLow={90} />,
    );
    expect(screen.getByText('Bình thường')).toBeInTheDocument();

    rerender(<VitalSignField label="SpO2" unit="%" value="92" onChange={onChange} warnLow={94} dangerLow={90} />);
    expect(screen.getByText('Cần theo dõi')).toBeInTheDocument();

    rerender(<VitalSignField label="SpO2" unit="%" value="87" onChange={onChange} warnLow={94} dangerLow={90} />);
    expect(screen.getByText(/Nguy hiểm/)).toBeInTheDocument();
    expect(screen.getByLabelText('SpO2')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders AllergyAlert and both modes of HcEmergencyBanner', () => {
    const { rerender } = render(
      <div>
        <AllergyAlert allergies={['Penicillin']} ppeWarning="Đeo khẩu trang N95" />
        <HcEmergencyBanner />
      </div>,
    );

    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Đeo khẩu trang N95')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gọi 115/ })).toHaveAttribute('href', 'tel:115');

    rerender(<HcEmergencyBanner hospitalMode departmentName="Khoa Lão" />);
    expect(screen.getByText(/Khoa Lão/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Gọi 115/ })).not.toBeInTheDocument();
  });

  it('formats PriceBreakdownTable in VND using AppFormatters', () => {
    render(
      <PriceBreakdownTable
        items={[
          { label: 'Chăm sóc 4 giờ', amountVnd: 500000 },
          { label: 'Ưu đãi', amountVnd: -50000, tone: 'discount' },
        ]}
        totalVnd={450000}
        policyNote="Hoàn 100% trước 24h"
      />,
    );

    expect(screen.getByText('Chăm sóc 4 giờ')).toBeInTheDocument();
    expect(screen.getByText(/450\.000/)).toBeInTheDocument();
    expect(screen.getByText('Hoàn 100% trước 24h')).toBeInTheDocument();
  });

  it('preserves CK-12 / OQ-011 pre-acceptance privacy in ShiftOfferCard and displays BookingCard', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    render(
      <div>
        <BookingCard
          bookingCode="BK-000123"
          serviceName="Chăm sóc người cao tuổi tại nhà"
          recipientName="Bà Nguyễn Thị Lan"
          wardName="Phường Quy Nhơn Nam"
          startAt="2026-11-26T01:00:00Z"
          durationMinutes={270}
          totalVnd={540000}
          status="IN_PROGRESS"
          urgency="HIGH"
        />
        <ShiftOfferCard
          serviceName="Chăm sóc mẹ và bé"
          startAt="2026-11-26T07:00:00Z"
          endAt="2026-11-26T11:00:00Z"
          wardName="Phường Quy Nhơn Nam"
          distanceKm={2.3}
          estimatedNetVnd={480000}
          expiresInLabel="Còn 04:00"
          recipientSummary="Bé Na, 3 tuần tuổi"
          safetyWarnings={['Cần đo thân nhiệt']}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      </div>,
    );

    expect(screen.getByText('BK-000123')).toBeInTheDocument();
    expect(screen.getByText('Đang chăm sóc')).toBeInTheDocument();
    expect(screen.getByText('Bé Na, 3 tuần tuổi')).toBeInTheDocument();
    expect(screen.getByText(/2,3 km/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Nhận ca' }));
    expect(onAccept).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Từ chối' }));
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('renders ShiftCard, CaregiverCard, CareRecipientCard safety flags, and OSM map controls', async () => {
    const user = userEvent.setup();
    const onMapChange = vi.fn();

    render(
      <div>
        <ShiftCard
          shiftCode="CA-000451"
          serviceName="Ca sáng"
          recipientName="Bà Nguyễn Thị Lan"
          locationLabel="Phường Quy Nhơn Nam"
          startAt="2026-11-26T01:00:00Z"
          endAt="2026-11-26T05:00:00Z"
          status="CHECKED_IN"
          caregiverName="Điều dưỡng Trần Văn Minh"
        />
        <CaregiverCard
          displayName="Điều dưỡng Trần Văn Minh"
          roleTitle="Điều dưỡng viên"
          level="Hạng C3"
          rating={4.9}
          reviewCount={128}
          yearsExperience={7}
          distanceKm={2.3}
          verifiedBadges={['Chứng chỉ hành nghề']}
        />
        <CareRecipientCard
          fullName="Bà Nguyễn Thị Lan"
          ageLabel="78 tuổi"
          relationship="Mẹ ruột"
          addressSummary="Phường Quy Nhơn Nam"
          mobilityLabel="Dùng gậy chống"
          livesAlone
          hasAllergies
        />
        <HcMapView latitude={13.7829} longitude={109.2196} label="Bệnh viện tỉnh" geofenceRadiusMeters={200} />
        <HcMapPicker
          latitude={13.79}
          longitude={109.22}
          defaultLatitude={13.7829}
          defaultLongitude={109.2196}
          onChange={onMapChange}
        />
        <HcLiveTrackingMap
          caregiverLat={13.7765}
          caregiverLng={109.2241}
          destinationLat={13.7829}
          destinationLng={109.2196}
          caregiverLabel="Điều dưỡng Minh"
          destinationLabel="Nhà Bà Lan"
          distanceKm={1.2}
          etaMinutes={6}
          lastUpdatedAt="2026-11-26T00:55:00Z"
        />
      </div>,
    );

    expect(screen.getByText('CA-000451')).toBeInTheDocument();
    expect(screen.getByText('Đã đến nơi')).toBeInTheDocument();
    expect(screen.getByText('Hạng C3')).toBeInTheDocument();
    expect(screen.getByText('7 năm kinh nghiệm')).toBeInTheDocument();
    expect(screen.getByText('Sống một mình')).toBeInTheDocument();
    expect(screen.getByText('Cảnh báo dị ứng & an toàn')).toBeInTheDocument();
    expect(screen.getByText(/ETA 6 phút · 1,2 km/)).toBeInTheDocument();
    expect(screen.getByText(/Bệnh viện tỉnh/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Đặt lại ghim/ }));
    expect(onMapChange).toHaveBeenCalledWith(13.7829, 109.2196);
  });
});
