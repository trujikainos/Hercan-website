export const dynamic = "force-dynamic";

/**
 * Setup ÚNICO: inicia el OAuth para obtener el Admin API token de la tienda.
 * Inerte salvo que estén configuradas SHOPIFY_APP_CLIENT_ID + SHOPIFY_APP_SECRET.
 * Visita /api/shopify/install → aprueba en Shopify → /api/shopify/callback muestra el token.
 */
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID;
const SCOPES =
  "write_draft_orders,read_products,write_products,read_inventory,write_inventory,read_publications,write_publications";

export async function GET(request: Request) {
  // Setup de un solo uso: SOLO local/dev. En producción responde 404 aunque las
  // credenciales estén presentes → un tercero nunca puede iniciar este flujo en
  // el sitio en vivo (el token ya se obtuvo; esta ruta ya no se necesita en prod).
  if (process.env.NODE_ENV === "production") {
    return new Response("No disponible.", { status: 404 });
  }
  if (!DOMAIN || !CLIENT_ID || !process.env.SHOPIFY_APP_SECRET) {
    return new Response(
      "Instalación OAuth deshabilitada. Configura SHOPIFY_APP_CLIENT_ID y SHOPIFY_APP_SECRET en el entorno.",
      { status: 404 },
    );
  }
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/shopify/callback`;
  const authorize =
    `https://${DOMAIN}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  return Response.redirect(authorize, 302);
}
