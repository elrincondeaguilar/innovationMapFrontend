import { NextResponse } from "next/server";

export async function GET() {
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL.endsWith("/api")
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : "https://backinovationmap.onrender.com/api";

  return NextResponse.json({
    message: "Debug endpoint",
    environment: process.env.NODE_ENV,
    rawEnvVar: process.env.NEXT_PUBLIC_BACKEND_URL,
    constructedBackendUrl: BACKEND_BASE_URL,
    fullArticuladoresUrl: `${BACKEND_BASE_URL}/Articuladores`,
    allEnvVars: {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}
