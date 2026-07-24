import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/customer-account";

// Estado de sesión del cliente para el header (se consulta desde el AccountButton,
// client-side). Aislar la lectura de cookies AQUÍ (ruta dinámica) evita que el header
// del layout fuerce render dinámico en TODO el sitio (mantiene estático/ISR el resto).
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCustomer();
  return NextResponse.json(
    { user: user ? { name: user.name || user.email } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
