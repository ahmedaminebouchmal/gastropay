import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const config: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Webpack configuration for development
  webpack: (config: WebpackConfig, { dev, isServer }): WebpackConfig => {
    // Development settings
    if (dev && !isServer) {
      // Disable source maps in development
      config.devtool = false;
      
      // Hot reload settings
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Performance optimizations
  swcMinify: true,
  productionBrowserSourceMaps: false,
  
  // Development settings
  typescript: {
    ignoreBuildErrors: true, // Ignore TS errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },

  // Image optimization
  images: {
    domains: [],
    unoptimized: true,
  },

  // Package optimizations
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
} satisfies NextConfig;

export default config;
