import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL.endsWith("/api")
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
  : "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    console.log("Convocatorias proxy: Making request to backend...");
    const response = await fetch(`${BACKEND_BASE_URL}/Convocatorias`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Agregar timeout de 30 segundos
      signal: AbortSignal.timeout(30000),
    });

    console.log(
      "Convocatorias proxy: Backend response status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "Convocatorias proxy: Backend error:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend error: ${response.status}`,
          details: errorText,
          url: `${BACKEND_BASE_URL}/Convocatorias`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "Convocatorias proxy: Data received:",
      data?.length || 0,
      "items"
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Convocatorias proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/Convocatorias`, {
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
    console.error("Convocatorias POST proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/Convocatorias/${id}`, {
      method: "PUT",
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
    console.error("Convocatorias PUT proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_BASE_URL}/Convocatorias/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data =
      response.status === 204
        ? { message: "Deleted successfully" }
        : await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Convocatorias DELETE proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
