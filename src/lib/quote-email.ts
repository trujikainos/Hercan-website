/**
 * Plantillas HTML (y texto) de los correos de cotización.
 * - customerEmail: confirmación con diseño de marca para el cliente.
 * - leadEmail: notificación interna (a leads@weevolveit.com) con botones de
 *   "Responder al cliente" (email) y "Responder por WhatsApp" (si dejó celular).
 * Solo servidor. Todo el contenido dinámico va escapado (anti-inyección HTML).
 *
 * Diseño: HTML "bulletproof" (tablas + estilos inline, máx. 600px, fuentes
 * web-safe, botones tabla+bgcolor). Fondos explícitos en cada celda para que
 * también luzca bien en modo oscuro. Sin imágenes, fuentes ni scripts remotos.
 */
import { site } from "./site";
import { qtyLabelLong } from "./frequency";

const C = {
  navy: "#0e3e60",
  navyDeep: "#0a3350",
  blue: "#1f5a82",
  steel: "#2083a3",
  sky: "#5e9cc1",
  mist: "#a9c2d6", // texto claro legible sobre navy (pie)
  ink: "#23272b",
  gun: "#6e7175",
  soft: "#f4f6f8",
  metal: "#c0c0c2",
  metalLight: "#e9eaec",
  hair: "#e4e7eb",
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

/** Formatea dígitos de WhatsApp para lectura humana (agrupado, con +). */
function waDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("52")) return `+52 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return d ? `+${d}` : "";
}

export interface EmailLine {
  name: string;
  qty?: string;
  mpn?: string | null;
  sku?: string | null;
  url?: string | null; // URL absoluta a la ficha
}

// ── piezas reutilizables ──

function shell(preheader: string, headerTag: string, bodyHtml: string): string {
  const waFooter = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "";
  const host = site.url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>HERCAN</title>
  <!--[if mso]><style type="text/css">table,td,a{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .sm-px{padding-left:22px !important;padding-right:22px !important;}
      .sm-btn{display:block !important;width:100% !important;margin-right:0 !important;}
      .sm-btn a{display:block !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.soft};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.soft};mso-hide:all;">${esc(preheader)}&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};">
    <tr><td align="center" style="padding:26px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${C.white};border-radius:16px;overflow:hidden;border:1px solid ${C.metalLight};">

        <!-- Encabezado -->
        <tr><td class="sm-px" style="background:${C.navy};padding:24px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="middle">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;letter-spacing:4px;color:${C.white};line-height:1;">HERCAN</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.sky};letter-spacing:.4px;margin-top:6px;">${esc(site.tagline)}</div>
            </td>
            <td valign="middle" align="right">
              <span style="display:inline-block;background:${C.navyDeep};border:1px solid ${C.steel};border-radius:20px;padding:5px 12px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${C.sky};white-space:nowrap;">${esc(headerTag)}</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Barra de acento (espectro de marca) -->
        <tr><td style="padding:0;font-size:0;line-height:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="25%" height="4" bgcolor="${C.sky}" style="height:4px;line-height:4px;font-size:4px;mso-line-height-rule:exactly;">&nbsp;</td>
            <td width="25%" height="4" bgcolor="${C.steel}" style="height:4px;line-height:4px;font-size:4px;mso-line-height-rule:exactly;">&nbsp;</td>
            <td width="25%" height="4" bgcolor="${C.blue}" style="height:4px;line-height:4px;font-size:4px;mso-line-height-rule:exactly;">&nbsp;</td>
            <td width="25%" height="4" bgcolor="${C.navy}" style="height:4px;line-height:4px;font-size:4px;mso-line-height-rule:exactly;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Cuerpo -->
        <tr><td class="sm-px" style="padding:30px;background:${C.white};">${bodyHtml}</td></tr>

        <!-- Pie -->
        <tr><td class="sm-px" style="background:${C.navy};padding:24px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="top">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;letter-spacing:3px;color:${C.white};line-height:1;">HERCAN</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.sky};margin-top:5px;">${esc(site.tagline)}</div>
            </td>
            ${
              waFooter
                ? `<td valign="top" align="right">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right"><tr>
                <td bgcolor="${C.green}" style="border-radius:8px;mso-padding-alt:9px 16px;">
                  <a href="${esc(waFooter)}" style="display:inline-block;padding:9px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;color:#ffffff;text-decoration:none;">WhatsApp</a>
                </td>
              </tr></table>
            </td>`
                : ""
            }
          </tr></table>
          <div style="height:1px;background:${C.blue};margin:16px 0;line-height:1px;font-size:1px;">&nbsp;</div>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:${C.mist};">
            ${esc(site.legalName)}<br>
            ${site.whatsapp ? `WhatsApp <a href="${esc(waFooter)}" style="color:${C.sky};text-decoration:none;">${esc(waDisplay(site.whatsapp))}</a> &nbsp;&middot;&nbsp; ` : ""}<a href="${esc(site.url)}" style="color:${C.sky};text-decoration:none;">${esc(host)}</a><br>
            Distribuidor B2B — Iscar, Toolmex, YG, Palbit, Mitutoyo.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Botón "bulletproof" (tabla + bgcolor + <a> con padding). `label` es HTML de confianza (no se escapa). */
function button(url: string, label: string, bg: string): string {
  return `<table role="presentation" class="sm-btn" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin:0 8px 10px 0;">
    <tr>
      <td align="center" bgcolor="${bg}" style="border-radius:8px;mso-padding-alt:14px 26px;">
        <a href="${esc(url)}" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1;font-weight:bold;letter-spacing:.2px;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Encabezado de sección: tick de acento + rótulo en mayúsculas + hairline. */
