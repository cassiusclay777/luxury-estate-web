/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // AI Virtual Staging - Pollinations.ai (FREE!)
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
      // Sreality images
      {
        protocol: 'https',
        hostname: 'd18-a.sdn.cz',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Ensure CSS is processed correctly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Configure aliases to match tsconfig.json
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      'types': path.resolve(__dirname, 'types'),
    };
    
    return config;
  },
};

module.exports = nextConfig;
