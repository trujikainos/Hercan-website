import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar, type FacetGroup } from "@/components/filter-sidebar";
import { getProducts, getCategories } from "@/lib/shopify";
import type { Product } from "@/lib/types";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, collectionNode, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Catálogo de herramentales CNC y equipos de medición",
  description:
    "Explora herramientas de corte y equipos de medición: fresado, torneado, perforación, roscado, portaherramientas y medición. Iscar, Toolmex, YG, Palbit, Mitutoyo. Filtra por especificaciones técnicas.",
  alternates: { canonical: "/productos" },
};

const PAGE_SIZE = 48;

type FacetKey = "category" | "brand" | "availability" | "material" | "coating";
const FACETS: { key: FacetKey; param: string; label: string }[] = [
  { key: "category", param: "categoria", label: "Categoría" },
  { key: "brand", param: "marca", label: "Marca" },
  { key: "availability", param: "disponibilidad", label: "Disponibilidad" },
  { key: "material", param: "material", label: "Material" },
  { key: "coating", param: "recubrimiento", label: "Recubrimiento" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Selected = Record<FacetKey, string[]>;

/** ¿El producto pasa todos los facets seleccionados, ignorando opcionalmente uno? */
function matches(p: Product, sel: Selected, ignore?: FacetKey): boolean {
  for (const { key } of FACETS) {
    if (key === ignore) continue;
    const chosen = sel[key];
    if (chosen.length === 0) continue;
    const v = p[key];
    if (v == null || !chosen.includes(String(v))) return false;
  }
  return true;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);

  const nameToSlug = new Map(categories.map((c) => [c.name, c.slug]));
  const slugToName = new Map(categories.map((c) => [c.slug, c.name]));
  const catSlug = (name: string) => nameToSlug.get(name) ?? slugify(name);

  const paramList = (name: string): string[] => {
    const v = sp[name];
    const raw = Array.isArray(v) ? v.join(",") : (v ?? "");
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  };

  // La categoría viaja como slug en la URL (SEO + links del home); el resto por valor.
  const catSlugs = paramList("categoria");
  const selected: Selected = {
    category: catSlugs
      .map((s) => slugToName.get(s))
      .filter((n): n is string => Boolean(n)),
    brand: paramList("marca"),
    availability: paramList("disponibilidad"),
    material: paramList("material"),
    coating: paramList("recubrimiento"),
  };

  const filtered = all.filter((p) => matches(p, selected));

  // Opciones + conteos facetados (cada facet cuenta sobre los OTROS filtros activos).
  const facetGroups: FacetGroup[] = FACETS.map(({ key, param, label }) => {
    const base = all.filter((p) => matches(p, selected, key));
    const counts = new Map<string, number>();
    for (const p of base) {
      const v = p[key];
      if (v) counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
    }
    const options = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "es"))
      .map(([label, count]) => {
        const value = key === "category" ? catSlug(label) : label;
        const isSel = key === "category" ? catSlugs.includes(value) : selected[key].includes(label);
        return { value, label, count, selected: isSel };
      });
    return { param, label, options };
  });

  // Paginación por URL: ?ver=N (acumulativo, preserva la UX de "Mostrar más").
  const verRaw = parseInt(paramList("ver")[0] ?? "", 10);
  const ver = Number.isFinite(verRaw) && verRaw > 0 ? verRaw : PAGE_SIZE;
  const shown = filtered.slice(0, ver);
  const hasMore = filtered.length > ver;

  // href de "Mostrar más": conserva filtros y sube `ver`.
  const moreParams = new URLSearchParams();
  for (const { param } of FACETS) {
    const list = paramList(param);
    if (list.length) moreParams.set(param, list.join(","));
  }
  moreParams.set("ver", String(ver + PAGE_SIZE));

  return (
    <>
      <JsonLd
        data={pageGraph(
          collectionNode("Catálogo", "/productos", filtered),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Catálogo", path: "/productos" },
          ]),
        )}
      />
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <div className="border-b border-hc-metal-light bg-hc-soft">
          <div className="reveal mx-auto max-w-7xl px-4 py-7">
            <h1 className="font-heading text-[length:var(--step-h2)] text-hc-navy">
              Catálogo
            </h1>
            <p className="text-sm text-hc-gunmetal">
              Herramientas de corte y equipos de medición
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
          <FilterSidebar facets={facetGroups} />

          <section>
            <p className="mb-3 text-sm text-hc-gunmetal">
              {filtered.length} producto{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={`/productos?${moreParams.toString()}`}
                  scroll={false}
                  className="press inline-flex items-center gap-2 rounded-lg border border-hc-blue px-5 py-2.5 text-sm font-medium text-hc-blue transition hover:bg-hc-soft"
                >
                  Mostrar más ({filtered.length - ver})
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            )}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-hc-gunmetal">
                Sin resultados con esos filtros.
              </p>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
