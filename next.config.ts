import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const repo = 'mapAppV2';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? `/${repo}/` : '',
  basePath: isProd ? `/${repo}` : '',
  output: 'export',
  /* config options here */
};

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/tiles\.stamen\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.tiles\.mapbox\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'mapbox-tiles',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
})(nextConfig);

export default config;
