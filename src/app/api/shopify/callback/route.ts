export const dynamic = "force-dynamic";

/**
 * Callback del OAuth de setup: canjea el `code` por el Admin API access token
 * y lo muestra en pantalla para copiarlo a SHOPIFY_ADMIN_TOKEN. Uso ÚNICO.
 * Se desactiva quitando SHOPIFY_APP_SECRET del entorno.
 */
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID;
const SECRET = process.env.SHOPIFY_APP_SECRET;

const esc = (s: string) =>
  String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

function page(title: string, bodyHtml: string, ok: boolean) {
  const color = ok ? "#0e3e60" : "#b3261e";
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(
      title,
    )}</title></head><body style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:48px auto;padding:0 16px;color:#23272b;line-height:1.55"><h1 style="color:${color}">${esc(
      title,
    )}</h1>${bodyHtml}</body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: Request) {
  if (!DOMAIN || !CLIENT_ID || !SECRET) {
    return page(
      "Deshabilitado",
      "<p>Faltan <code>SHOPIFY_APP_CLIENT_ID</code> / <code>SHOPIFY_APP_SECRET</code> en el entorno.</p>",
      false,
    );
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const shop = url.searchParams.get("shop");
  if (!code || !shop) {
    return page(
      "Falta información",
      `<p>No llegó <code>code</code> o <code>shop</code>. Inicia en <a href="/api/shopify/install">/api/shopify/install</a>.</p>`,
      false,
    );
  }
  // Seguridad: shop debe ser un dominio myshopify válido (evita SSRF a hosts
  // arbitrarios). No exigimos que coincida con SHOPIFY_STORE_DOMAIN porque una
  // misma tienda puede tener alias (p. ej. hercan-2 vs exv1fw-1e); el canje del
  // `code` solo funciona para la tienda que lo emitió, así que ese es el gate real.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop)) {
    return page("Tienda no válida", `<p>El dominio <code>${esc(shop)}</code> no es un myshopify válido.</p>`, false);
  }
  try {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: SECRET, code }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) {
      return page(
        "No se pudo canjear",
        `<p>Shopify respondió ${res.status}. Suele pasar si el <code>code</code> ya expiró (dura ~2 min): vuelve a <a href="/api/shopify/install">/api/shopify/install</a> y hazlo de corrido.</p><pre style="background:#f4f6f8;padding:12px;border-radius:8px;overflow:auto">${esc(
          JSON.stringify(json),
        )}</pre>`,
        false,
      );
    }
    return page(
      "✓ Token generado",
      `<p>Copia este token y ponlo en <b>Vercel → Environment Variables</b> como <code>SHOPIFY_ADMIN_TOKEN</code> (marca <b>Sensitive</b>):</p>
       <pre style="background:#f4f6f8;padding:14px;border-radius:8px;user-select:all;word-break:break-all;font-size:15px">${esc(
         json.access_token,
       )}</pre>
       <p>Permisos: <code>${esc(json.scope || "")}</code> · Tienda: <code>${esc(shop)}</code></p>
       <hr style="border:none;border-top:1px solid #e9eaec;margin:24px 0">
       <p style="color:#6e7175;font-size:14px">Por seguridad, cuando ya lo tengas: en Vercel <b>elimina</b> <code>SHOPIFY_APP_SECRET</code> (y opcionalmente <code>SHOPIFY_APP_CLIENT_ID</code>) para apagar esta página, y haz redeploy.</p>`,
      true,
    );
  } catch (e) {
    return page("Error", `<p>${esc(String(e))}</p>`, false);
  }
}
