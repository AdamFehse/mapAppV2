import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Make sure the mask plugin is available
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace L {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace TileLayer {
      class Mask extends L.TileLayer {
        constructor(url: string, options?: any); // eslint-disable-line @typescript-eslint/no-explicit-any
        setCenter(containerPoint: L.Point): void;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace tileLayer {
      function mask(url: string, options?: any): L.TileLayer.Mask; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}

export function CSSMaskedTileLayer() {
  const map = useMap();
  const maskLayerRef = useRef<L.TileLayer.Mask | null>(null);
  const isZoomingRef = useRef(false);
  const isFlyingRef = useRef(false);
  const lastMousePositionRef = useRef<L.Point | null>(null);

  useEffect(() => {
    if (!map) return;

    // Check if the mask plugin is available
    if (!L.TileLayer.Mask) {
      console.log('CSSMaskedTileLayer: Mask plugin not loaded yet, waiting...');
      const checkPlugin = () => {
        if (L.TileLayer.Mask) {
          console.log('CSSMaskedTileLayer: Mask plugin now available');
          initializeMask();
        } else {
          setTimeout(checkPlugin, 100);
        }
      };
      checkPlugin();
      return;
    }

    initializeMask();

    function initializeMask() {
      try {
        // Create a custom circular mask image with smooth glow
        const createCircularMask = () => {
          const canvas = document.createElement('canvas');
          const size = 512;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) return null;
          
          // Fill with black (masked area)
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, size, size);
          
          const centerX = size / 2;
          const centerY = size / 2;
          const maxRadius = size / 3;
          
          // Create radial gradient for smooth glow effect
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
          );
          
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
          gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
          gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
          gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          return canvas.toDataURL();
        };

        // Create the masked foreground layer with modern satellite imagery
        const foregroundLayer = new L.TileLayer.Mask(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maskUrl: createCircularMask(),
            maskSize: 1024,
            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          }
        );

        foregroundLayer.addTo(map);
        maskLayerRef.current = foregroundLayer;

        // Start with mask positioned off-screen
        const offScreenPoint = L.point(-1000, -1000);
        foregroundLayer.setCenter(offScreenPoint);

        // Helper function to hide mask
        const hideMask = () => {
          if (maskLayerRef.current) {
            const offScreenPoint = L.point(-1000, -1000);
            maskLayerRef.current.setCenter(offScreenPoint);
          }
        };

        // Helper function to show mask at last known position
        const showMaskAtLastPosition = () => {
          if (maskLayerRef.current && lastMousePositionRef.current && !isZoomingRef.current) {
            maskLayerRef.current.setCenter(lastMousePositionRef.current);
          }
        };

        // Event handlers
        const handleMouseMove = (e: L.LeafletMouseEvent) => {
          lastMousePositionRef.current = e.containerPoint;
          if (maskLayerRef.current && !isZoomingRef.current) {
            maskLayerRef.current.setCenter(e.containerPoint);
          }
        };

        const handleMouseEnter = () => {
          if (!isZoomingRef.current && maskLayerRef.current) {
            const mapCenter = map.getSize().divideBy(2);
            lastMousePositionRef.current = mapCenter;
            maskLayerRef.current.setCenter(mapCenter);
          }
        };

        const handleMouseLeave = () => {
          hideMask();
          lastMousePositionRef.current = null;
        };

        // Override the original flyTo method to track when it's called
        const originalFlyTo = map.flyTo.bind(map);
        map.flyTo = function(...args) {
          console.log('FlyTo started - hiding mask');
          isFlyingRef.current = true;
          isZoomingRef.current = true;
          hideMask();
          return originalFlyTo(...args);
        };

        // Handle end of flyTo animation
        const handleMoveEnd = () => {
          if (isFlyingRef.current) {
            console.log('FlyTo ended - ready to show mask again');
            setTimeout(() => {
              isFlyingRef.current = false;
              isZoomingRef.current = false;
              if (lastMousePositionRef.current) {
                showMaskAtLastPosition();
              }
            }, 200);
          }
        };

        // Attach event listeners
        map.on('mousemove', handleMouseMove);
        map.on('mouseenter', handleMouseEnter);
        map.on('mouseleave', handleMouseLeave);
        map.on('moveend', handleMoveEnd);

        // Cleanup function
        return () => {
          // Restore original flyTo method
          map.flyTo = originalFlyTo;
          
          map.off('mousemove', handleMouseMove);
          map.off('mouseenter', handleMouseEnter);
          map.off('mouseleave', handleMouseLeave);
          map.off('moveend', handleMoveEnd);
          if (maskLayerRef.current) {
            map.removeLayer(maskLayerRef.current);
          }
        };
      } catch (error) {
        console.error('CSSMaskedTileLayer: Error creating mask layer:', error);
      }
    }
  }, [map]);

  return null;
}