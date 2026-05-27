import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esta sección ignora los errores de TypeScript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
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
