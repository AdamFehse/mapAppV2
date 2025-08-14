'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function MaskedMapContent() {
  const map = useMap();
  // Use a ref to store the layer so we can access it in the cleanup function.
  const maskedLayerRef = useRef<L.TileLayer.Mask | null>(null);

  useEffect(() => {
    if (!map) return;

    // This script injects the Leaflet.Mask plugin logic.
    // It's safer to check if the plugin already exists to avoid re-injecting it.
    const scriptContent = `
      (function() {
        if (L.TileLayer.Mask) return;
        L.TileLayer.Mask = L.TileLayer.extend({
          options: { maskSize: 512 },
          getMaskSize: function() { var s = this.options.maskSize; return s instanceof L.Point ? s : new L.Point(s, s); },
          setCenter: function(containerPoint) {
            if (arguments.length === 2) { this.setCenter(L.point(arguments[0], arguments[1])); return; }
            if (this._map) {
              var p = this._map.containerPointToLayerPoint(containerPoint);
              p = p.subtract(this.getMaskSize().divideBy(2));
              this._image.setAttribute("x", p.x);
              this._image.setAttribute("y", p.y);
            }
          },
          _initContainer: function() {
            if (this._container) return;
            var rootGroup = this._map.getRenderer(this)._rootGroup;
            var defs = rootGroup.appendChild(L.SVG.create("defs"));
            var container = rootGroup.appendChild(L.SVG.create("g"));
            var mask = defs.appendChild(L.SVG.create("mask"));
            var image = mask.appendChild(L.SVG.create("image"));
            var size = this.getMaskSize();
            mask.setAttribute("id", "leaflet-tilelayer-mask-" + L.stamp(this));
            mask.setAttribute("x", "-100%");
            mask.setAttribute("y", "-100%");
            mask.setAttribute("width", "300%");
            mask.setAttribute("height", "300%");
            image.setAttribute("width", size.x);
            image.setAttribute("height", size.y);
            image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.options.maskUrl);
            container.setAttribute("mask", "url(#" + mask.getAttribute("id") + ")");
            this._container = container;
            this._image = image;
            this.setCenter(this._map.getSize().divideBy(2));
          },
          _updateLevels: function() {
            var zoom = this._tileZoom;
            if (zoom === undefined) return undefined;
            for (var z in this._levels) {
              if (!this._levels[z].el.firstChild && z !== zoom) {
                L.DomUtil.remove(this._levels[z].el);
                this._removeTilesAtZoom(z);
                delete this._levels[z];
              }
            }
            var level = this._levels[zoom];
            if (!level) {
              var map = this._map;
              level = { el: this._container.appendChild(L.SVG.create("g")), origin: map.project(map.unproject(map.getPixelOrigin()), zoom).round(), zoom: zoom };
              this._setZoomTransform(level, map.getCenter(), map.getZoom());
              L.Util.falseFn(level.el.offsetWidth);
              this._levels[zoom] = level;
            }
            this._level = level;
            return level;
          },
          _addTile: function(coords, container) {
            var tilePos = this._getTilePos(coords);
            var tileSize = this.getTileSize();
            var key = this._tileCoordsToKey(coords);
            var url = this.getTileUrl(this._wrapCoords(coords));
            var tile = container.appendChild(L.SVG.create("image"));
            tile.setAttribute("width", tileSize.x);
            tile.setAttribute("height", tileSize.y);
            tile.setAttribute("x", tilePos.x);
            tile.setAttribute("y", tilePos.y);
            tile.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
            this._tiles[key] = { el: tile, coords: coords, current: true };
          },
          _setZoomTransform: function(level, center, zoom) {
            var scale = this._map.getZoomScale(zoom, level.zoom),
              translate = level.origin.multiplyBy(scale).subtract(this._map._getNewPixelOrigin(center, zoom)).round();
            level.el.setAttribute("transform", "translate(" + translate.x + "," + translate.y + ")");
          }
        });
        L.tileLayer.mask = function(url, options) { return new L.TileLayer.Mask(url, options); };
      })();
    `;
    
    if (!document.getElementById('leaflet-mask-plugin-script')) {
        const script = document.createElement('script');
        script.id = 'leaflet-mask-plugin-script';
        script.textContent = scriptContent;
        document.body.appendChild(script);
    }
    
    const createCircularMask = () => {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 3;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      return canvas.toDataURL();
    };

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
        if (maskedLayerRef.current) {
            const point = map.latLngToContainerPoint(e.latlng);
            maskedLayerRef.current.setCenter(point);
        }
    };

    const checkPlugin = () => {
      if (L.tileLayer.mask) {
        const maskUrl = createCircularMask();
        if (maskUrl) {
          const maskedLayer = L.tileLayer.mask(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
              maskUrl: maskUrl,
              maskSize: 512,
              attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }
          );
          
          maskedLayerRef.current = maskedLayer;
          maskedLayer.addTo(map);

          map.on('mousemove', handleMouseMove);
          
          const centerPoint = map.latLngToContainerPoint(map.getCenter());
          maskedLayer.setCenter(centerPoint);
        }
      } else {
        setTimeout(checkPlugin, 100);
      }
    };

    checkPlugin();

    // This cleanup function is now correctly returned by useEffect.
    // It will be called when the component unmounts.
    return () => {
      map.off('mousemove', handleMouseMove);
      if (maskedLayerRef.current) {
        map.removeLayer(maskedLayerRef.current);
        maskedLayerRef.current = null;
      }
    };
  }, [map]);

  return null;
}
