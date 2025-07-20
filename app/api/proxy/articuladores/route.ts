import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    console.log("Articuladores proxy: Making request to backend...");
    const response = await fetch(`${BACKEND_BASE_URL}/Articuladores`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Agregar timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });
    console.log("Articuladores proxy: Backend response status:", response.status);
    
    if (!response.ok) {
      console.error("Articuladores proxy: Backend error:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Articuladores proxy: Data received:", data?.length || 0, "items");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Articuladores proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/Articuladores`, {
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
    console.error("Articuladores POST proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
