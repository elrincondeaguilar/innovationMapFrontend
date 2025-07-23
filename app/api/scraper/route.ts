import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    // Aquí deberías poner la lógica real para extraer el texto de la URL
    // Por ahora, solo devuelve la URL recibida como texto de ejemplo
    return NextResponse.json({ text: `Texto extraído de: ${url}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando la URL' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Método GET no soportado para /api/scraper" }, { status: 405 });
}

