import { NextRequest, NextResponse } from "next/server";
import { customerAccountsEnabled, getLogoutUrl, CA_COOKIES } from "@/lib/customer-account";

// Cierra sesión: limpia las cookies de sesión y redirige al end_session de Shopify
// (que también cierra la sesión SSO). Sin CAA → al inicio.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const home = new URL("/", req.url);
  let target = home.toString();
  if (customerAccountsEnabled) {
    const idt = req.cookies.get(CA_COOKIES.idt)?.value;
    try {
      target = await getLogoutUrl(idt, `${origin}/`);
    } catch {
      /* si el discovery falla, al menos limpiamos y vamos al inicio */
    }
  }
  const res = NextResponse.redirect(target);
  for (const n of [CA_COOKIES.at, CA_COOKIES.rt, CA_COOKIES.exp, CA_COOKIES.idt])
    res.cookies.set(n, "", { path: "/", maxAge: 0 });
  return res;
}
