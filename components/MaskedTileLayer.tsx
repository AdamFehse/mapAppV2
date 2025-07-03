import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MaskedTileLayer() {
  const map = useMap();

  useEffect(() => {
    // @ts-expect-error: Mask is added by external Leaflet plugin
    if (!window.L?.TileLayer?.Mask) {
      const script = document.createElement('script');
      script.src = '/leaflet-tilelayer-mask.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-expect-error: mask is added by external Leaflet plugin
        if (window.L?.tileLayer?.mask) {
          // @ts-expect-error: mask is added by external Leaflet plugin
          const fg = window.L.tileLayer.mask(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { 
              maskSize: 512,
              //maskUrl: '/gal.png' // Use your custom image as mask
            }
          );
          fg.addTo(map);

          // Add event handler for mask movement
          map.on('mousemove', function (e) {
            fg.setCenter(e.containerPoint);
          });
        }
      };
    } else {
      // @ts-expect-error: mask is added by external Leaflet plugin
      const fg = window.L.tileLayer.mask(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { 
          maskSize: 512,
          maskUrl: '/galager.png' // Use your custom image as mask
        }
      );
      fg.addTo(map);

      // Add event handler for mask movement
      map.on('mousemove', function (e) {
        fg.setCenter(e.containerPoint);
      });
    }
  }, [map]);

  return null;
}
