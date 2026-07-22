/**
 * Plantillas HTML (y texto) de los correos de cotización.
 * - customerEmail: confirmación con diseño de marca para el cliente.
 * - leadEmail: notificación interna (a leads@weevolveit.com) con botones de
 *   "Responder al cliente" (email) y "Responder por WhatsApp" (si dejó celular).
 * Solo servidor. Todo el contenido dinámico va escapado (anti-inyección HTML).
 */
import { site } from "./site";

const C = {
  navy: "#0e3e60",
  blue: "#1f5a82",
  steel: "#2083a3",
  sky: "#5e9cc1",
  ink: "#23272b",
  gun: "#6e7175",
  soft: "#f4f6f8",
  metalLight: "#e9eaec",
  white: "#ffffff",
  green: "#25d366",
};

/** Escapa para HTML (contenido y atributos). */
const esc = (s: string) =>
  String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

/** Deja el celular listo para wa.me (dígitos con lada país; asume MX si son 10). */
export function normalizeWhatsApp(phone?: string): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10) d = "52" + d; // MX sin lada país
  else if (d.length === 11 && d.startsWith("1")) d = "52" + d.slice(1);
  return d;
}

export interface EmailLine {
  name: string;
  qty?: string;
  mpn?: string | null;
  sku?: string | null;
  url?: string | null; // URL absoluta a la ficha
}

// ── piezas reutilizables ──

function shell(preheader: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.soft};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.soft};">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:14px;overflow:hidden;border:1px solid ${C.metalLight};font-family:Arial,Helvetica,sans-serif;">
        <tr><td style="background:${C.navy};padding:22px 28px;">
          <span style="font-size:22px;font-weight:bold;letter-spacing:3px;color:${C.white};">HERCAN</span>
          <span style="display:block;font-size:11px;color:${C.sky};margin-top:3px;letter-spacing:.3px;">Herramental para CNC y equipos de medición</span>
        </td></tr>
        <tr><td style="padding:28px;">${bodyHtml}</td></tr>
        <tr><td style="background:${C.soft};padding:18px 28px;border-top:1px solid ${C.metalLight};">
          <p style="margin:0;font-size:11px;line-height:1.6;color:${C.gun};">
            ${esc(site.legalName)}<br>
            Distribuidor B2B — Iscar, Toolmex, YG, Palbit, Mitutoyo.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(url: string, label: string, bg: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-block;margin:4px 8px 4px 0;"><tr>
    <td align="center" bgcolor="${bg}" style="border-radius:8px;">
      <a href="${esc(url)}" style="display:inline-block;padding:12px 22px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
    </td></tr></table>`;
}

function productBlock(l: EmailLine, qtyLabel: string, forLead: boolean): string {
  const meta: string[] = [];
  if (l.qty) meta.push(`${esc(qtyLabel)}: <strong style="color:${C.ink};">${esc(l.qty)}</strong>`);
  if (forLead && l.mpn) meta.push(`N° parte: ${esc(l.mpn)}`);
  if (forLead && l.sku) meta.push(`SKU: ${esc(l.sku)}`);
  const ficha =
    forLead && l.url
      ? `<div style="margin-top:5px;"><a href="${esc(l.url)}" style="color:${C.steel};text-decoration:none;font-size:12px;font-weight:bold;">Ver ficha del producto &rarr;</a></div>`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border:1px solid ${C.metalLight};border-radius:8px;">
    <tr><td style="padding:11px 13px;border-left:3px solid ${C.steel};border-radius:8px;">
      <div style="font-size:14px;color:${C.ink};font-weight:bold;line-height:1.35;">${esc(l.name)}</div>
      ${meta.length ? `<div style="font-size:12px;color:${C.gun};margin-top:4px;">${meta.join(" &nbsp;·&nbsp; ")}</div>` : ""}
      ${ficha}
    </td></tr>
  </table>`;
}

function linesText(lines: EmailLine[], qtyLabel: string, forLead: boolean): string {
  return lines
    .map((l, i) => {
      const sub = [`${i + 1}. ${l.name}`];
      if (l.qty) sub.push(`   ${qtyLabel}: ${l.qty}`);
      if (forLead && l.mpn) sub.push(`   N° de parte: ${l.mpn}`);
      if (forLead && l.sku) sub.push(`   SKU: ${l.sku}`);
      if (forLead && l.url) sub.push(`   Ficha: ${l.url}`);
      return sub.join("\n");
    })
    .join("\n\n");
}

// ── correo al CLIENTE (confirmación) ──

export interface CustomerEmailInput {
  nombre: string;
  recurring: boolean;
  lines: EmailLine[];
  frecuencia?: string;
  duracion?: string;
  fechaInicio?: string;
}

