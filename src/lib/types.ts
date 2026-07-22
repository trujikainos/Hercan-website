export type Availability = "En stock" | "Sobre pedido" | "Importación";

export interface Product {
  id: string;
  variantId?: string | null;
  variantAvailable?: boolean;
  stock?: number | null; // quantityAvailable de la primera variante (null = no rastreado)
  sku: string;
  handle: string;
  title: string;
  brand: string;
  category: string;
  mpn?: string | null; // número de parte del fabricante (≠ sku), clave para SEO/B2B
  familia?: string | null;
  unidadVenta?: string | null; // Pieza, Caja, Juego, Par (metafield specs.unidad_venta)
  disponibilidad?: string | null; // "En stock" / "Sobre pedido" (metafield, etiqueta de negocio)
  fichaTecnicaPdf?: string | null; // URL del datasheet del fabricante
  videoUrl?: string | null;
  type?: string | null;
  material?: string | null;
  coating?: string | null;
  diameter?: number | null;
  flutes?: number | null;
  iso?: string | null;
  availability: Availability;
  price?: number | null;
  currency: string;
  image?: string | null;
  description?: string | null; // descriptionHtml de Shopify (HTML del admin, confiable)
  tags?: string[];
  /** Ficha técnica agrupada, construida desde los metafields "specs". */
  specGroups?: { group: string; items: { label: string; value: string }[] }[];
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  count?: number;
}

export interface Article {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml?: string | null;
  publishedAt: string;
  image: string | null;
  imageAlt: string | null;
  author: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}
