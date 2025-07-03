import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../app/globals.css';
import { useProjects } from './useProjects';
import { ProjectMarker } from './ProjectMarker';
import { CSSMaskedTileLayer } from './CSSMaskedTileLayer';
import { useEffect } from 'react';

export default function Map() {
  const { projects, error } = useProjects();

  // Load the mask plugin
  useEffect(() => {
    // Dynamically load the mask plugin script
    const script = document.createElement('script');
    script.src = '/leaflet-tilelayer-mask.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!projects.length) return <div>Loading...</div>;

  return (
    <MapContainer 
      center={[31.313354, -110.945987]} 
      zoom={7} 
      style={{ height: '100vh', width: '100%' }}
    >
      {/* Base tile layer (this will be the background) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Masked tile layer that follows mouse (this reveals the foreground) */}
      <CSSMaskedTileLayer />
      
      {/* Project markers */}
      {projects.map((project, idx) => (
        <ProjectMarker project={project} key={idx} />
      ))}
    </MapContainer>
  );
}