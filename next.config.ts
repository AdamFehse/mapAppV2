import type { NextConfig } from "next";

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

export default nextConfig;
