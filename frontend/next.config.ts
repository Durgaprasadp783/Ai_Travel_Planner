import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Add this line to silence the warning
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;