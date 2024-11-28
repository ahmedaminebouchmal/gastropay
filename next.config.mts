import type { NextConfig } from 'next';

const config: NextConfig = {
  // Disable barrel optimization for react-icons
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
};

export default config;
