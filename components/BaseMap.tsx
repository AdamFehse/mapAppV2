import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../app/globals.css';
import { useProjects } from './useProjects';
import MarkerCluster from './MarkerCluster';

// Component to get map instance for MarkerCluster
function MapContent() {
  const map = useMap();
  const { projects } = useProjects();
  
  return <MarkerCluster map={map} projects={projects} />;
}

interface BaseMapProps {
  children?: React.ReactNode;
  showMarkers?: boolean;
}

export default function BaseMap({ children, showMarkers = true }: BaseMapProps) {
  const { projects, error } = useProjects();

  // Load the mask plugin script (needed for mask mode)
  useEffect(() => {
    // Embed the mask plugin script directly to avoid GitHub Pages issues
    const scriptContent = `
      (function() {
        L.TileLayer.Mask = L.TileLayer.extend({
          options: {
            maskSize: 512
          },
          getMaskSize: function() {
            var s = this.options.maskSize;
            return s instanceof L.Point ? s : new L.Point(s, s);
          },
          setCenter: function(containerPoint) {
            if (arguments.length === 2) {
              this.setCenter(L.point(arguments[0], arguments[1]));
              return;
            }
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
            if (zoom === undefined)
              return undefined;

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
              level = {
                el: this._container.appendChild(L.SVG.create("g")),
                origin: map.project(map.unproject(map.getPixelOrigin()), zoom).round(),
                zoom: zoom
              };
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

            this._tiles[key] = {
              el: tile,
              coords: coords,
              current: true
            };
          },
          _setZoomTransform: function(level, center, zoom) {
            var scale = this._map.getZoomScale(zoom, level.zoom),
              translate = level.origin.multiplyBy(scale)
              .subtract(this._map._getNewPixelOrigin(center, zoom)).round();
            level.el.setAttribute("transform", "translate(" + translate.x + "," + translate.y + ")");
          }
        });

        L.tileLayer.mask = function(url, options) {
          return new L.TileLayer.Mask(url, options);
        };

      })();
    `;

    // Create and execute the script
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.body.appendChild(script);
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!projects.length) return <div>Loading...</div>;

  return (
    <MapContainer 
      center={[31.313354, -110.945987]} 
      zoom={7} 
      style={{ height: '100vh', width: '100%', position: 'relative' }}
    >
      {/* Historical base tile layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        minZoom={0}
        maxZoom={16}
      />
      
      {/* Clustered project markers (optional) */}
      {showMarkers && <MapContent />}
      
      {/* Custom overlays */}
      {children}
    </MapContainer>
  );
} 