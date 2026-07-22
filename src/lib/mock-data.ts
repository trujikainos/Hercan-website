import type { Product, Category } from "./types";

export const CATEGORIES: Category[] = [
  { name: "Fresado", slug: "fresado", icon: "Drill", count: 811 },
  { name: "Torneado", slug: "torneado", icon: "CircleDot", count: 388 },
  { name: "Perforación", slug: "perforacion", icon: "Drill", count: 724 },
  { name: "Roscado", slug: "roscado", icon: "Bolt", count: 492 },
  { name: "Portaherramientas", slug: "portaherramientas", icon: "Wrench", count: 366 },
  { name: "Medición", slug: "medicion", icon: "Ruler", count: 24 },
];

export const BRANDS = [
  "Iscar",
  "Toolmex",
  "YG",
  "Palbit",
  "Hercan",
  "Mitutoyo",
  "Titanium",
  "Otros",
];

function handleFromSku(sku: string): string {
  return sku
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const raw: Omit<Product, "handle" | "currency" | "id">[] = [
  { sku: "IS3100369", title: "Cortador F45ST D4.00-1.50 [Iscar]", brand: "Iscar", category: "Fresado", type: "Cortador", material: "Carburo", coating: null, diameter: 4, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "IS3103477", title: "Cortador E93CN D1.00-4L70C1.00-07 [Iscar]", brand: "Iscar", category: "Fresado", type: "Cortador", material: "Carburo", coating: null, diameter: 1, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "IS2500526", title: "Barra de Mandrinar HELIR 19-3T20 [Iscar]", brand: "Iscar", category: "Torneado", type: "Barra mandrinar", material: "Carburo", coating: null, diameter: null, flutes: null, iso: "HELIR 19-3T20", availability: "En stock", price: null, image: null },
  { sku: "IS2500549", title: "Inserto Heli-Turn 19-3T20 [Iscar]", brand: "Iscar", category: "Torneado", type: "Inserto", material: "Carburo", coating: null, diameter: null, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "IS3103926", title: "Cabezal Intercambiable HCM D16/.62-MMT10 [Iscar]", brand: "Iscar", category: "Perforación", type: "Cabezal", material: "Carburo", coating: "TiN", diameter: 16, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "IS3104221", title: "Cabezal Intercambiable HCM D12/.5-MMT08 [Iscar]", brand: "Iscar", category: "Perforación", type: "Cabezal", material: "Carburo", coating: "TiN", diameter: 12, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "IS3332678", title: "Inserto de Roscado 16IR 12 UNJ IC806 [Iscar]", brand: "Iscar", category: "Roscado", type: "Inserto", material: "Carburo", coating: "TiAlN", diameter: null, flutes: null, iso: "16IR 12 UNJ", availability: "Sobre pedido", price: null, image: null },
  { sku: "IS5603846", title: "Fresa de Roscado MTEC 0604C14 1.0ISO IC908 [Iscar]", brand: "Iscar", category: "Roscado", type: "Fresa/Endmill", material: "Carburo", coating: "TiAlN", diameter: null, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "3103151", title: "Extensión Portaherramientas MM TS-A-L100-C16-T10 [Iscar]", brand: "Iscar", category: "Portaherramientas", type: "Portaherramientas", material: null, coating: null, diameter: null, flutes: null, iso: null, availability: "Sobre pedido", price: null, image: null },
  { sku: "IS2300509", title: "Portaherramientas SGFH 19-2 [Iscar]", brand: "Iscar", category: "Portaherramientas", type: "Portaherramientas", material: null, coating: null, diameter: null, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "2416A", title: "Comparador de Carátula Digital .001-1 [Mitutoyo]", brand: "Mitutoyo", category: "Medición", type: "Indicador carátula", material: null, coating: null, diameter: null, flutes: null, iso: null, availability: "En stock", price: null, image: null },
  { sku: "51340510E", title: "Indicador de Carátula de Pestaña 0.002 mm [Mitutoyo]", brand: "Mitutoyo", category: "Medición", type: "Indicador carátula", material: null, coating: null, diameter: null, flutes: null, iso: null, availability: "En stock", price: null, image: null },
];

export const MOCK_PRODUCTS: Product[] = raw.map((p) => ({
  ...p,
  id: p.sku,
  variantId: null, // sin token → add-to-cart deshabilitado en modo mock
  variantAvailable: false,
  stock: null,
  handle: handleFromSku(p.sku),
  currency: "USD",
}));
