import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.publishedAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Link
      href={`/blog/${article.handle}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-hc-metal-light bg-white"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-hc-soft text-hc-metal">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.imageAlt ?? article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ImageIcon className="h-9 w-9" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <time dateTime={article.publishedAt} className="text-xs text-hc-steel">
          {date}
        </time>
        <h3 className="mt-1 line-clamp-2 font-heading text-base text-hc-ink transition-colors group-hover:text-hc-blue">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-3 text-sm text-hc-gunmetal">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
