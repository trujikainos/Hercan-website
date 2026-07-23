import { ArticleCard } from "@/components/article-card";
import { getArticles } from "@/lib/shopify";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode } from "@/lib/schema";

export const metadata = {
  title: "Blog — guías técnicas de herramental CNC y medición",
  description:
    "Guías de compra y técnicas sobre herramientas de corte CNC, insertos, brocas, machuelos y metrología. Recursos para talleres e industria en México.",
  alternates: { canonical: "/blog" },
};

// El contenido lo escribe el cliente en el admin de Shopify; revalidamos cada 5 min.
export const revalidate = 300;

export default async function BlogPage() {
  const articles = await getArticles();

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
