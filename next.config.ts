
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
      {
        protocol: 'https',
        hostname: 'menafn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'newsofnepal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nepalnews.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thehimalayantimes.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bizmandu.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'annapurnapost.prixacdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.france24.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
