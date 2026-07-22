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

/** Una sucursal de site.locations (tipo derivado de la fuente de verdad). */
type BranchLocation = (typeof site.locations)[number];

/** Slug URL-safe para el @id del nodo por sucursal (sin acentos ni espacios). */
function locationSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * LocalBusiness para la página de contacto: NAP completo derivado de site.ts.
 * Es la misma entidad que la Organization global (enlazada por parentOrganization).
 * Sólo emite campos con dato real → email/teléfono/sameAs/geo condicionales (anti-fabricación).
 *
 * Sin argumento → nodo único desde site.address (retrocompatible).
 * Con `loc` → nodo por sucursal: @id distinto (#localbusiness-<slug>), address de la
 * sucursal y name "HERCAN — <Ciudad>". Si la sucursal no tiene calle (p. ej. Saltillo,
 * por confirmar) se omite streetAddress: no se fabrica dirección.
 */
export function localBusinessNode(loc?: BranchLocation) {
  const id = loc
    ? `${site.url}/#localbusiness-${locationSlug(loc.name)}`
    : `${site.url}/#localbusiness`;
  const name = loc ? `${site.name} — ${loc.name}` : site.name;

  const street = loc ? loc.street : site.address.street;
  const city = loc ? loc.city : site.address.city;
  const region = loc ? loc.state : site.address.state;
  const postalCode = loc ? loc.postalCode : site.address.postalCode;
  const country = loc ? site.country : site.address.country;
  const lat = loc ? loc.lat : site.geo.lat;
  const lng = loc ? loc.lng : site.geo.lng;
  const email = loc ? loc.email : site.email;
  // Teléfono a E.164 (dígitos con "+"). Sin arg: site.phone (puede ir vacío → se omite).
  const telephone = loc ? `+${loc.phone.replace(/\D/g, "")}` : site.phone;

  return {
    "@type": "LocalBusiness",
    "@id": id,
    name,
    legalName: site.legalName,
    url: site.url,
    image: absoluteUrl(site.ogImage),
    logo: absoluteUrl(site.ogImage),
    ...(email ? { email } : {}),
    ...(telephone ? { telephone } : {}),
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      ...(street ? { streetAddress: street } : {}),
      addressLocality: city,
      addressRegion: region,
      ...(postalCode ? { postalCode } : {}),
      addressCountry: country,
    },
    ...(lat != null && lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: lat,
            longitude: lng,
          },
        }
      : {}),
    areaServed: { "@type": "Country", name: "México" },
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
