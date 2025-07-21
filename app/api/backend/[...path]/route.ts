import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL.endsWith("/api")
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
  : "https://backinovationmap.onrender.com/api";

// Dynamic route handler for /api/backend/[...path]
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").slice(3); // Remove /api/backend
    const endpoint = pathSegments.join("/");

    console.log("Backend proxy GET:", endpoint);

    const response = await fetch(
      `${BACKEND_BASE_URL}/${endpoint}${url.search}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error text:", errorText);
      return NextResponse.json(
        {
          error: `Backend error: ${response.status}`,
          details: errorText,
          url: `${BACKEND_BASE_URL}/${endpoint}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend proxy GET error:", error);
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
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").slice(3);
    const endpoint = pathSegments.join("/");

    const body = await request.json();

    console.log("Backend proxy POST:", endpoint);

    const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
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
    console.error("Backend proxy POST error:", error);
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
    const pathSegments = url.pathname.split("/").slice(3);
    const endpoint = pathSegments.join("/");

    const body = await request.json();

    console.log("Backend proxy PUT:", endpoint);

    const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
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
    console.error("Backend proxy PUT error:", error);
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
    const pathSegments = url.pathname.split("/").slice(3);
    const endpoint = pathSegments.join("/");

    console.log("Backend proxy DELETE:", endpoint);

    const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
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
    console.error("Backend proxy DELETE error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
