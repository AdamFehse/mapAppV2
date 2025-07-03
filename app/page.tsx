'use client';

import dynamic from 'next/dynamic';

const MapSwitcher = dynamic(() => import('../components/MapSwitcher'), {
  ssr: false, // This disables server-side rendering for the Map component
});

export default function HomePage() {
  return (
    <main>
      <MapSwitcher />
    </main>
  );
}
