import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL.endsWith("/api")
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
  : "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/Companies`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error text:", errorText);
      return NextResponse.json(
        {
          error: `Backend error: ${response.status}`,
          details: errorText,
          url: `${BACKEND_BASE_URL}/Companies`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Companies proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
        url: `${BACKEND_BASE_URL}/Companies`,
        backendBaseUrl: BACKEND_BASE_URL,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/Companies`, {
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
    console.error("Companies POST proxy error:", error);
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

    const response = await fetch(`${BACKEND_BASE_URL}/Companies/${id}`, {
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
    console.error("Companies DELETE proxy error:", error);
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
    const response = await fetch(`${BACKEND_BASE_URL}/Companies/${id}`, {
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
    console.error("Companies PUT proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
