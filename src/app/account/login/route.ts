import { NextRequest, NextResponse } from "next/server";
import { customerAccountsEnabled, getAuthorize, CA_COOKIES } from "@/lib/customer-account";

// Inicia el login: genera PKCE + state + nonce (en cookies httpOnly cortas) y redirige
// al authorize de Shopify. Sin Customer Account API configurada → al inicio.
export async function GET(req: NextRequest) {
  if (!customerAccountsEnabled) return NextResponse.redirect(new URL("/", req.url));
  const origin = req.nextUrl.origin;
  const { url, verifier, state, nonce } = await getAuthorize(`${origin}/account/callback`);
  const res = NextResponse.redirect(url);
  const opts = {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 min para completar el handshake
  };
  res.cookies.set(CA_COOKIES.pkce, verifier, opts);
  res.cookies.set(CA_COOKIES.state, state, opts);
  res.cookies.set(CA_COOKIES.nonce, nonce, opts);
  return res;
}
