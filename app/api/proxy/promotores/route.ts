import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL.endsWith('/api')
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    // Debug logging
    console.log("=== PROMOTORES PROXY DEBUG ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log("BACKEND_BASE_URL:", BACKEND_BASE_URL);
    console.log("Full URL:", `${BACKEND_BASE_URL}/Promotores`);
    console.log("=== END DEBUG ===");

    // Simple fetch without timeout first
    const response = await fetch(`${BACKEND_BASE_URL}/Promotores`);
    
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error text:", errorText);
      return NextResponse.json(
        { 
          error: `Backend error: ${response.status}`, 
          details: errorText,
          url: `${BACKEND_BASE_URL}/Promotores`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Data received, length:", data?.length || 0);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Promotores proxy error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect to backend", 
        details: error instanceof Error ? error.message : "Unknown error",
        url: `${BACKEND_BASE_URL}/Promotores`,
        backendBaseUrl: BACKEND_BASE_URL
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/Promotores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Promotores POST proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
