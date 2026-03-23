import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Add this line to silence the warning
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;