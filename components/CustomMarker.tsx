import L from 'leaflet';

interface CustomMarkerOptions {
  className?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  html?: string;
}

export function createCustomMarker({
  className = 'custom-marker',
  iconSize = [24, 24],
  iconAnchor = [12, 24],
  html = '',
}: CustomMarkerOptions = {}) {
  return L.divIcon({
    className,
    iconSize,
    iconAnchor,
    html,
  });
} 