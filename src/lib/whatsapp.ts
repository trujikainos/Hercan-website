/**
 * Mensaje de WhatsApp para solicitudes/cotizaciones — formato *negrita* de WhatsApp
 * e info organizada (productos con SKU/N° parte, folio del borrador, datos de
 * contacto). Compartido por el mini-form de producto y el form completo.
 *
 * NOTA: se usan SOLO caracteres BMP (viñetas •, separador ·, acentos). Nada de
 * emojis "astrales" (🔧, 📦, etc.): en algunos WhatsApp de escritorio se corrompen
 * a "�". El formato con *negritas* + viñetas se ve bien y legible en todos lados.
 */
export interface WaLine {
  name: string;
  qty?: string;
  sku?: string | null;
  mpn?: string | null;
}
export interface WaMessageInput {
  folio?: string;
  lines: WaLine[];
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  recurring?: boolean;
  terminos?: string; // p. ej. "frecuencia mensual · duración 12 meses · inicio 2026-08-15"
  mensaje?: string;
}

export function buildWhatsappMessage(i: WaMessageInput): string {
  const L: string[] = [];
  L.push("*Solicitud a HERCAN*");
  if (i.folio) L.push(`Folio: *${i.folio}*`);
  if (i.recurring) L.push(`Suministro recurrente${i.terminos ? ` · ${i.terminos}` : ""}`);

  L.push("");
  L.push("*Productos*");
  i.lines.forEach((l, idx) => {
    L.push(`${idx + 1}. ${l.name}`);
    const meta = [
      l.qty ? `Cant. ${l.qty}` : "",
      l.mpn ? `N° parte ${l.mpn}` : "",
      l.sku ? `SKU ${l.sku}` : "",
    ]
      .filter(Boolean)
      .join("  ·  ");
    if (meta) L.push(`   ${meta}`);
  });

  L.push("");
  L.push("*Mis datos*");
  L.push(`• Nombre: ${i.nombre}`);
  if (i.empresa) L.push(`• Empresa: ${i.empresa}`);
  L.push(`• Correo: ${i.email}`);
  L.push(`• Celular: ${i.telefono}`);

  if (i.mensaje) {
    L.push("");
    L.push("*Mensaje / detalle técnico*");
    L.push(i.mensaje);
  }

  L.push("");
  L.push("¿Me confirman precio y disponibilidad?");
  return L.join("\n");
}

/** URL wa.me con el mensaje ya codificado. */
export function waUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
