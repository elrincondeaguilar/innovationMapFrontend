import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backinovationmap.onrender.com/api";

export async function GET() {
  try {
    // Lista de endpoints posibles para convocatorias
    const possibleEndpoints = [
      '/api/Convocatorias',
      '/Convocatorias',
      '/convocatorias',
      '/api/convocatorias',
      '/Convocatoria'
    ];

    let response: Response | null = null;
    let usedEndpoint = '';

    // Probar cada endpoint hasta encontrar uno que funcione
    for (const endpoint of possibleEndpoints) {
      try {
        const testUrl = `${BACKEND_BASE_URL}${endpoint}`;
        console.log(`🔍 Trying convocatorias endpoint: ${testUrl}`);
        
        const testResponse = await fetch(testUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (testResponse.ok) {
          response = testResponse;
          usedEndpoint = endpoint;
          console.log(`✅ Found working convocatorias endpoint: ${testUrl}`);
          break;
        } else {
          console.log(`❌ Failed endpoint ${testUrl}: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Error with endpoint ${endpoint}:`, error);
      }
    }

    if (!response) {
      console.error('❌ No working convocatorias endpoint found');
      return NextResponse.json(
        { error: 'No working convocatorias endpoint found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log(`✅ Convocatorias data received from ${usedEndpoint}`);
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

    // Usar el mismo patrón de endpoints para POST
    const possibleEndpoints = [
      '/api/Convocatorias',
      '/Convocatorias',
      '/convocatorias',
      '/api/convocatorias'
    ];

    let response: Response | null = null;

    for (const endpoint of possibleEndpoints) {
      try {
        const testUrl = `${BACKEND_BASE_URL}${endpoint}`;
        
        const testResponse = await fetch(testUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        
        if (testResponse.ok) {
          response = testResponse;
          break;
        }
      } catch {
        // Continuar con el siguiente endpoint
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: 'No working convocatorias POST endpoint found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy POST error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend for POST" },
      { status: 500 }
    );
  }
}
