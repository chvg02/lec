import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // Permite qualquer domínio com HTTPS
      },
    ],
  },
};

export default nextConfig;
