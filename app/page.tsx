'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), {
  ssr: false, // This disables server-side rendering for the Map component
});

export default function HomePage() {
  return (
    <main>
      <Map />
    </main>
  );
}
