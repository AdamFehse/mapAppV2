import { Marker, Popup } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import { createCustomMarker } from './CustomMarker';
import type { Project } from './useProjects';

export function ProjectMarker({ project }: { project: Project }) {
  const map = useMap();

  const handleMarkerClick = () => {
    // Fly to the project location with smooth animation
    map.flyTo(
      [project.Latitude, project.Longitude], 
      12, // Zoom level
      {
        duration: 1.5, // Animation duration in seconds
        easeLinearity: 0.15 // Animation easing
      }
    );
  };

  return (
    <Marker
      position={[project.Latitude, project.Longitude]}
      icon={createCustomMarker()}
      eventHandlers={{
        click: handleMarkerClick
      }}
    >
      <Popup>
        <strong>{project.ProjectCategory}</strong>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  );
}
