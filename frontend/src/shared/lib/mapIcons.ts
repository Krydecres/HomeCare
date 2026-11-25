import L from 'leaflet';

/** Token-styled Leaflet divIcons so map markers never depend on external PNG URLs (UI-28, R-17 CSP). */
export function createMapPinIcon(variant: 'primary' | 'danger' | 'success' = 'primary', label = '') {
  const variantClass = variant === 'danger' ? 'hc-map-pin--danger' : variant === 'success' ? 'hc-map-pin--success' : '';
  return L.divIcon({
    className: '',
    html: `<span class="hc-map-pin ${variantClass}">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
