// Filtros de rango de fecha para la lista de pedidos de /cuenta.
// El cliente solo usa las etiquetas (ORDER_RANGES); la conversión a query de Shopify
// (rangeToQuery) corre en el servidor, que es quien conoce la fecha actual.

export const ORDER_RANGES = [
  { key: "todo", label: "Todo el tiempo" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "3m", label: "Últimos 3 meses" },
  { key: "12m", label: "Último año" },
] as const;

export type OrderRange = (typeof ORDER_RANGES)[number]["key"];

/** Convierte un rango a la sintaxis de búsqueda de Shopify (o null = sin filtro). */
export function rangeToQuery(range: string, now: number): string | null {
  const DAY = 86_400_000;
  let since: number;
  if (range === "30d") since = now - 30 * DAY;
  else if (range === "3m") since = now - 90 * DAY;
  else if (range === "12m") since = now - 365 * DAY;
  else return null; // "todo" u desconocido
  const iso = new Date(since).toISOString().slice(0, 10); // YYYY-MM-DD
  return `processed_at:>=${iso}`;
}
