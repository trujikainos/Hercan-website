"use server";
import { headers } from "next/headers";
import { absoluteUrl } from "@/lib/site";
import { customerEmail, leadEmail, type EmailLine } from "@/lib/quote-email";

/** Producto elegido del catálogo real (via autocompletar). */
export interface QuoteProduct {
  handle: string;
  title: string;
  sku: string | null;
  mpn: string | null;
}
/** Una línea de la cotización: un producto (o texto libre) con su cantidad. */
export interface QuoteLine {
  text: string; // título del producto o texto libre escrito a mano
  qty?: string; // cantidad (mensual aprox. si recurring = true)
  product?: QuoteProduct;
}
export interface QuoteInput {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  lines: QuoteLine[]; // uno o varios productos
  recurring: boolean; // suministro constante (pedido recurrente)
  mensaje?: string;
  consent: boolean;
  hp?: string; // honeypot (los bots lo llenan)
}
export interface QuoteResult {
  ok: boolean;
  code?: "INVALID" | "PHONE" | "CONSENT" | "RATE" | "EMAIL_UNAVAILABLE" | "SEND_FAIL";
  message: string;
}

// Destino de los leads (a quién le llega la notificación de cotización).
const LEADS_TO = process.env.QUOTE_LEADS_TO || "leads@weevolveit.com";

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

async function sendEmail(payload: Record<string, unknown>, key: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Registra la solicitud en Google Sheets (best-effort; no bloquea el resultado). */
function logToSheet(row: Record<string, unknown>) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  }).catch(() => {});
}

export async function submitQuoteAction(data: QuoteInput): Promise<QuoteResult> {
  // Honeypot: si el campo oculto trae texto, es bot → aceptamos en silencio y descartamos.
  if (data.hp && data.hp.trim()) return { ok: true, message: "Recibido." };

  const nombre = (data.nombre ?? "").trim();
  const email = (data.email ?? "").trim();
  const telefono = (data.telefono ?? "").trim();
  if (nombre.length < 2 || !emailRe.test(email))
    return { ok: false, code: "INVALID", message: "Revisa tu nombre y tu correo." };
  if (telefono.replace(/\D/g, "").length < 8)
    return { ok: false, code: "PHONE", message: "Déjanos un celular o WhatsApp para contactarte." };
  if (!data.consent)
    return { ok: false, code: "CONSENT", message: "Acepta el aviso de privacidad para continuar." };

  // Solo líneas con contenido (producto elegido o texto escrito).
  const lines = (data.lines ?? []).filter((l) => (l?.text ?? "").trim() || l?.product);
  const mensaje = (data.mensaje ?? "").trim();
  if (lines.length === 0 && !mensaje)
    return { ok: false, code: "INVALID", message: "Cuéntanos qué producto necesitas cotizar." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip))
    return { ok: false, code: "RATE", message: "Demasiadas solicitudes. Intenta en unos minutos." };

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "HERCAN <onboarding@resend.dev>";
  if (!key || !LEADS_TO)
    return { ok: false, code: "EMAIL_UNAVAILABLE", message: "El correo aún no está configurado." };

  // Datos de producto listos para las plantillas.
  const emailLines: EmailLine[] = lines.map((l) => ({
    name: l.product ? l.product.title : (l.text ?? "").trim(),
    qty: l.qty?.trim() || undefined,
    mpn: l.product?.mpn ?? null,
    sku: l.product?.sku ?? null,
    url: l.product?.handle ? absoluteUrl(`/producto/${l.product.handle}`) : null,
  }));

  const lead = leadEmail({ nombre, empresa: data.empresa, email, telefono, recurring: data.recurring, lines: emailLines, mensaje });
  const firstTag = lines[0]?.product?.mpn || (lines[0]?.text ?? "").trim();
  const subject =
    `Nueva cotización${data.recurring ? " recurrente" : ""} — ${nombre}` +
    (lines.length > 1 ? ` (${lines.length} productos)` : firstTag ? ` (${firstTag})` : "");

  try {
    const res = await sendEmail(
      { from, to: [LEADS_TO], reply_to: email, subject, text: lead.text, html: lead.html },
      key,
    );
    if (!res.ok) {
      console.error("[cotizacion] resend", res.status, await res.text());
      return { ok: false, code: "SEND_FAIL", message: "No pudimos enviar. Prueba por WhatsApp o reintenta." };
    }

    // Guarda en Google Sheets (si está configurado el webhook).
    logToSheet({
      fecha: new Date().toISOString(),
      nombre,
      empresa: data.empresa ?? "",
      correo: email,
      celular: telefono,
      tipo: data.recurring ? "Recurrente (mensual)" : "Puntual",
      productos: emailLines
        .map((l) => `${l.name}${l.qty ? ` x${l.qty}` : ""}${l.mpn ? ` [${l.mpn}]` : ""}${l.sku ? ` (SKU ${l.sku})` : ""}`)
        .join(" | "),
      mensaje,
    });

    // Autorespuesta al cliente (best-effort, no bloquea el resultado).
    const conf = customerEmail({ nombre, recurring: data.recurring, lines: emailLines });
    void sendEmail(
      {
        from,
        to: [email],
        reply_to: LEADS_TO, // si el cliente responde a la confirmación, llega al equipo
        subject: "Recibimos tu solicitud de cotización — HERCAN",
        text: conf.text,
        html: conf.html,
      },
      key,
    ).catch(() => {});

    return { ok: true, message: "¡Solicitud enviada! Te responderemos muy pronto." };
  } catch (e) {
    console.error("[cotizacion] error", e);
    return { ok: false, code: "SEND_FAIL", message: "No pudimos enviar. Prueba por WhatsApp o reintenta." };
  }
}
