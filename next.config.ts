import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    // Proxy para evitar problemas de CORS en producción
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://backinovationmap.onrender.com/api/:path*",
      },
    ];
  },
  // Configuración para desarrollo con HTTPS si tu backend lo usa
  async headers() {
    return [
      {
        source: "/api/backend/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
