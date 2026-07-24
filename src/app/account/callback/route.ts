import { NextRequest, NextResponse } from "next/server";
import { customerAccountsEnabled, exchangeCode, CA_COOKIES } from "@/lib/customer-account";

// Callback del OAuth: valida el state, canjea el code por tokens y los guarda en cookies
// httpOnly. Cualquier fallo → al inicio con ?login=error (sin filtrar detalles).
export async function GET(req: NextRequest) {
  const home = new URL("/", req.url);
  if (!customerAccountsEnabled) return NextResponse.redirect(home);

  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get(CA_COOKIES.state)?.value;
  const verifier = req.cookies.get(CA_COOKIES.pkce)?.value;

  const fail = (why: string) => {
    // TEMP DEBUG — quitar tras validar el login.
    console.error("[account/callback] FAIL:", why, {
      hasCode: !!code,
      hasState: !!state,
      hasVerifier: !!verifier,
      stateMatch: state === savedState,
      errorParam: req.nextUrl.searchParams.get("error"),
      errorDesc: req.nextUrl.searchParams.get("error_description"),
    });
    return NextResponse.redirect(new URL("/?login=error", req.url));
  };
  if (!code) return fail("no-code");
  if (!state || !verifier || state !== savedState) return fail("state/verifier");

  try {
    const tokens = await exchangeCode(code, verifier, `${origin}/account/callback`);
    console.error("[account/callback] token OK:", {
      hasAccess: !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
      expires: tokens.expires_in,
    });
    const res = NextResponse.redirect(home);
    const secure = origin.startsWith("https");
    const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
    res.cookies.set(CA_COOKIES.at, tokens.access_token, { ...base, maxAge: tokens.expires_in });
    res.cookies.set(CA_COOKIES.exp, String(Date.now() + tokens.expires_in * 1000), {
      ...base,
      maxAge: tokens.expires_in,
    });
    if (tokens.refresh_token)
      res.cookies.set(CA_COOKIES.rt, tokens.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 30 });
    if (tokens.id_token)
      res.cookies.set(CA_COOKIES.idt, tokens.id_token, { ...base, maxAge: tokens.expires_in });
    // Limpia las cookies temporales del handshake.
    for (const n of [CA_COOKIES.pkce, CA_COOKIES.state, CA_COOKIES.nonce])
      res.cookies.set(n, "", { ...base, maxAge: 0 });
    return res;
  } catch (e) {
    return fail(`exchange-threw: ${e instanceof Error ? e.message : String(e)}`);
  }
}
