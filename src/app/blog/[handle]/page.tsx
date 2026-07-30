import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode, blogPostingNode, faqNode } from "@/lib/schema";
import { getArticleByHandle } from "@/lib/shopify";

// Los artículos se publican en Shopify SIN redeploy del sitio → esta ficha debe
// renderizar ON-DEMAND (dinámica). Si se pre-genera estáticamente, un handle
// nuevo (no visto en el build) intenta generarse en runtime y el layout —que lee
// cookies del carrito— rompe con "Page changed from static to dynamic at runtime,
// reason: cookies". force-dynamic evita ese conflicto; el fetch a Shopify sigue
// cacheado a su nivel, así que no es más lento de forma notable.
export const dynamic = "force-dynamic";

// Quita acentos y símbolos → id estable para las anclas del índice (TOC).
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

// Enriquece el HTML del artículo: (1) inyecta id a cada <h2> para el índice,
// (2) envuelve cada <table> en un contenedor con scroll horizontal (móvil).
// Devuelve también la lista de encabezados y el tiempo de lectura estimado.
function enrichArticle(html: string) {
  const headings: { id: string; text: string }[] = [];
  const withIds = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text) || `seccion-${headings.length + 1}`;
    const base = id;
    let n = 2;
    while (headings.some((h) => h.id === id)) id = `${base}-${n++}`;
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  const wrapped = withIds
    .replace(/<table/gi, '<div class="tbl-wrap"><table')
    .replace(/<\/table>/gi, "</table></div>");
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));
  return { html: wrapped, headings, readMin };
}

