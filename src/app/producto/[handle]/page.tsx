import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageIcon, Ruler, FileText } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { StockBadge, stockInfo, formatPrice, displayTitle } from "@/components/ui";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { OutOfStockCTA } from "@/components/cart/out-of-stock-cta";
import { CopyButton } from "@/components/copy-button";
import { FaqAccordion } from "@/components/faq-accordion";
import { ProductTabs } from "@/components/product-tabs";
import { RelatedProducts } from "@/components/related-products";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, productNode, breadcrumbNode, faqNode } from "@/lib/schema";
import { buildProductFaqs } from "@/lib/faq";
import {
  getProductByHandle,
  getAllProductHandles,
  getRelatedProducts,
} from "@/lib/shopify";

export async function generateStaticParams() {
  const products = await getAllProductHandles();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};
  const partNo = product.mpn ?? product.sku;
  const description =
    `${product.title} — ${product.brand} · N° de parte ${partNo}${product.mpn && product.mpn !== product.sku ? ` (SKU ${product.sku})` : ""}. ${product.category} en HERCAN. Precio ${product.currency}, cotización B2B.`.slice(
      0,
      160,
    );
  return {
    title: product.title,
    description,
    keywords: [
      product.sku,
      product.mpn,
      product.brand,
      product.category,
      product.title,
    ].filter((k): k is string => Boolean(k)),
    alternates: { canonical: `/producto/${product.handle}` },
    // La OG la genera producto/[handle]/opengraph-image.tsx (marca + título + N° de parte).
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  const stock = stockInfo(product);
  const related = await getRelatedProducts(product, 12);

  // Identificadores: el N° de parte real es el mpn (por lo que busca/pide el
  // comprador); el SKU es el código interno de Hercan (menos relevante, pero se
  // muestra igual). Si no hay mpn, el N° de parte cae al sku.
  // N° de parte = mpn del fabricante (prominente, en su caja). El SKU (código
  // interno) va aparte, como texto tenue arriba del título.
  const partNumber = product.mpn ?? product.sku;

  // Specs clave para chips de un vistazo, en orden de relevancia.
  const quickSpecs = [
    product.material,
    product.coating,
    product.diameter != null ? `Ø ${product.diameter} mm` : null,
    product.flutes != null ? `${product.flutes} filos` : null,
    product.iso,
  ].filter((s): s is string => Boolean(s));

  // Grupo "General" (los identificadores ya están en el encabezado).
  const generalGroup = {
    group: "General",
    items: [
      { label: "Marca", value: product.brand },
      ...(product.familia ? [{ label: "Familia", value: product.familia }] : []),
      { label: "Categoría", value: product.category },
      { label: "Disponibilidad", value: product.availability },
      ...(product.stock != null
        ? [{ label: "Existencia", value: `${product.stock} piezas` }]
        : []),
      ...(product.unidadVenta
        ? [{ label: "Unidad de venta", value: product.unidadVenta }]
        : []),
    ],
  };
  const specGroups = [generalGroup, ...(product.specGroups ?? [])];
  const faqs = buildProductFaqs(product);
  // Solo se vende lo que hay en existencia (política DENY). Agotado → solicitud.
  const isBuyable =
    Boolean(product.variantId) &&
    (product.variantAvailable ?? false) &&
    (product.stock == null || product.stock > 0);

  return (
    <>
      <JsonLd
        data={pageGraph(
          productNode(product),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Catálogo", path: "/productos" },
            { name: product.title },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <nav className="mb-4 text-sm text-hc-gunmetal">
          <Link href="/productos" className="hover:text-hc-blue">
            Catálogo
          </Link>{" "}
          / <span className="text-hc-ink">{product.category}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="reveal grid grid-cols-2 gap-3">
            <div className="col-span-2 flex h-72 items-center justify-center overflow-hidden rounded-xl border border-hc-metal-light bg-white">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={`${displayTitle(product.title)} — ${product.sku}`}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-hc-soft text-hc-metal">
                  <ImageIcon className="h-14 w-14" aria-hidden />
                </div>
              )}
            </div>
            <div className="flex h-28 items-center justify-center rounded-lg border border-hc-metal-light bg-white text-hc-metal">
              <ImageIcon className="h-8 w-8" aria-hidden />
            </div>
            <div className="flex h-28 flex-col items-center justify-center rounded-lg border border-hc-metal-light bg-white text-hc-metal">
              <Ruler className="h-8 w-8" aria-hidden />
              <span className="mt-1 text-xs">Dibujo dimensional</span>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <StockBadge product={product} />
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className="font-semibold uppercase tracking-wide text-hc-steel">
                {product.brand}
              </span>
              {product.sku && (
                <span className="font-mono text-hc-metal">SKU {product.sku}</span>
              )}
            </p>
            <h1 className="mt-1 font-heading text-2xl text-hc-ink">
              {displayTitle(product.title)}
            </h1>

            {/* N° de parte del fabricante — prominente, con copiar */}
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-hc-metal-light bg-hc-soft/60 p-3">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-hc-gunmetal">
                N° de parte
              </span>
              <code className="font-mono text-sm font-semibold text-hc-navy">
                {partNumber}
              </code>
              <CopyButton value={partNumber} label="número de parte" />
            </div>

            {/* Specs clave de un vistazo */}
            {quickSpecs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {quickSpecs.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-hc-soft px-2.5 py-1 text-xs font-medium text-hc-navy ring-1 ring-hc-metal-light"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 font-heading text-3xl text-hc-navy">
              {formatPrice(product)}
            </p>
            <p className="text-xs text-hc-gunmetal">
              Precio en {product.currency}, IVA incluido.
              {product.unidadVenta ? ` Precio por ${product.unidadVenta.toLowerCase()}.` : ""}
            </p>
            <p className="mt-3 text-sm font-medium">
              {stock.units != null && stock.units > 0 ? (
                <span className={stock.tone === "low" ? "text-[#b25e00]" : "text-[#2e7d46]"}>
                  {stock.units}{" "}
                  {stock.units === 1 ? "pieza disponible" : "piezas disponibles"}
                  {stock.tone === "low" ? " — ¡pocas piezas!" : ""}
                </span>
              ) : stock.units === 0 ? (
                <span className="text-[#b25e00]">Agotado — solicítalo bajo pedido</span>
              ) : (
                <span className="text-hc-blue">{stock.label}</span>
              )}
            </p>

            {isBuyable ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <AddToCartButton
                  variantId={product.variantId ?? null}
                  variantAvailable={product.variantAvailable ?? false}
                  stock={product.stock}
                  productTitle={product.title}
                  handle={product.handle}
                  image={product.image ?? null}
                  unitPrice={product.price ?? null}
                  currency={product.currency}
                />
                <Link
                  href="/cotizacion"
                  className="inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 font-medium text-hc-blue transition hover:bg-hc-soft"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Solicitar cotización
                </Link>
              </div>
            ) : (
              <OutOfStockCTA title={displayTitle(product.title)} sku={product.sku} />
            )}
          </div>
        </div>

        {/* Descripción — siempre visible, ancho completo, arriba de las pestañas */}
        {product.description && (
          <section className="reveal mt-10">
            <h2 className="mb-3 font-heading text-lg text-hc-navy">Descripción</h2>
            <div
              className="rounded-xl border border-hc-metal-light bg-hc-soft/40 p-5 text-[15px] leading-relaxed text-hc-gunmetal [&_a]:text-hc-blue [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Especificaciones en pestañas por grupo */}
        <section className="reveal mt-10">
          <h2 className="mb-4 font-heading text-lg text-hc-navy">Especificaciones</h2>
          <ProductTabs specGroups={specGroups} />
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="reveal mb-5 font-heading text-[length:var(--step-h2)] text-hc-navy">
              Productos relacionados
            </h2>
            <RelatedProducts products={related} />
          </section>
        )}

        {faqs.length > 0 && (
          <section className="reveal mt-16 max-w-3xl">
            <h2 className="mb-4 font-heading text-lg text-hc-navy">
              Preguntas frecuentes
            </h2>
            <FaqAccordion faqs={faqs} />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
