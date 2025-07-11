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
    // Only apply rewrites in development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/backend/:path*",
          destination: "https://localhost:7001/api/:path*", // Cambia este puerto por el de tu backend C#
        },
      ];
    }
    return [];
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