// Extrae el bloque "Preguntas frecuentes" (h2) → pares pregunta (h3) + respuesta (p)
// para emitir schema FAQPage. Es la señal más fuerte para AI Overviews / citas de
// IA y para rich results de Google. Devuelve [] si el artículo no tiene FAQ.
function extractFaqs(html: string): { question: string; answer: string }[] {
  const faqStart = html.search(/<h2[^>]*>\s*preguntas frecuentes\s*<\/h2>/i);
  if (faqStart === -1) return [];
  const rest = html.slice(faqStart);
  const nextH2 = rest.slice(5).search(/<h2[^>]*>/i);
  const block = nextH2 === -1 ? rest : rest.slice(0, nextH2 + 5);
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const faqs: { question: string; answer: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const question = strip(m[1]);
    const answer = strip(m[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const a = await getArticleByHandle(handle);
  if (!a) return {};
  return {
    title: a.seoTitle || a.title,
    description: a.seoDescription || a.excerpt || undefined,
    alternates: { canonical: `/blog/${a.handle}` },
    // og:image lo genera opengraph-image.tsx (portada del artículo o fallback de marca).
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const a = await getArticleByHandle(handle);
  if (!a) notFound();

  const date = new Date(a.publishedAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const enriched = a.contentHtml ? enrichArticle(a.contentHtml) : null;
  const faqs = a.contentHtml ? extractFaqs(a.contentHtml) : [];

  return (
    <>
      <JsonLd
        data={pageGraph(
          blogPostingNode(a),
          breadcrumbNode([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: a.title },
          ]),
          ...(faqs.length ? [faqNode(faqs)] : []),
        )}
      />
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-10">
        <nav className="mb-5 text-sm text-hc-gunmetal">
          <Link href="/blog" className="transition-colors hover:text-hc-blue">
            Blog
          </Link>{" "}
          <span className="text-hc-metal">/</span>{" "}
          <span className="text-hc-ink">{a.title}</span>
        </nav>

        {/* Hero de marca — no depende de foto (aún no hay banco de imágenes). */}
        <header className="reveal overflow-hidden rounded-2xl bg-gradient-to-br from-hc-navy via-hc-blue to-hc-steel px-6 py-9 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Guía técnica
          </p>
          <h1 className="mt-3 font-heading text-3xl leading-tight sm:text-[2.6rem] sm:leading-[1.1]">
            {a.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
            <time dateTime={a.publishedAt}>{date}</time>
            {a.author ? (
              <>
                <span className="text-white/40">·</span>
                <span>{a.author}</span>
              </>
            ) : null}
            {enriched ? (
              <>
                <span className="text-white/40">·</span>
                <span>{enriched.readMin} min de lectura</span>
              </>
            ) : null}
          </div>
        </header>

        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.image}
            alt={a.imageAlt ?? a.title}
            className="reveal mt-6 w-full rounded-xl border border-hc-metal-light"
          />
        )}

        {a.excerpt && (
          <p className="reveal mt-7 border-l-4 border-hc-steel pl-4 text-lg leading-relaxed text-hc-ink">
            {a.excerpt}
          </p>
        )}

        {/* Índice — solo si la guía tiene suficientes secciones. */}
        {enriched && enriched.headings.length >= 3 && (
          <nav
            aria-label="Contenido del artículo"
            className="reveal mt-8 rounded-xl border border-hc-metal-light bg-hc-soft/60 p-5"
          >
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-hc-navy">
              En esta guía
            </p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {enriched.headings.map((h, i) => (
                <li key={h.id} className="flex gap-2">
                  <span className="select-none text-hc-metal">{i + 1}.</span>
                  <a
                    href={`#${h.id}`}
                    className="text-hc-blue transition-colors hover:text-hc-steel hover:underline"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {enriched && (
          <article
            className="reveal mt-8 text-[15px] leading-relaxed text-hc-gunmetal [&_a]:font-medium [&_a]:text-hc-blue [&_a]:underline [&_a]:decoration-hc-metal [&_a]:underline-offset-2 [&_a:hover]:text-hc-steel [&_blockquote]:my-6 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-hc-steel [&_blockquote]:bg-hc-soft [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-hc-ink [&_h2]:mt-11 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-hc-metal-light [&_h2]:pb-2 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-hc-navy [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:text-hc-ink [&_img]:my-6 [&_img]:rounded-lg [&_li]:mt-1.5 [&_li]:marker:text-hc-steel [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_p:first-of-type]:text-[17px] [&_p:first-of-type]:text-hc-ink [&_strong]:text-hc-ink [&_table]:w-full [&_table]:min-w-[32rem] [&_table]:border-collapse [&_table]:text-sm [&_tbody_tr:nth-child(even)]:bg-hc-soft/50 [&_td]:border-t [&_td]:border-hc-metal-light [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_th]:bg-hc-navy [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-heading [&_th]:font-medium [&_th]:text-white [&_thead_th:first-child]:rounded-tl-xl [&_thead_th:last-child]:rounded-tr-xl [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_.tbl-wrap]:my-6 [&_.tbl-wrap]:overflow-x-auto [&_.tbl-wrap]:rounded-xl [&_.tbl-wrap]:border [&_.tbl-wrap]:border-hc-metal-light"
            dangerouslySetInnerHTML={{ __html: enriched.html }}
          />
        )}

        {/* Bloque de conversión — cierra cada guía con una acción clara. */}
        <aside className="reveal mt-12 rounded-2xl border border-hc-metal-light bg-hc-soft/60 p-6 sm:p-8">
          <p className="font-heading text-xl text-hc-navy">
            ¿Necesitas la herramienta correcta para tu operación?
          </p>
          <p className="mt-2 text-sm text-hc-gunmetal">
            En HERCAN somos distribuidor B2B/B2C de herramental industrial en México.
            Cotiza en línea y recibe asesoría técnica.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cotizacion"
              className="inline-flex items-center justify-center rounded-lg bg-hc-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hc-blue"
            >
              Solicitar cotización
            </Link>
            <Link
              href="/categoria/perforacion"
              className="inline-flex items-center justify-center rounded-lg border border-hc-navy px-5 py-2.5 text-sm font-semibold text-hc-navy transition-colors hover:bg-hc-navy hover:text-white"
            >
              Ver herramientas de perforación
            </Link>
          </div>
        </aside>

        <div className="mt-8 border-t border-hc-metal-light pt-6">
          <Link
            href="/blog"
            className="text-sm font-medium text-hc-blue transition-colors hover:text-hc-steel"
          >
            ← Volver al blog
          </Link>
        </div>
      </main>
    </>
  );
}
