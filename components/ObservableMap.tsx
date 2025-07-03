'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../app/globals.css';
import { useProjects, Project } from './useProjects';

import * as d3 from 'd3';
import L from 'leaflet';

// Define the marker type for Observable mode
interface MarkerData {
  project: Project;
  long: number;
  lat: number;
  value: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
}

// Create mock data for Observable mode using actual projects
function createMockMarkers(projects: Project[]) {
  return projects.map((project, index) => ({
    project,
    long: project.Longitude,
    lat: project.Latitude,
    value: 8 + (index % 3), // Smaller sizes: 8, 9, or 10
    x0: 0,
    y0: 0,
    x: 0,
    y: 0
  }));
}

// Observable overlay component
function ObservableOverlay() {
  const map = useMap();
  const svgRef = useRef<SVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<MarkerData, undefined> | null>(null);
  const dotsRef = useRef<d3.Selection<SVGCircleElement | d3.BaseType, MarkerData, d3.BaseType, unknown> | null>(null);
  const { projects } = useProjects();

  useEffect(() => {
    if (!map || !projects.length) return;

    // Add SVG layer to the map
    const svgLayer = L.svg();
    svgLayer.addTo(map);

    // Create mock markers data
    const markers = createMockMarkers(projects);

    // Set initial desired positions
    markers.forEach(function (d) {
      const xy = map.latLngToLayerPoint([d.lat, d.long]);
      d.x0 = xy.x;
      d.y0 = xy.y;
    });

    // Get the SVG overlay pane
    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select("svg");

    svgRef.current = svg.node() as SVGElement;

    // Create the dots
    const Dots = svg
      .selectAll("circle")
      .attr("class", "Dots")
      .data(markers)
      .join("circle")
      .attr("id", "dotties")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.value)
      .style("fill", "blue")
      .attr("stroke", "blue")
      .attr("stroke-width", 3)
      .attr("fill-opacity", 0.4)
      .style("cursor", "pointer")
      .on("click", function(_event, d) {
        // Create popup with project info using the same format as ProjectMarker
        L.popup()
          .setLatLng([d.lat, d.long])
          .setContent(`
            <strong>${d.project.ProjectCategory}</strong>
            <br />
            A pretty CSS3 popup. <br /> Easily customizable.
          `)
          .openOn(map);
      })
      .on("mouseover", function() {
        d3.select(this)
          .style("fill", "#1976d2")
          .attr("fill-opacity", 0.7);
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("fill", "blue")
          .attr("fill-opacity", 0.4);
      });

    dotsRef.current = Dots;

    // Set up the simulation
    const update = () => {
      Dots.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    };

    const simulation = d3
      .forceSimulation<MarkerData>(markers)
      .force(
        "x",
        d3.forceX<MarkerData>().x((d) => d.x0)
      )
      .force(
        "y",
        d3.forceY<MarkerData>().y((d) => d.y0)
      )
      .force(
        "collide",
        d3.forceCollide<MarkerData>((d) => 1.2 * d.value)
      )
      .on("tick", update)
      .tick(300);

    simulationRef.current = simulation;

    // Handle zoomend
    const handleZoomEnd = function () {
      markers.forEach(function (d) {
        const xy = map.latLngToLayerPoint([d.lat, d.long]);
        d.x0 = xy.x;
        d.y0 = xy.y;
        simulation
          .force(
            "x",
            d3.forceX<MarkerData>().x((d) => d.x0)
          )
          .force(
            "y",
            d3.forceY<MarkerData>().y((d) => d.y0)
          );
      });
      simulation.alpha(1).restart();
    };

    map.on("zoomend", handleZoomEnd);

    // Cleanup
    return () => {
      map.off("zoomend", handleZoomEnd);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      if (dotsRef.current) {
        dotsRef.current.remove();
      }
      map.removeLayer(svgLayer);
    };
  }, [map, projects]);

  return null;
}

export default function ObservableMap() {
  const { projects, error } = useProjects();

  if (error) return <div>Error: {error}</div>;
  if (!projects.length) return <div>Loading...</div>;

  return (
    <MapContainer 
      center={[31.313354, -110.945987]}
      zoom={6}
      style={{ height: '100vh', width: '100%' }}
      zoomControl={false}
    >
      {/* Base tile layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        minZoom={0}
        maxZoom={16}
      />
      
      {/* Observable overlay */}
      <ObservableOverlay />
    </MapContainer>
  );
} 