function sectionLabel(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 12px;">
    <tr>
      <td width="22" valign="middle" style="padding-right:8px;">
        <div style="height:2px;background:${C.steel};line-height:2px;font-size:2px;">&nbsp;</div>
      </td>
      <td valign="middle" style="white-space:nowrap;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.steel};">${text}</span>
      </td>
      <td valign="middle" style="width:100%;padding-left:8px;">
        <div style="height:1px;background:${C.hair};line-height:1px;font-size:1px;">&nbsp;</div>
      </td>
    </tr>
  </table>`;
}

/** Fila de "¿Qué sigue?": número en círculo + título + descripción. */
function stepRow(n: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
    <tr>
      <td width="34" valign="top">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="26" height="26" align="center" bgcolor="${C.navy}" style="width:26px;height:26px;border-radius:13px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;color:#ffffff;line-height:26px;mso-line-height-rule:exactly;">${n}</td>
        </tr></table>
      </td>
      <td valign="top" style="padding-left:4px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${C.ink};line-height:1.35;">${title}</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.gun};line-height:1.5;margin-top:2px;">${desc}</div>
      </td>
    </tr>
  </table>`;
}

function productBlock(l: EmailLine, qtyLabel: string, forLead: boolean): string {
  const meta: string[] = [];
  if (l.qty)
    meta.push(`<span style="color:${C.gun};">${esc(qtyLabel)}:</span> <strong style="color:${C.ink};">${esc(l.qty)}</strong>`);
  if (forLead && l.mpn)
    meta.push(`<span style="color:${C.gun};">N° parte:</span> <strong style="color:${C.ink};">${esc(l.mpn)}</strong>`);
  if (forLead && l.sku)
    meta.push(`<span style="color:${C.gun};">SKU:</span> <strong style="color:${C.ink};">${esc(l.sku)}</strong>`);
  const sep = ` &nbsp;<span style="color:${C.metal};">|</span>&nbsp; `;
  const metaHtml = meta.length
    ? `<div style="height:1px;background:${C.hair};margin:11px 0;line-height:1px;font-size:1px;">&nbsp;</div>
       <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;">${meta.join(sep)}</div>`
    : "";
  const ficha =
    forLead && l.url
      ? `<div style="margin-top:11px;"><a href="${esc(l.url)}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;color:${C.steel};text-decoration:none;">Ver ficha del producto &nbsp;&rarr;</a></div>`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:${C.white};border:1px solid ${C.metalLight};border-radius:10px;">
    <tr>
      <td style="padding:15px 18px;border-left:4px solid ${C.steel};border-top-left-radius:10px;border-bottom-left-radius:10px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${C.ink};line-height:1.4;">${esc(l.name)}</div>
        ${metaHtml}
        ${ficha}
      </td>
    </tr>
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
  folio?: string; // folio de seguimiento para el cliente (ej. #D9)
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
  const qtyLabel = qtyLabelLong(input.recurring, input.frecuencia);
  const productsHtml = input.lines.map((l) => productBlock(l, qtyLabel, false)).join("");
  const waSelf = site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hola, quiero dar seguimiento a mi solicitud de cotización.")}`
    : "";
  const terms = recurringTerms(input);

  const folioHtml = input.folio
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:${C.navy};border-radius:12px;">
         <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;">
           <div style="font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:${C.sky};">Folio de tu solicitud</div>
           <div style="margin-top:3px;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:bold;letter-spacing:1px;color:#ffffff;">${esc(input.folio)}</div>
           <div style="margin-top:3px;font-size:12px;color:${C.mist};">Guárdalo para dar seguimiento a tu solicitud.</div>
         </td></tr>
       </table>`
    : "";

  const stepsHtml =
    stepRow("1", "Revisamos tu solicitud", "Un especialista valida los productos y las cantidades.") +
    stepRow("2", "Preparamos tu cotización", "Con precio, disponibilidad y tiempo de entrega.") +
    stepRow("3", "Te contactamos", "Por correo o WhatsApp para cerrar tu pedido.");

  const body = `
    <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;font-weight:bold;color:${C.navy};">¡Recibimos tu solicitud!</h1>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${C.ink};">
      Hola <strong style="color:${C.navy};">${esc(input.nombre)}</strong>, gracias por escribirnos. Un especialista está revisando tu solicitud y te responderá muy pronto con <strong>precio y disponibilidad</strong>.
    </p>
    ${folioHtml}
    ${
      input.recurring
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:${C.soft};border:1px solid ${C.metalLight};border-radius:10px;">
             <tr>
               <td width="4" bgcolor="${C.steel}" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
               <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${C.blue};">
                 Registramos tu solicitud como <strong style="color:${C.navy};">suministro recurrente</strong>${
                   terms ? ` <span style="color:${C.gun};">(${esc(terms)})</span>` : ""
                 }. Prepararemos una propuesta de abasto continuo.
               </td>
             </tr>
           </table>`
        : ""
    }
    ${productsHtml ? sectionLabel("Resumen de tu solicitud") + productsHtml : ""}
    ${sectionLabel("¿Qué sigue?")}${stepsHtml}
    ${
      waSelf
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;background:${C.soft};border:1px solid ${C.metalLight};border-radius:12px;">
             <tr><td style="padding:16px 18px;">
               <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${C.ink};margin-bottom:2px;">¿Es urgente?</div>
               <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${C.gun};line-height:1.5;margin-bottom:12px;">Escríbenos por WhatsApp y te atendemos al momento.</div>
               ${button(waSelf, "&#128172;&nbsp; Escríbenos por WhatsApp", C.green)}
             </td></tr>
           </table>`
        : ""
    }
    <div style="height:1px;background:${C.hair};margin:24px 0 16px;line-height:1px;font-size:1px;">&nbsp;</div>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${C.gun};">
      También puedes responder directamente a este correo — te contestará el mismo especialista que revisa tu solicitud.
    </p>
  `;

  const text =
    `HERCAN — ${site.tagline}\n\n` +
    `Hola ${input.nombre}:\n\n` +
    "Recibimos tu solicitud de cotización y te responderemos muy pronto con precio y disponibilidad.\n" +
    (input.folio ? `\nFolio de tu solicitud: ${input.folio} (guárdalo para dar seguimiento).\n` : "") +
    (input.recurring ? `\nRegistramos tu solicitud como suministro recurrente${terms ? ` (${terms})` : ""}.\n` : "") +
    (input.lines.length ? `\nResumen de tu solicitud:\n${linesText(input.lines, qtyLabel, false)}\n` : "") +
    "\n¿Qué sigue? Revisamos tu solicitud, preparamos la cotización con precio y disponibilidad, y te contactamos.\n" +
    (waSelf ? `\n¿Urgente? Escríbenos por WhatsApp: ${waSelf}\n` : "") +
    "\nTambién puedes responder directamente a este correo.\n" +
    `\n— HERCAN${site.whatsapp ? ` · WhatsApp ${waDisplay(site.whatsapp)}` : ""}\n${site.legalName}`;

  return { html: shell("Recibimos tu solicitud de cotización — HERCAN", "Confirmación", body), text };
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
  source?: "whatsapp" | "cotizacion"; // canal de origen del lead
  folio?: string; // nombre del borrador (ej. #D9)
  adminUrl?: string; // URL del borrador en el admin de Shopify
}

export function leadEmail(input: LeadEmailInput): { html: string; text: string } {
  const qtyLabel = qtyLabelLong(input.recurring, input.frecuencia);
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

  const isWa = input.source === "whatsapp";
  const banner = isWa
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f8ef;border:1px solid #bfe9cf;border-radius:10px;margin:0 0 18px;">
         <tr><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:#0f6b3a;">
           <strong>&#128241;&nbsp; Llegó por WhatsApp</strong><br>El cliente espera respuesta por <strong>WhatsApp</strong> — atiéndelo por ahí para cerrar más rápido.
         </td></tr>
       </table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.metalLight};border-radius:10px;margin:0 0 18px;">
         <tr><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${C.navy};">
           <strong>&#9993;&nbsp; Llegó por el formulario de cotización</strong><br>Respóndele por <strong>correo</strong>${input.telefono ? " (o WhatsApp si prefieres)" : ""}.
         </td></tr>
       </table>`;

  const typeBadge = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td>${
    input.recurring
      ? `<span style="display:inline-block;background:#fff4e5;border:1px solid #f2c98a;border-radius:20px;padding:7px 15px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.3px;color:#8a5a00;">&#128260;&nbsp; Cadena de suministro · pedido recurrente</span>`
      : `<span style="display:inline-block;background:#eef4f8;border:1px solid #cfe0ec;border-radius:20px;padding:7px 15px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.3px;color:#1f5a82;">&#128722;&nbsp; Venta normal · compra única</span>`
  }</td></tr></table>`;

  const btnMail = button(mailto, "&#9993;&nbsp; Responder al cliente", C.blue);
  const btnWa = waUrl ? button(waUrl, "&#128172;&nbsp; Responder por WhatsApp", C.green) : "";
  const btnDraft = input.adminUrl ? button(input.adminUrl, "&#128203;&nbsp; Ver borrador en Shopify", C.steel) : "";
  const responder = isWa ? `${btnWa}${btnMail}${btnDraft}` : `${btnMail}${btnWa}${btnDraft}`;

  const infoRows: [string, string][] = [
    ["Origen", isWa ? "WhatsApp" : "Formulario de cotización"],
    ...(input.folio ? ([["Folio (Shopify)", input.folio]] as [string, string][]) : []),
    ["Cliente", input.nombre],
    ...(input.empresa ? ([["Empresa", input.empresa]] as [string, string][]) : []),
    ["Correo", input.email],
    ...(input.telefono ? ([["Celular / WhatsApp", input.telefono]] as [string, string][]) : []),
    ["Tipo", input.recurring ? "Cadena de suministro (recurrente)" : "Venta normal (compra única)"],
    ...(input.recurring && input.frecuencia ? ([["Frecuencia", input.frecuencia]] as [string, string][]) : []),
    ...(input.recurring && input.duracion ? ([["Duración", input.duracion]] as [string, string][]) : []),
    ...(input.recurring && input.fechaInicio ? ([["Inicio deseado", input.fechaInicio]] as [string, string][]) : []),
  ];
  const infoHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${infoRows
      .map(([k, v], i) => {
        const bb = i === infoRows.length - 1 ? "" : `border-bottom:1px solid ${C.hair};`;
        return `<tr>
      <td style="padding:9px 12px 9px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.gun};width:140px;vertical-align:top;${bb}">${esc(k)}</td>
      <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${C.ink};${bb}"><strong>${esc(v)}</strong></td>
    </tr>`;
      })
      .join("")}
  </table>`;

  const body = `
    <h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;font-weight:bold;color:${C.navy};">Nueva solicitud de cotización</h1>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${C.gun};">Llegó una solicitud desde el sitio. Responde al cliente cuanto antes.</p>
    ${banner}
    ${typeBadge}
    ${sectionLabel("Datos del cliente")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.metalLight};border-radius:12px;margin:0 0 18px;">
      <tr><td style="padding:14px 18px;">${infoHtml}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.white};border:1px solid ${C.metalLight};border-radius:12px;margin:0 0 6px;">
      <tr><td style="padding:16px 18px 6px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:${C.gun};margin-bottom:12px;">Responder ahora</div>
        ${responder}
      </td></tr>
    </table>
    ${productsHtml ? sectionLabel("Productos solicitados") + productsHtml : ""}
    ${
      input.mensaje
        ? sectionLabel("Mensaje del cliente") +
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.metalLight};border-radius:10px;">
             <tr>
               <td width="4" bgcolor="${C.sky}" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
               <td style="padding:13px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${esc(input.mensaje)}</td>
             </tr>
           </table>`
        : ""
    }
  `;

  const text =
    `HERCAN — Nueva solicitud (${isWa ? "WhatsApp" : "Cotización"})\n\n` +
    infoRows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    (input.lines.length ? `\n\nProductos solicitados:\n${linesText(input.lines, qtyLabel, true)}` : "") +
    (input.mensaje ? `\n\nMensaje:\n${input.mensaje}` : "") +
    `\n\nResponder al cliente: ${input.email}` +
    (waUrl ? `\nWhatsApp: ${waUrl}` : "") +
    (input.adminUrl ? `\nBorrador en Shopify: ${input.adminUrl}` : "");

  return {
    html: shell("Nueva solicitud de cotización", isWa ? "Lead · WhatsApp" : "Lead · Cotización", body),
    text,
  };
}
