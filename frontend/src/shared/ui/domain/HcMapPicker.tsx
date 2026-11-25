import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { createMapPinIcon } from '@/shared/lib/mapIcons';
import { HcTextButton } from '../buttons/HcTextButton';
import { HcIcon } from '../display/HcIcon';

/** UI-28 / UI-23b: interactive OpenStreetMap coordinate picker (click map or drag pin). NM-0193. */
type HcMapPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  defaultLatitude?: number;
  defaultLongitude?: number;
  addressLabel?: string;
};

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

export function HcMapPicker({
  latitude,
  longitude,
  onChange,
  defaultLatitude,
  defaultLongitude,
  addressLabel,
}: HcMapPickerProps) {
  const { t } = useTranslation();
  const center: [number, number] = [latitude, longitude];
  const pinIcon = createMapPinIcon('danger', '★');

  return (
    <div className="flex flex-col gap-hc-xs">
      <div className="hc-map-frame h-hc-map w-full overflow-hidden rounded-hc-sm border border-hc-border bg-hc-neutral-subtle">
        <MapContainer center={center} zoom={16} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={onChange} />
          <Marker
            position={center}
            draggable
            icon={pinIcon}
            eventHandlers={{
              dragend(e) {
                const pos = e.target.getLatLng();
                onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
              },
            }}
          />
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-hc-sm">
        <div className="flex items-center gap-hc-xs text-hc-caption text-hc-text-secondary">
          <HcIcon name="edit_location_alt" dense className="text-hc-primary" />
          <span className="hc-tabular">
            {addressLabel
              ? `${addressLabel} · ${t('ui.mapCoordinates', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })}`
              : t('ui.mapCoordinates', { lat: latitude.toFixed(5), lng: longitude.toFixed(5) })}
          </span>
        </div>
        {defaultLatitude !== undefined && defaultLongitude !== undefined && (
          <HcTextButton icon="my_location" onClick={() => onChange(defaultLatitude, defaultLongitude)}>
            {t('ui.mapResetPin')}
          </HcTextButton>
        )}
      </div>
    </div>
  );
}
