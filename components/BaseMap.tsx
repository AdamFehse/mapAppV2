import React from 'react';
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