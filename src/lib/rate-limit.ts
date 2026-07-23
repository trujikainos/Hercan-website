import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate-limit del formulario de cotización (protege el canal de leads B2B).
 * - Con `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` → límite DURABLE
 *   compartido entre TODAS las funciones serverless de Vercel (sliding window en
 *   Redis). Es lo único que frena de verdad el spam distribuido: el Map en memoria
 *   se reinicia por instancia, así que apenas frena.
 * - Sin esas vars (local/dev, o antes de configurar Upstash) → fallback a un Map en
 *   memoria por instancia (el comportamiento previo). Se "enciende" solo al pegar
 *   las credenciales en Vercel.
 * Ante un error de red de Redis hace FAIL-OPEN (no bloquea): mejor dejar pasar un
 * lead que perderlo por un hipo de Upstash; el honeypot + el CAPTCHA siguen activos.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Backend efectivo (para logs/diagnóstico). */
export const rateLimitBackend: "upstash" | "memory" = url && token ? "upstash" : "memory";

// ── Upstash (durable) ──
let ipLimiter: Ratelimit | null = null;
let emailLimiter: Ratelimit | null = null;
if (url && token) {
  const redis = new Redis({ url, token });
  // Por IP: 5 / 10 min (holgado para un cliente que corrige y reenvía).
  ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:cotizacion:ip",
    analytics: false,
  });
  // Por email: 3 / 10 min (frena reenvíos con el mismo correo desde varias IP).
  emailLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "rl:cotizacion:email",
    analytics: false,
  });
}

// ── Memoria (fallback por instancia) ──
const memHits = new Map<string, number[]>();
function memLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (memHits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  memHits.set(key, arr);
  return arr.length > max;
}

/**
 * ¿Bloqueado por exceder el límite? `true` = bloquear. Nunca lanza.
 * @param kind "ip" o "email" (namespaces separados).
 * @param id   la IP o el correo (se normaliza a minúsculas/trim).
 */
export async function limited(kind: "ip" | "email", id: string): Promise<boolean> {
  const key = (id ?? "").trim().toLowerCase();
  if (!key || key === "unknown") return false;
  const limiter = kind === "ip" ? ipLimiter : emailLimiter;
  if (limiter) {
    try {
      const { success } = await limiter.limit(key);
      return !success;
    } catch {
      return false; // fail-open ante caída/timeout de Redis
    }
  }
  // Fallback en memoria (mismos topes que Upstash).
  const max = kind === "ip" ? 5 : 3;
  return memLimited(`${kind}:${key}`, max, 10 * 60 * 1000);
}
