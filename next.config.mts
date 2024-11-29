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

    // Add fallbacks for node modules used by PDFKit
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        fs: false,
        stream: false,
        zlib: false,
        crypto: false,
      },
    };

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
    domains: ['images.unsplash.com'],
    unoptimized: true,
    minimumCacheTTL: 60,
  },

  // Package optimizations
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },

  // API configuration
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '8mb',
  },

  // Environment configuration
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
} satisfies NextConfig;

export default config;
