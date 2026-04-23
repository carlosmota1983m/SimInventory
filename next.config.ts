import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Esta sección ignora los errores de TypeScript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
  },
  // Esta sección ignora los errores de ESLint durante la construcción
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
};

export default nextConfig;
