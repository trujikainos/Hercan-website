"use server";
import { headers } from "next/headers";
import { site, absoluteUrl } from "@/lib/site";
import { customerEmail, leadEmail, type EmailLine } from "@/lib/quote-email";
import { createQuoteDraftOrder, type DraftLine } from "@/lib/shopify-admin";

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
  // Términos del suministro recurrente (solo aplican si recurring = true).
  frecuencia?: string; // Mensual, Quincenal, Trimestral, Semestral
  duracion?: string; // 3 meses, 6 meses, 12 meses, Indefinido
  fechaInicio?: string; // YYYY-MM-DD
  mensaje?: string;
  source?: "whatsapp" | "cotizacion"; // canal de origen del lead
  consent: boolean;
  hp?: string; // honeypot (los bots lo llenan)
}
export interface QuoteResult {
  ok: boolean;
  code?: "INVALID" | "PHONE" | "CONSENT" | "RATE" | "EMAIL_UNAVAILABLE" | "SEND_FAIL";
  message: string;
  folio?: string; // nombre del Borrador de pedido creado (ej. "#D9"), si aplica
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

  // Datos de producto listos para plantillas y borrador.
  const emailLines: EmailLine[] = lines.map((l) => ({
    name: l.product ? l.product.title : (l.text ?? "").trim(),
    qty: l.qty?.trim() || undefined,
    mpn: l.product?.mpn ?? null,
    sku: l.product?.sku ?? null,
    url: l.product?.handle ? absoluteUrl(`/producto/${l.product.handle}`) : null,
  }));

  // ── 1) PRIORIDAD: dar de alta el Borrador de pedido en Shopify (el registro).
  // Se crea PRIMERO para que el lead nunca se pierda, aunque el correo falle.
  let folio: string | undefined;
  let adminUrl: string | undefined;
  let draftOk = false;
  try {
    const draftLines: DraftLine[] = emailLines.map((l) => ({
      name: l.name,
      qty: parseInt((l.qty ?? "").replace(/[^\d]/g, ""), 10) || 1,
      sku: l.sku ?? null,
      mpn: l.mpn ?? null,
    }));
    const draft = await createQuoteDraftOrder({
      nombre,
      empresa: data.empresa,
      email,
      telefono,
      recurring: data.recurring,
      frecuencia: data.frecuencia,
      duracion: data.duracion,
      fechaInicio: data.fechaInicio,
      lines: draftLines,
      mensaje,
      currency: site.currency,
      source: data.source,
    });
    if (draft) {
      draftOk = true;
      folio = draft.name;
      adminUrl = draft.adminUrl;
    }
  } catch (e) {
    console.error("[cotizacion] draftOrder", e);
  }

  // ── 2) Notificar por correo (best-effort; el registro ya quedó en Shopify).
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "HERCAN <onboarding@resend.dev>";
  let emailOk = false;
  if (key && LEADS_TO) {
    const lead = leadEmail({
      nombre,
      empresa: data.empresa,
      email,
      telefono,
      recurring: data.recurring,
      frecuencia: data.frecuencia,
      duracion: data.duracion,
      fechaInicio: data.fechaInicio,
      lines: emailLines,
      mensaje,
      source: data.source,
      folio,
      adminUrl,
    });
    const firstTag = lines[0]?.product?.mpn || (lines[0]?.text ?? "").trim();
    const canal = data.source === "whatsapp" ? "WhatsApp" : "Cotización";
    const tipo = data.recurring ? "Cadena de suministro" : "Venta";
    const subject =
      `📢 ${canal} · ${tipo} — ${nombre}${folio ? ` [${folio}]` : ""}` +
      (lines.length > 1 ? ` (${lines.length} productos)` : firstTag ? ` (${firstTag})` : "");
    try {
      const res = await sendEmail(
        { from, to: [LEADS_TO], reply_to: email, subject, text: lead.text, html: lead.html },
        key,
      );
      if (res.ok) {
        emailOk = true;
        // Autorespuesta al cliente (best-effort).
        try {
          const conf = customerEmail({
            nombre,
            recurring: data.recurring,
            frecuencia: data.frecuencia,
            duracion: data.duracion,
            fechaInicio: data.fechaInicio,
            lines: emailLines,
            folio,
          });
          await sendEmail(
            {
              from,
              to: [email],
              reply_to: LEADS_TO, // si el cliente responde, llega al equipo
              subject: "Recibimos tu solicitud de cotización — HERCAN",
              text: conf.text,
              html: conf.html,
            },
            key,
          );
        } catch (e) {
          console.error("[cotizacion] autorespuesta", e);
        }
      } else {
        console.error("[cotizacion] resend", res.status, await res.text());
      }
    } catch (e) {
      console.error("[cotizacion] email", e);
    }
  }

  // ── 3) OK si quedó registrado por CUALQUIER canal (borrador o correo).
  if (draftOk || emailOk) {
    return { ok: true, folio, message: "¡Solicitud enviada! Te responderemos muy pronto." };
  }
  return {
    ok: false,
    code: "SEND_FAIL",
    message: "No pudimos registrar tu solicitud. Reintenta o escríbenos por WhatsApp.",
  };
}
