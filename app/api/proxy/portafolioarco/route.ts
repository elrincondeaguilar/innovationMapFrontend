import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    // Lista de endpoints posibles para portafolioarco
    const possibleEndpoints = [
      '/api/PortafolioArco',
      '/PortafolioArco',
      '/portafolioarco',
      '/api/portafolioarco'
    ];

    let response: Response | null = null;
    let usedEndpoint = '';

    // Probar cada endpoint hasta encontrar uno que funcione
    for (const endpoint of possibleEndpoints) {
      try {
        const testUrl = `${BACKEND_BASE_URL}${endpoint}`;
        console.log(`🔍 Trying portafolioarco endpoint: ${testUrl}`);
        
        const testResponse = await fetch(testUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (testResponse.ok) {
          response = testResponse;
          usedEndpoint = endpoint;
          console.log(`✅ Found working portafolioarco endpoint: ${testUrl}`);
          break;
        } else {
          console.log(`❌ Failed endpoint ${testUrl}: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Error with endpoint ${endpoint}:`, error);
      }
    }

    if (!response) {
      console.error('❌ No working portafolioarco endpoint found');
      return NextResponse.json(
        { error: 'No working portafolioarco endpoint found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log(`✅ PortafolioArco data received from ${usedEndpoint}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_BASE_URL}/portafolioarco`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_BASE_URL}/portafolioarco/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
