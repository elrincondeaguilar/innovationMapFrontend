import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");

  // Validate the 'year' parameter
  if (!yearParam) {
    return NextResponse.json(
      { success: false, message: 'El parámetro "year" es requerido.' },
      { status: 400 }
    );
  }

  const year = parseInt(yearParam, 10);
  if (isNaN(year)) {
    return NextResponse.json(
      {
        success: false,
        message: 'El parámetro "year" debe ser un número válido.',
      },
      { status: 400 }
    );
  }

  const sodaApiUrl = `https://www.datos.gov.co/resource/3btf-kkkp.json`;

  const filters = [`$where=date_extract_y(fecha_apertura)=${year}`];

  const fullUrl = `${sodaApiUrl}?${filters.join("&")}`;

  console.log(`Intentando scrape de: ${fullUrl}`); // For debugging in Vercel logs

  try {
    const response = await fetch(fullUrl);

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = `Could not parse error body: ${
          e instanceof Error ? e.message : String(e)
        }`;
      }

      console.error(
        `HTTP error from datos.gov.co: Status ${response.status}, Body: ${errorBody}`
      );
      throw new Error(
        `HTTP error! Status: ${response.status}. Body: ${errorBody.substring(
          0,
          200
        )}...`
      );
    }

    const data = await response.json();

    if (data.length === 0) {
      console.log(`No data found for year ${year} in datos.gov.co.`);
      return NextResponse.json({
        success: true,
        data: [],
        message: `No se encontraron datos para el año ${year}.`,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    let errorMessage = "Unknown error trying to fetch data from datos.gov.co.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error in scrape API: ${errorMessage}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener datos de datos.gov.co",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
