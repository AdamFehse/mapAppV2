// leaflet-extensions.d.ts
// Place this file in your project root or in a types folder

import * as L from 'leaflet';

declare module 'leaflet' {
  namespace TileLayer {
    class Mask extends L.TileLayer {
      constructor(url: string, options?: L.TileLayerOptions & {
        maskUrl?: string;
        maskSize?: number | L.Point;
      });
      
      setCenter(containerPoint: L.Point): void;
      setCenter(x: number, y: number): void;
    }
  }

  namespace tileLayer {
    function mask(url: string, options?: L.TileLayerOptions & {
      maskUrl?: string;
      maskSize?: number | L.Point;
    }): L.TileLayer.Mask;
  }
}