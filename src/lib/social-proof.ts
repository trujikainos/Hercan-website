// ─────────────────────────────────────────────────────────────────────────────
// PRUEBA SOCIAL (social proof) — FUENTE DE DATOS
//
// ⚠️ PLACEHOLDER FICTICIO. Hoy los eventos se GENERAN al azar desde los pools de
// abajo para poder verlo funcionando. Cuando haya volumen real, se reemplaza SOLO
// `makeEvent()` (o se alimenta desde un endpoint que lea pedidos/cotizaciones
// reales de Shopify, anonimizados a ciudad + producto). El componente visual no
// cambia. Ver [[hercan-cuenta-personalizada]] para la fuente real de pedidos.
// ─────────────────────────────────────────────────────────────────────────────

// Flag: encendido por defecto; se apaga con NEXT_PUBLIC_SOCIAL_PROOF="0".
export const SOCIAL_PROOF_ENABLED = process.env.NEXT_PUBLIC_SOCIAL_PROOF !== "0";

export type SocialEventKind = "compra" | "cotizacion" | "viendo";
export type SocialEvent = {
  kind: SocialEventKind;
  city: string;
  name?: string; // solo compra/cotización (anonimizado)
  product?: string; // solo compra/cotización
  category?: string; // solo "viendo"
  minutesAgo?: number; // solo compra/cotización
  viewers?: number; // solo "viendo"
};

// Ciudades industriales del área (NL / Coahuila) — coherente con Monterrey/Saltillo.
const CITIES = [
  "Monterrey",
  "Saltillo",
  "Apodaca",
  "San Nicolás",
  "Guadalupe",
  "Escobedo",
  "Santa Catarina",
  "García",
  "Ramos Arizpe",
  "Torreón",
];

// Nombre + inicial (anonimizado; nunca nombre completo ni correo).
// Lista amplia para que no se repitan nombres y no se noten los ficticios.
const NAMES = [
  "Carlos T.", "Luis M.", "Jorge R.", "Miguel A.", "Ana G.", "Roberto S.",
  "Fernando L.", "Diana P.", "Héctor V.", "Raúl C.", "Mónica H.", "Iván D.",
  "José M.", "Ricardo N.", "Alejandro P.", "Sergio R.", "Óscar G.", "Pedro L.",
  "Javier H.", "Manuel C.", "Eduardo S.", "Gerardo V.", "Arturo M.", "Francisco J.",
  "Daniel R.", "Emilio T.", "Rodrigo A.", "Gabriel N.", "Andrés P.", "Mauricio L.",
  "César H.", "Alfredo G.", "Ramiro S.", "Ismael V.", "Tomás R.", "Guillermo M.",
  "Patricia L.", "Laura M.", "Verónica S.", "Claudia R.", "Karla G.", "Adriana P.",
  "Gabriela H.", "Fernanda C.", "Sofía V.", "Regina M.", "Marisol T.", "Paola R.",
  "Lucía G.", "Alma N.", "Brenda P.", "Cristina L.", "Nadia H.", "Valeria S.",
  "Enrique M.", "Salvador R.", "Abel G.", "Noé V.", "Ulises P.", "Marco A.",
  "Rubén T.", "Efraín L.", "Joel H.", "Damián C.", "Leonardo S.", "Bruno M.",
];

// Productos representativos del catálogo (herramental CNC / medición).
const PRODUCTS = [
  "Fresa de carburo 1/2\" 4F AlTiN",
  "Inserto CNMG 432 IC908",
  "Broca de carburo Ø6 mm",
  "Barra de mandrinar HELIR 19",
  "Cabezal intercambiable MULTI-MASTER",
  "Machuelo HSS-E M8",
  "Portaherramientas ER32",
  "Calibrador Vernier digital 6\"",
  "Micrómetro 0-25 mm",
  "Escariador de carburo Ø10 mm",
  "Cortador de careado 45°",
  "Fresa de alto avance Ø16 mm",
];

const CATEGORIES = ["fresado", "torneado", "perforación", "medición", "herramental CNC"];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Firma de un evento para evitar repeticiones (que no se noten los ficticios). */
export function eventKey(e: SocialEvent): string {
  return e.kind === "viendo" ? `viendo|${e.category}` : `${e.kind}|${e.name}|${e.product}`;
}

function build(): SocialEvent {
  // Mezcla ponderada: compras y cotizaciones pesan más que "viendo".
  const r = Math.random();
  const kind: SocialEventKind = r < 0.45 ? "compra" : r < 0.8 ? "cotizacion" : "viendo";
  if (kind === "viendo") {
    return { kind, city: pick(CITIES), category: pick(CATEGORIES), viewers: randInt(3, 18) };
  }
  return {
    kind,
    city: pick(CITIES),
    name: pick(NAMES),
    product: pick(PRODUCTS),
    minutesAgo: randInt(2, 55),
  };
}

/**
 * Genera un evento ficticio al azar, evitando las firmas en `avoid` para que no se
 * repitan (persona+producto, o categoría en "viendo"). Reemplazar por datos reales
 * cuando haya volumen — el resto del sistema no cambia.
 */
export function makeEvent(avoid?: Set<string>): SocialEvent {
  for (let i = 0; i < 40 && avoid; i++) {
    const e = build();
    if (!avoid.has(eventKey(e))) return e;
  }
  return build();
}
