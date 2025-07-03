import { useEffect, useRef } from "react";
import L from 'leaflet';
import "leaflet.markercluster";
import { createCustomMarker } from './CustomMarker';
import type { Project } from './useProjects';

const MarkerCluster = ({ map, projects }: { map: L.Map | null, projects: Project[] }) => {
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map || !projects || projects.length === 0) return;

    // Remove previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: function (cluster: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const count = cluster.getChildCount();
        let color = "#1976d2";
        let size = 40;

        if (count >= 100) {
          color = "#d32f2f";
          size = 60;
        } else if (count >= 10) {
          color = "#388e3c";
          size = 50;
        }

        return L.divIcon({
          html: `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${color}" stroke="#fff" stroke-width="3"/>
              <text x="50%" y="55%" text-anchor="middle" font-size="${size/2.5}" fill="#fff" font-weight="bold" dominant-baseline="middle">${count}</text>
            </svg>
          `,
          className: "custom-cluster-icon",
          iconSize: [size, size],
        });
      }
    });

    projects.forEach((project) => {
      if (project.Latitude && project.Longitude) {
        // Use the existing custom marker
        const marker = L.marker([project.Latitude, project.Longitude], { 
          icon: createCustomMarker() 
        });
        

        
        // Add popup
        marker.bindPopup(`
          <strong>${project.ProjectCategory}</strong>
          <br />
          A pretty CSS3 popup. <br /> Easily customizable.
        `);
        
        clusterGroup.addLayer(marker);
      }
    });
    
    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, projects]);

  return null;
};

export default MarkerCluster; 