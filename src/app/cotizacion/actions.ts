"use server";
import { headers } from "next/headers";
import { site, absoluteUrl } from "@/lib/site";

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
  const to = site.email;
  if (!key || !to)
    return { ok: false, code: "EMAIL_UNAVAILABLE", message: "El correo aún no está configurado." };

  const qtyLabel = data.recurring ? "Cant. mensual aprox." : "Cantidad";

  // ── Cuerpo en texto plano ──
  const head = [
    `Nombre: ${nombre}`,
    data.empresa ? `Empresa: ${data.empresa}` : null,
    `Correo: ${email}`,
    data.telefono ? `Teléfono: ${data.telefono}` : null,
    `Tipo de solicitud: ${
      data.recurring ? "Suministro constante (pedido recurrente)" : "Compra puntual"
    }`,
  ].filter((l): l is string => Boolean(l));

  const productText = lines.map((l, i) => {
    const p = l.product;
    const name = p ? p.title : (l.text ?? "").trim();
    const sub = [`${i + 1}. ${name}`];
    if (l.qty?.trim()) sub.push(`   ${qtyLabel}: ${l.qty.trim()}`);
    if (p?.mpn) sub.push(`   N° de parte: ${p.mpn}`);
    if (p?.sku) sub.push(`   SKU: ${p.sku}`);
    if (p?.handle) sub.push(`   Ficha: ${absoluteUrl(`/producto/${p.handle}`)}`);
    return sub.join("\n");
  });

  const text =
    "Nueva solicitud de cotización desde el sitio:\n\n" +
    head.join("\n") +
    (productText.length ? `\n\nProductos solicitados:\n${productText.join("\n\n")}` : "") +
    (mensaje ? `\n\nMensaje:\n${mensaje}` : "");

  // ── Cuerpo en HTML (escapado) ──
  const htmlHead = head.map((l) => `<li>${esc(l)}</li>`).join("");
  const htmlProducts = lines
    .map((l) => {
      const p = l.product;
      const name = esc(p ? p.title : (l.text ?? "").trim());
      const bits: string[] = [];
      if (l.qty?.trim()) bits.push(`${esc(qtyLabel)}: ${esc(l.qty.trim())}`);
      if (p?.mpn) bits.push(`N° de parte: ${esc(p.mpn)}`);
      if (p?.sku) bits.push(`SKU: ${esc(p.sku)}`);
      const ficha = p?.handle
        ? ` — <a href="${esc(absoluteUrl(`/producto/${p.handle}`))}">ver ficha</a>`
        : "";
      return `<li><strong>${name}</strong>${
        bits.length ? `<br><span style="color:#555">${bits.join(" · ")}</span>` : ""
      }${ficha}</li>`;
    })
    .join("");

  const html =
    "<h2>Nueva solicitud de cotización</h2>" +
    `<ul>${htmlHead}</ul>` +
    (htmlProducts ? `<h3>Productos solicitados</h3><ol>${htmlProducts}</ol>` : "") +
    (mensaje ? `<h3>Mensaje</h3><p>${esc(mensaje)}</p>` : "");

  // Etiqueta para el asunto: N° de parte del 1er producto, o el texto escrito.
  const firstTag = lines[0]?.product?.mpn || (lines[0]?.text ?? "").trim();
  const subject =
    `Cotización${data.recurring ? " recurrente" : ""} — ${nombre}` +
    (lines.length > 1 ? ` (${lines.length} productos)` : firstTag ? ` (${firstTag})` : "");

  try {
    const res = await sendEmail(
      { from, to: [to], reply_to: email, subject, text, html },
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
