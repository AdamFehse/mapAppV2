'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { ssr: false });

type MapView = 'observable' | 'base';

export default function MapSwitcher() {
  const [view, setView] = useState<MapView>('observable');
  const [isMaskEnabled, setIsMaskEnabled] = useState(false);

  const handleMaskToggle = () => {
    setIsMaskEnabled(prevState => !prevState);
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
            backgroundColor: view === 'observable' ? '#1976d2' : '#fff',
            color: view === 'observable' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: view === 'observable' ? 'bold' : 'normal'
          }}
          onClick={() => setView('observable')}
        >
          Force Graph
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'base' ? '#1976d2' : '#fff',
            color: view === 'base' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: view === 'base' ? 'bold' : 'normal'
          }}
          onClick={() => setView('base')}
        >
          Base Map
        </button>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: isMaskEnabled ? '#1976d2' : '#fff',
            color: isMaskEnabled ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: isMaskEnabled ? 'bold' : 'normal'
          }}
          onClick={handleMaskToggle}
        >
          Toggle Mask
        </button>
      </div>
      <Map
        view={view}
        isMaskEnabled={isMaskEnabled}
        showMarkers={view === 'base'}
      />
    </div>
  );
}
