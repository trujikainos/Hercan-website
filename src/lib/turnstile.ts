import "server-only";

/**
 * Verifica el token de Cloudflare Turnstile (CAPTCHA invisible) del formulario de
 * cotización, del lado servidor.
 * - Sin `TURNSTILE_SECRET_KEY` (aún no configurado) → devuelve `true` = se OMITE el
 *   CAPTCHA; el formulario sigue funcionando con honeypot + rate-limit. Se activa
 *   solo al pegar la key en Vercel.
 * - Con la key → valida contra Cloudflare. Si Cloudflare responde que el token es
 *   inválido/ausente, RECHAZA. Si Cloudflare no responde (red/timeout), hace
 *   FAIL-OPEN para no castigar a un lead legítimo por un hipo de red.
 */
const SECRET = process.env.TURNSTILE_SECRET_KEY;

/** ¿El CAPTCHA está configurado y por lo tanto activo? */
export const turnstileEnabled = Boolean(SECRET);

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!SECRET) return true; // no configurado → omitir
  if (!token) return false; // activo pero sin token → rechazar
  try {
    const body = new URLSearchParams({ secret: SECRET, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({ success: false }))) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    // Cloudflare no respondió: no perder el lead (honeypot + rate-limit siguen).
    return true;
  }
}