/** Resumen corto de los términos del suministro recurrente (para textos). */
function recurringTerms(t: { frecuencia?: string; duracion?: string; fechaInicio?: string }): string {
  return [
    t.frecuencia ? `frecuencia ${t.frecuencia.toLowerCase()}` : "",
    t.duracion ? `duración ${t.duracion.toLowerCase()}` : "",
    t.fechaInicio ? `inicio ${t.fechaInicio}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function customerEmail(input: CustomerEmailInput): { html: string; text: string } {
  const qtyLabel = input.recurring ? "Cant. mensual aprox." : "Cantidad";
  const productsHtml = input.lines.map((l) => productBlock(l, qtyLabel, false)).join("");
  const waSelf = site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hola, quiero dar seguimiento a mi solicitud de cotización.")}`
    : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:20px;color:${C.navy};">¡Recibimos tu solicitud!</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${C.ink};">
      Hola <strong>${esc(input.nombre)}</strong>, gracias por contactarnos. Un especialista revisará tu solicitud
      y te responderá muy pronto con <strong>precio y disponibilidad</strong>.
    </p>
    ${
      input.recurring
        ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:${C.steel};background:${C.soft};padding:10px 14px;border-radius:8px;">Registramos tu solicitud como <strong>suministro recurrente</strong>${
            recurringTerms(input) ? ` (${esc(recurringTerms(input))})` : ""
          }: prepararemos una propuesta de abasto continuo.</p>`
        : ""
    }
    ${
      productsHtml
        ? `<p style="margin:20px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${C.gun};">Resumen de tu solicitud</p>${productsHtml}`
        : ""
    }
    ${waSelf ? `<p style="margin:22px 0 6px;font-size:14px;color:${C.ink};">¿Es urgente?</p>${button(waSelf, "Escríbenos por WhatsApp", C.green)}` : ""}
    <p style="margin:22px 0 0;font-size:13px;line-height:1.5;color:${C.gun};">Puedes responder directamente este correo y te atenderemos.</p>
  `;

  const text =
    `Hola ${input.nombre}:\n\n` +
    "Recibimos tu solicitud de cotización y te responderemos muy pronto con precio y disponibilidad.\n" +
    (input.recurring ? "\nRegistramos tu solicitud como suministro recurrente.\n" : "") +
    (input.lines.length ? `\nResumen de tu solicitud:\n${linesText(input.lines, qtyLabel, false)}\n` : "") +
    "\nHERCAN — Herramental para CNC y equipos de medición.";

  return { html: shell("Recibimos tu solicitud de cotización — HERCAN", body), text };
}

// ── correo interno (LEAD) ──

export interface LeadEmailInput {
  nombre: string;
  empresa?: string;
  email: string;
  telefono?: string;
  recurring: boolean;
  lines: EmailLine[];
  mensaje?: string;
  frecuencia?: string;
  duracion?: string;
  fechaInicio?: string;
}

export function leadEmail(input: LeadEmailInput): { html: string; text: string } {
  const qtyLabel = input.recurring ? "Cant. mensual aprox." : "Cantidad";
  const productsHtml = input.lines.map((l) => productBlock(l, qtyLabel, true)).join("");

  const mailto = `mailto:${esc(input.email)}?subject=${encodeURIComponent(
    "Tu solicitud de cotización — HERCAN",
  )}&body=${encodeURIComponent(`Hola ${input.nombre}:\n\n`)}`;
  const wa = normalizeWhatsApp(input.telefono);
  const waUrl = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `Hola ${input.nombre}, te contactamos de HERCAN por tu solicitud de cotización.`,
      )}`
    : "";

  const infoRows: [string, string][] = [
    ["Cliente", input.nombre],
    ...(input.empresa ? ([["Empresa", input.empresa]] as [string, string][]) : []),
    ["Correo", input.email],
    ...(input.telefono ? ([["Celular / WhatsApp", input.telefono]] as [string, string][]) : []),
    ["Tipo", input.recurring ? "Suministro constante (recurrente)" : "Compra puntual"],
    ...(input.recurring && input.frecuencia ? ([["Frecuencia", input.frecuencia]] as [string, string][]) : []),
    ...(input.recurring && input.duracion ? ([["Duración", input.duracion]] as [string, string][]) : []),
    ...(input.recurring && input.fechaInicio ? ([["Inicio deseado", input.fechaInicio]] as [string, string][]) : []),
  ];
  const infoHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${infoRows
      .map(
        ([k, v]) => `<tr>
      <td style="padding:4px 0;font-size:12px;color:${C.gun};width:120px;vertical-align:top;">${esc(k)}</td>
      <td style="padding:4px 0;font-size:13px;color:${C.ink};"><strong>${esc(v)}</strong></td>
    </tr>`,
      )
      .join("")}
  </table>`;

  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;color:${C.navy};">Nueva solicitud de cotización</h1>
    <p style="margin:0 0 16px;font-size:13px;color:${C.gun};">Llegó una solicitud desde el sitio. Responde al cliente cuanto antes.</p>
    <div style="background:${C.soft};border-radius:10px;padding:14px 16px;margin:0 0 16px;">${infoHtml}</div>
    <div style="margin:0 0 4px;">
      ${button(mailto, "&#9993; Responder al cliente", C.blue)}
      ${waUrl ? button(waUrl, "&#128172; Responder por WhatsApp", C.green) : ""}
    </div>
    ${
      productsHtml
        ? `<p style="margin:22px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${C.gun};">Productos solicitados</p>${productsHtml}`
        : ""
    }
    ${
      input.mensaje
        ? `<p style="margin:18px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${C.gun};">Mensaje del cliente</p><div style="font-size:14px;line-height:1.5;color:${C.ink};background:${C.soft};padding:12px 14px;border-radius:8px;white-space:pre-wrap;">${esc(input.mensaje)}</div>`
        : ""
    }
  `;

  const text =
    "Nueva solicitud de cotización desde el sitio:\n\n" +
    infoRows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (input.lines.length ? `\n\nProductos solicitados:\n${linesText(input.lines, qtyLabel, true)}` : "") +
    (input.mensaje ? `\n\nMensaje:\n${input.mensaje}` : "") +
    `\n\nResponder al cliente: ${input.email}` +
    (waUrl ? `\nWhatsApp: ${waUrl}` : "");

  return { html: shell("Nueva solicitud de cotización", body), text };
}
