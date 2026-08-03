import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (antes "middleware" — renombrado en Next 16, corre en Node.js runtime).
 *
 * Renueva la sesión del cliente (Customer Account API de Shopify) ANTES de renderizar:
 * si el access token está por vencer y hay refresh token, lo canjea por uno nuevo y
 * re-escribe las cookies httpOnly. Así la sesión dura semanas (vida del refresh token)
 * en vez de caerse cada ~1-2 h (que es cuando expira el access token).
 *
 * OPTIMIZADO: el `matcher` exige la cookie `hc_cust_rt`, así los visitantes ANÓNIMOS
 * (la mayoría del tráfico) nunca invocan el proxy → cero costo. Y aun con sesión, solo
 * llama a Shopify cuando el token está de verdad por vencer (ventana de 2 min).
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;

// Mismos nombres que en customer-account.ts (CA_COOKIES).
const AT = "hc_cust_at";
const RT = "hc_cust_rt";
const EXP = "hc_cust_exp";
const IDT = "hc_cust_idt";
const REFRESH_WINDOW_MS = 2 * 60 * 1000; // renueva si faltan <2 min para vencer
const RT_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
};

// Canjea el refresh token por un access token nuevo (grant refresh_token). Devuelve
// null ante cualquier fallo (token inválido/expirado o red) → NO se tocan las cookies.
async function refreshTokens(refreshToken: string): Promise<TokenResponse | null> {
  // Token endpoint desde el discovery OIDC de la tienda (no hardcodeado).
  const cfg = await fetch(`https://${DOMAIN}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!cfg.ok) return null;
  const tokenEndpoint = (await cfg.json())?.token_endpoint as string | undefined;
  if (!tokenEndpoint) return null;

  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  // Cliente confidencial (si hay secreto) → Basic auth; público (PKCE) → solo client_id.
  if (CLIENT_SECRET)
    headers["Authorization"] = "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID!,
      refresh_token: refreshToken,
    }).toString(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as TokenResponse;
}

export async function proxy(req: NextRequest) {
  // Guard de correctitud (además del matcher): sin config o sin refresh token, nada que hacer.
  const rt = req.cookies.get(RT)?.value;
  if (!DOMAIN || !CLIENT_ID || !rt) return NextResponse.next();

  const exp = Number(req.cookies.get(EXP)?.value ?? "0");
  const at = req.cookies.get(AT)?.value;
  const needsRefresh = !at || !exp || exp - Date.now() < REFRESH_WINDOW_MS;
  if (!needsRefresh) return NextResponse.next();

  let tokens: TokenResponse | null = null;
  try {
    tokens = await refreshTokens(rt);
  } catch {
    tokens = null;
  }
  // Fallo → NO borramos cookies: un hipo de red no debe cerrar la sesión del cliente.
  if (!tokens?.access_token) return NextResponse.next();

  const newExp = String(Date.now() + tokens.expires_in * 1000);

  // 1) Actualiza la REQUEST → el render de ESTE mismo request ya ve el token nuevo (si
  //    no, la página que gatilló el refresh aún leería el token viejo y se vería deslogueada).
  req.cookies.set(AT, tokens.access_token);
  req.cookies.set(EXP, newExp);
  if (tokens.refresh_token) req.cookies.set(RT, tokens.refresh_token);
  if (tokens.id_token) req.cookies.set(IDT, tokens.id_token);

  const res = NextResponse.next({ request: req });

  // 2) Escribe las cookies en la RESPUESTA → el navegador guarda el token nuevo.
  const secure = req.nextUrl.protocol === "https:";
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  res.cookies.set(AT, tokens.access_token, { ...base, maxAge: tokens.expires_in });
  res.cookies.set(EXP, newExp, { ...base, maxAge: tokens.expires_in });
  if (tokens.refresh_token) res.cookies.set(RT, tokens.refresh_token, { ...base, maxAge: RT_MAX_AGE });
  if (tokens.id_token) res.cookies.set(IDT, tokens.id_token, { ...base, maxAge: tokens.expires_in });

  return res;
}

export const config = {
  // Solo rutas de app (excluye assets estáticos) Y solo si existe la cookie de sesión
  // `hc_cust_rt` → los anónimos nunca invocan el proxy. Las claves deben ser literales.
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      has: [{ type: "cookie", key: "hc_cust_rt" }],
    },
  ],
};
