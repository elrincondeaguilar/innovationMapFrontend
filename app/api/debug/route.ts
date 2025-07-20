import { NextResponse } from "next/server";

export async function GET() {
  const BACKEND_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://backinovationmap.onrender.com/api";

  return NextResponse.json({
    message: "Debug endpoint",
    environment: process.env.NODE_ENV,
    backendUrl: BACKEND_BASE_URL,
    fullPromotoresUrl: `${BACKEND_BASE_URL}/Promotores`,
    allEnvVars: {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}
