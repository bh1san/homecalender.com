
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.nagariknewscdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dam.mediacorp.sg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.karobardaily.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gorkhapatraonline.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.onlinekhabar.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
