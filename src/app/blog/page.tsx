import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getArticles } from "@/lib/shopify";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";
import { BLOG_CATEGORIES, articleCategory } from "@/lib/blog-categories";

export const metadata = {
  title: "Blog — guías técnicas de herramental CNC y medición",
  description:
    "Guías de compra y técnicas sobre herramientas de corte CNC, insertos, brocas, machuelos y metrología. Recursos para talleres e industria en México.",
  // Canonical fijo: las vistas filtradas (?cat=) consolidan señal en /blog.
  alternates: { canonical: "/blog" },
};

// El contenido lo escribe el cliente en el admin de Shopify; revalidamos cada 5 min.
export const revalidate = 300;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = await getArticles();

  // Solo se muestran chips de categorías que YA tienen artículos (sin filtros vacíos).
  const present = BLOG_CATEGORIES.filter((c) =>
    all.some((a) => articleCategory(a)?.slug === c.slug),
  );
  const activeSlug = cat && present.some((c) => c.slug === cat) ? cat : null;
  const articles = activeSlug
    ? all.filter((a) => articleCategory(a)?.slug === activeSlug)
    : all;

  const chip = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`press rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-hc-navy bg-hc-navy text-white"
          : "border-hc-metal-light bg-white text-hc-navy hover:border-hc-steel hover:bg-hc-soft"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <JsonLd
        data={pageGraph(
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        )}
      />
      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <header className="reveal max-w-2xl">
          <h1 className="font-heading text-3xl text-hc-navy">Blog técnico</h1>
          <p className="mt-2 text-hc-gunmetal">
            Guías de compra y recursos técnicos de herramental CNC, herramientas de
            corte y metrología para la industria en México.
          </p>
        </header>

        {present.length > 0 && (
          <nav aria-label="Categorías del blog" className="reveal mt-6 flex flex-wrap gap-2">
            {chip("/blog", "Todas", !activeSlug)}
            {present.map((c) => chip(`/blog?cat=${c.slug}`, c.label, activeSlug === c.slug))}
          </nav>
        )}

        {articles.length === 0 ? (
          <p className="reveal mt-10 rounded-xl border border-hc-metal-light bg-hc-soft/40 p-8 text-center text-hc-gunmetal">
            Próximamente publicaremos guías técnicas y de compra. Vuelve pronto.
          </p>
        ) : (
          <div className="stagger-in mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
