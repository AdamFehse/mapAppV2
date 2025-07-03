'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import all map components
const ObservableMap = dynamic(() => import('./ObservableMap'), { ssr: false });
const BaseMap = dynamic(() => import('./BaseMap'), { ssr: false });
const CSSMaskedTileLayer = dynamic(() => import('./CSSMaskedTileLayer').then(mod => ({ default: mod.CSSMaskedTileLayer })), { ssr: false });

type MapMode = 'observable' | 'base' | 'mask';

export default function MapSwitcher() {
  const [mode, setMode] = useState<MapMode>('observable');

  const renderMap = () => {
    switch (mode) {
      case 'observable':
        return <ObservableMap />;
      case 'base':
        return <BaseMap key="base-map" showMarkers={true} />;
      case 'mask':
        return (
          <BaseMap key="mask-map" showMarkers={false}>
            <CSSMaskedTileLayer />
          </BaseMap>
        );
      default:
        return <ObservableMap />;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Mode selector buttons */}
      <div style={{
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'observable' ? '#1976d2' : '#fff',
            color: mode === 'observable' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: mode === 'observable' ? 'bold' : 'normal'
          }}
          onClick={() => setMode('observable')}
        >
          Force Graph
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'base' ? '#1976d2' : '#fff',
            color: mode === 'base' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: mode === 'base' ? 'bold' : 'normal'
          }}
          onClick={() => setMode('base')}
        >
          Base Map
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'mask' ? '#1976d2' : '#fff',
            color: mode === 'mask' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: mode === 'mask' ? 'bold' : 'normal'
          }}
          onClick={() => setMode('mask')}
        >
          Mask Mode
        </button>
      </div>

      {/* Render the selected map */}
      {renderMap()}
    </div>
  );
} 