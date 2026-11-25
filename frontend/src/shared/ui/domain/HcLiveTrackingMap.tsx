import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { createMapPinIcon } from '@/shared/lib/mapIcons';
import { AppFormatters } from '@/shared/theme/AppFormatters';
import { AppColors } from '@/shared/theme/tokens';
import { HcIcon } from '../display/HcIcon';
import { HcStatusBadge } from '../display/HcStatusBadge';

/** UI-28 / UI-23b / US-08-001: live caregiver en-route tracking map with ETA and stale-ping timestamp. NM-0193. */
type HcLiveTrackingMapProps = {
  caregiverLat: number;
  caregiverLng: number;
  destinationLat: number;
  destinationLng: number;
  caregiverLabel: string;
  destinationLabel: string;
  distanceKm: number;
  etaMinutes: number;
  lastUpdatedAt: string | Date;
};

export function HcLiveTrackingMap({
  caregiverLat,
  caregiverLng,
  destinationLat,
  destinationLng,
  caregiverLabel,
  destinationLabel,
  distanceKm,
  etaMinutes,
  lastUpdatedAt,
}: HcLiveTrackingMapProps) {
  const { t } = useTranslation();
  const caregiverPos: [number, number] = [caregiverLat, caregiverLng];
  const destinationPos: [number, number] = [destinationLat, destinationLng];
  const center: [number, number] = [(caregiverLat + destinationLat) / 2, (caregiverLng + destinationLng) / 2];

  return (
    <section className="flex flex-col gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface p-hc-md shadow-hc-card">
      <div className="flex flex-wrap items-center justify-between gap-hc-sm">
        <div className="flex items-center gap-hc-sm">
          <HcStatusBadge
            label={`ETA ${AppFormatters.duration(etaMinutes)} · ${AppFormatters.distanceKm(distanceKm)}`}
            tone="info"
            icon="directions_car"
          />
        </div>
        <span className="hc-tabular flex items-center gap-hc-xs text-hc-caption text-hc-text-secondary">
          <HcIcon name="schedule" dense />
          <span>{t('ui.lastUpdated', { time: AppFormatters.time(lastUpdatedAt) })}</span>
        </span>
      </div>

      <div className="hc-map-frame h-hc-map w-full overflow-hidden rounded-hc-sm border border-hc-border bg-hc-neutral-subtle">
        <MapContainer center={center} zoom={14} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline
            positions={[caregiverPos, destinationPos]}
            pathOptions={{ color: AppColors.primary, dashArray: '6 6', weight: 3 }}
          />
          <Marker position={caregiverPos} icon={createMapPinIcon('success', 'N')}>
            <Popup>{caregiverLabel}</Popup>
          </Marker>
          <Marker position={destinationPos} icon={createMapPinIcon('danger', 'Đ')}>
            <Popup>{destinationLabel}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}
