import "server-only";
import { site, INDEXABLE } from "@/lib/site";

/**
 * IndexNow — notifica a los buscadores que participan (Bing, Yandex, Naver,
 * Seznam) que una URL cambió → la re-rastrean casi al instante. Google NO
 * participa en IndexNow; para Google el camino oficial es sitemap + Search Console.
 *
 * La CLAVE es PÚBLICA por diseño: se publica en `public/<KEY>.txt` (accesible en
 * https://hercan.com.mx/<KEY>.txt) para que los buscadores verifiquen que somos
 * dueños del dominio. NO es un secreto (por eso puede vivir en el repo).
 */
export const INDEXNOW_KEY = "a7f3c9e21b8d4f6a0c5e9d2b7148f6e3";

const HOST = (() => {
  try {
    return new URL(site.url).host;
  } catch {
    return "hercan.com.mx";
  }
})();

/**
 * Avisa a IndexNow que unas rutas cambiaron. Recibe rutas RELATIVAS
 * ("/producto/x"); construye las URLs absolutas con `site.url`.
 *
 * - Solo dispara en PRODUCCIÓN indexable (no en preview/local, para no notificar
 *   URLs de staging).
 * - Falla en SILENCIO (nunca rompe el flujo que la llama, p. ej. el webhook).
 * - IndexNow acepta hasta 10,000 URLs por request.
 */
export async function submitToIndexNow(paths: string[]): Promise<void> {
  if (!INDEXABLE || paths.length === 0) return;
  const urlList = paths.map((p) => new URL(p, site.url).toString()).slice(0, 10000);
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${site.url}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      cache: "no-store",
      // Corto: el webhook de Shopify debe responder 2xx en pocos segundos.
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* IndexNow no respondió a tiempo → no bloquear al llamador */
  }
}
