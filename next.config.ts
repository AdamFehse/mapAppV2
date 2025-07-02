import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repo = 'mapAppV2';

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: isProd ? `/${repo}/` : undefined,
  basePath: isProd ? `/${repo}` : undefined,
  /* config options here */
};

export default nextConfig;
