'use client';

import dynamic from 'next/dynamic';
import InstallPrompt from '../components/InstallPrompt';

const MapSwitcher = dynamic(() => import('../components/MapSwitcher'), {
  ssr: false, // This disables server-side rendering for the Map component
});

export default function HomePage() {
  return (
    <main>
      <MapSwitcher />
      <InstallPrompt />
    </main>
  );
}
