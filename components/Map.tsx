'use client';

import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../app/globals.css';
import { useProjects, Project } from './useProjects';
import MarkerCluster from './MarkerCluster';
import { ObservableOverlay } from './ObservableMap'; 
import { MaskedMapContent } from './SimpleMaskedMap'; 

type MapView = 'base' | 'observable';

// This component renders the primary view (markers or force graph)
function BaseView({ view, projects, showMarkers }: { view: MapView, projects: Project[], showMarkers?: boolean }) {
  const map = useMap();

  switch (view) {
    case 'observable':
      return <ObservableOverlay />;
    case 'base':
      return showMarkers ? <MarkerCluster map={map} projects={projects} /> : null;
    default:
      return null;
  }
}

interface MapProps {
  view: MapView;
  isMaskEnabled: boolean;
  showMarkers?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function Map({
  view,
  isMaskEnabled,
  showMarkers = true,
  center = [31.313354, -110.945987],
  zoom = 7,
}: MapProps) {
  const { projects, error } = useProjects();

  if (error) return <div>Error: {error}</div>;
  if (projects.length === 0) return <div>Loading...</div>;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100vh', width: '100%', position: 'relative' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        minZoom={0}
        maxZoom={16}
      />
      {/* Render the base view */}
      <BaseView view={view} projects={projects} showMarkers={showMarkers} />
      
      {/* Conditionally render the mask overlay */}
      {isMaskEnabled && <MaskedMapContent />}
    </MapContainer>
  );
}
