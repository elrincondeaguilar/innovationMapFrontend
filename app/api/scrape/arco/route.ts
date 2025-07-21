
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  // const month = searchParams.get('month');

  const sodaApiUrl = `https://www.datos.gov.co/resource/3btf-kkkp.json`;
  const filters = [];

  if (year) {
    filters.push(`anio_corte=${year}`);
  }

  // The month filter is not straightforward as there is no month column.
  // We would need to filter by 'fecha_de_apertura' or 'fecha_de_cierre'.
  // This is a placeholder for now.
  // if (month) {
  //   filters.push(`$where=date_extract_m(fecha_de_apertura) = ${month}`);
  // }

  const fullUrl = `${sodaApiUrl}${filters.length > 0 ? '?' + filters.join('&') : ''}`;

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: 'Error fetching data from datos.gov.co', error: errorMessage }, { status: 500 });
  }
}
