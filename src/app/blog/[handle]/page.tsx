import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { pageGraph, breadcrumbNode, blogPostingNode } from "@/lib/schema";
import { getArticles, getArticleByHandle } from "@/lib/shopify";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ handle: a.handle }));
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
    openGraph: a.image ? { images: [{ url: a.image }] } : undefined,
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
        )}
      />
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <nav className="mb-4 text-sm text-hc-gunmetal">
          <Link href="/blog" className="hover:text-hc-blue">
            Blog
          </Link>{" "}
          / <span className="text-hc-ink">{a.title}</span>
        </nav>

        <article className="reveal">
          <time dateTime={a.publishedAt} className="text-sm text-hc-steel">
            {date}
            {a.author ? ` · ${a.author}` : ""}
          </time>
          <h1 className="mt-2 font-heading text-3xl leading-tight text-hc-navy">
            {a.title}
          </h1>

          {a.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.image}
              alt={a.imageAlt ?? a.title}
              className="mt-6 w-full rounded-xl border border-hc-metal-light"
            />
          )}

          {a.contentHtml && (
            <div
              className="mt-6 text-[15px] leading-relaxed text-hc-gunmetal [&_a]:text-hc-blue [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-hc-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-hc-navy [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:text-hc-ink [&_img]:my-6 [&_img]:rounded-lg [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: a.contentHtml }}
            />
          )}
        </article>

        <div className="mt-10 border-t border-hc-metal-light pt-6">
          <Link href="/blog" className="text-sm font-medium text-hc-blue hover:text-hc-steel">
            ← Volver al blog
          </Link>
        </div>
      </main>
    </>
  );
}
