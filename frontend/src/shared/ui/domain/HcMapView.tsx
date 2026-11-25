import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { createMapPinIcon } from '@/shared/lib/mapIcons';
import { AppColors } from '@/shared/theme/tokens';
import { HcIcon } from '../display/HcIcon';

/** UI-28: read-only OpenStreetMap preview with pin and optional geofence circle. NM-0193. */
type HcMapViewProps = {
  latitude: number;
  longitude: number;
  label?: string;
  geofenceRadiusMeters?: number;
  zoom?: number;
};

export function HcMapView({ latitude, longitude, label, geofenceRadiusMeters, zoom = 15 }: HcMapViewProps) {
  const center: [number, number] = [latitude, longitude];
  const pinIcon = createMapPinIcon('primary', '●');

  return (
    <div className="flex flex-col gap-hc-xs">
      <div className="hc-map-frame h-hc-map w-full overflow-hidden rounded-hc-sm border border-hc-border bg-hc-neutral-subtle">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} icon={pinIcon}>
            {label && <Popup>{label}</Popup>}
          </Marker>
          {geofenceRadiusMeters !== undefined && (
            <Circle
              center={center}
              radius={geofenceRadiusMeters}
              pathOptions={{ color: AppColors.primary, fillColor: AppColors.primarySubtle, fillOpacity: 0.35 }}
            />
          )}
        </MapContainer>
      </div>
      {label && (
        <p className="m-0 flex items-center gap-hc-xs text-hc-caption text-hc-text-secondary">
          <HcIcon name="location_on" dense className="text-hc-primary" />
          <span>{label}</span>
        </p>
      )}
    </div>
  );
}
