"use server";
import { headers } from "next/headers";
import { site, absoluteUrl } from "@/lib/site";

export interface QuoteInput {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  sku?: string;
  cantidad?: string;
  mensaje?: string;
  consent: boolean;
  hp?: string; // honeypot (los bots lo llenan)
  // Producto elegido del catálogo real (via autocompletar). Opcional: si el
  // cliente escribió a mano en vez de elegir, viene undefined y usamos `sku`.
  product?: {
    handle: string;
    title: string;
    sku: string | null;
    mpn: string | null;
  };
}
export interface QuoteResult {
  ok: boolean;
  code?: "INVALID" | "CONSENT" | "RATE" | "EMAIL_UNAVAILABLE" | "SEND_FAIL";
  message: string;
}

// Rate-limit simple en memoria (por IP). Suficiente para frenar abuso básico.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 3, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c);

async function sendEmail(payload: Record<string, unknown>, key: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function submitQuoteAction(data: QuoteInput): Promise<QuoteResult> {
  // Honeypot: si el campo oculto trae texto, es bot → aceptamos en silencio y descartamos.
  if (data.hp && data.hp.trim()) return { ok: true, message: "Recibido." };

  const nombre = (data.nombre ?? "").trim();
  const email = (data.email ?? "").trim();
  if (nombre.length < 2 || !emailRe.test(email))
    return { ok: false, code: "INVALID", message: "Revisa tu nombre y tu correo." };
  if (!data.consent)
    return { ok: false, code: "CONSENT", message: "Acepta el aviso de privacidad para continuar." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip))
    return { ok: false, code: "RATE", message: "Demasiadas solicitudes. Intenta en unos minutos." };

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "HERCAN <onboarding@resend.dev>";
  const to = site.email;
  if (!key || !to)
    return { ok: false, code: "EMAIL_UNAVAILABLE", message: "El correo aún no está configurado." };

  const p = data.product;
  const lines = [
    `Nombre: ${nombre}`,
    data.empresa ? `Empresa: ${data.empresa}` : null,
    `Correo: ${email}`,
    data.telefono ? `Teléfono: ${data.telefono}` : null,
    p ? `Producto: ${p.title}` : data.sku ? `Producto / N° de parte: ${data.sku}` : null,
    p?.mpn ? `N° de parte: ${p.mpn}` : null,
    p?.sku ? `SKU: ${p.sku}` : null,
    p?.handle ? `Ficha: ${absoluteUrl(`/producto/${p.handle}`)}` : null,
    data.cantidad ? `Cantidad: ${data.cantidad}` : null,
    data.mensaje ? `Mensaje: ${data.mensaje}` : null,
  ].filter((l): l is string => Boolean(l));

  try {
    const res = await sendEmail(
      {
        from,
        to: [to],
        reply_to: email,
        subject: `Cotización — ${nombre}${p?.mpn ? ` (${p.mpn})` : data.sku ? ` (${data.sku})` : ""}`,
        text: `Nueva solicitud de cotización desde el sitio:\n\n${lines.join("\n")}`,
        html: `<h2>Nueva solicitud de cotización</h2><ul>${lines
          .map((l) => `<li>${esc(l)}</li>`)
          .join("")}</ul>`,
      },
      key,
    );
    if (!res.ok) {
      console.error("[cotizacion] resend", res.status, await res.text());
      return { ok: false, code: "SEND_FAIL", message: "No pudimos enviar. Prueba por WhatsApp o reintenta." };
    }
    // Autorespuesta al cliente (best-effort, no bloquea el resultado).
    void sendEmail(
      {
        from,
        to: [email],
        reply_to: to, // si el cliente responde a la confirmación, llega a ventas@hercan.com.mx
        subject: "Recibimos tu solicitud de cotización — HERCAN",
        text: `Hola ${nombre}:\n\nRecibimos tu solicitud y te responderemos a la brevedad con precio y disponibilidad.\n\nHERCAN — Herramental para CNC y equipos de medición.`,
      },
      key,
    ).catch(() => {});
    return { ok: true, message: "¡Solicitud enviada! Te responderemos muy pronto." };
  } catch (e) {
    console.error("[cotizacion] error", e);
    return { ok: false, code: "SEND_FAIL", message: "No pudimos enviar. Prueba por WhatsApp o reintenta." };
  }
}
