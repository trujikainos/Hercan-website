/**
 * JSON-LD como un @graph coherente enlazado por @id.
 * Nodos globales (Organization, WebSite) + nodos por tipo de página (Product, Offer,
 * BreadcrumbList, CollectionPage/ItemList). pageGraph() compone la combinación correcta.
 */
import { site, absoluteUrl } from "./site";
import type { Product, Article } from "./types";

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.alternateNames,
    url: site.url,
    logo: absoluteUrl(site.ogImage),
    ...(site.email ? { email: site.email } : {}),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
    address: {
      "@type": "PostalAddress",
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
      addressCountry: site.address.country,
    },
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: site.lang,
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbNode(items: { name: string; path?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: absoluteUrl(it.path) } : {}),
    })),
  };
}

export function productNode(p: Product) {
  const url = absoluteUrl(`/producto/${p.handle}`);
  // Specs técnicas como PropertyValue → legibles por buscadores y motores de IA
  // (rich results de producto, AEO/GEO). Se toman de los metafields agrupados.
  const additionalProperty = [
    ...(p.familia ? [{ label: "Familia", value: p.familia }] : []),
    ...(p.specGroups ?? []).flatMap((g) => g.items),
  ].map((it) => ({ "@type": "PropertyValue", name: it.label, value: it.value }));
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.title,
    description: `${p.title} — ${p.brand}, ${p.category}. Herramental industrial en ${site.name}.`,
    ...(p.image ? { image: [p.image] } : {}),
    sku: p.sku,
    mpn: p.mpn || p.sku, // n° de parte del fabricante (clave para búsquedas B2B)
    brand: { "@type": "Brand", name: p.brand },
    category: p.category,
    ...(additionalProperty.length ? { additionalProperty } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: p.currency,
      ...(p.price != null ? { price: String(p.price) } : {}),
      availability: p.variantAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/BackOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      // TODO(Fase venta): shippingDetails + hasMerchantReturnPolicy (Google los pide
      // para rich results de producto — agregar cuando existan políticas reales).
    },
    // NOTA: sin AggregateRating/Review hasta tener reseñas reales de terceros (anti-fabricación).
  };
}

export function blogPostingNode(a: Article) {
  const url = absoluteUrl(`/blog/${a.handle}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: a.title,
    ...(a.excerpt ? { description: a.excerpt } : {}),
    ...(a.image ? { image: [a.image] } : {}),
    datePublished: a.publishedAt,
    ...(a.author ? { author: { "@type": "Person", name: a.author } } : {}),
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: url,
    inLanguage: site.lang,
  };
}

export function faqNode(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function collectionNode(name: string, path: string, products: Product[]) {
  return {
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#collection`,
    name,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/producto/${p.handle}`),
        name: p.title,
      })),
    },
  };
}

/** Envuelve nodos de página con los globales en UN solo @graph. */
export function pageGraph(...pageNodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode(), ...pageNodes],
  };
}
