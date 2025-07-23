import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Extraer todo el texto visible
    let text = $("body").text();

    // Extraer contenido de tablas (especialmente fechas)
    $("table").each((i, table) => {
      $(table)
        .find("tr")
        .each((j, row) => {
          const cells = $(row).find("td, th");
          if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();
            text += `\n${label}: ${value}`;
          }
        });
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error procesando la URL" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Método GET no soportado para /api/scraper" }, { status: 405 });
}

