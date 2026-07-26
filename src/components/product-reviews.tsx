import { BadgeCheck, Star } from "lucide-react";
import type { ProductReviews } from "@/lib/reviews";

// Estrellas con relleno fraccionario (overlay recortado por ancho %).
function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (fill: boolean) =>
    [0, 1, 2, 3, 4].map((i) => (
      <Star key={i} className={`${size} shrink-0 ${fill ? "fill-current" : ""}`} strokeWidth={1.75} />
    ));
  return (
    <span className="relative inline-flex" aria-hidden>
      <span className="flex text-hc-metal">{row(false)}</span>
      <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

const fmtDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
};

export function ProductReviews({ data }: { data: ProductReviews | null }) {
  // Desactivado (sin config de Judge.me) → no renderiza nada.
  if (!data) return null;

  return (
    <section id="resenas" className="mt-16 scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-hc-metal-light pb-4">
        <h2 className="font-heading text-2xl text-hc-navy">Reseñas</h2>
        {data.count > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl text-hc-navy">{data.average.toFixed(1)}</span>
            <span>
              <Stars value={data.average} size="h-5 w-5" />
              <span className="mt-0.5 block text-xs text-hc-gunmetal">
                {data.count} reseña{data.count === 1 ? "" : "s"} verificada{data.count === 1 ? "" : "s"}
              </span>
            </span>
          </div>
        )}
      </div>

      {data.count === 0 ? (
        <div className="rounded-xl border border-dashed border-hc-metal-light bg-hc-soft/40 p-8 text-center">
          <Stars value={0} size="h-6 w-6" />
          <p className="mt-3 text-sm text-hc-gunmetal">
            Aún no hay reseñas de este producto. Las reseñas provienen de clientes que
            realmente lo compraron — en cuanto haya, aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {data.reviews.map((r, i) => (
            <li key={r.id ?? i} className="rounded-xl border border-hc-metal-light bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                {r.date && <span className="text-xs text-hc-gunmetal">{fmtDate(r.date)}</span>}
              </div>
              {r.title && <p className="mt-2 font-semibold text-hc-ink">{r.title}</p>}
              {r.body && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-hc-gunmetal">{r.body}</p>}

              {r.pictures.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.pictures.slice(0, 5).map((src, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={j}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-16 w-16 rounded-lg border border-hc-metal-light object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-hc-gunmetal">
                <span className="font-medium text-hc-ink">{r.author}</span>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2 py-0.5 font-medium text-[#2e7d46]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Compra verificada
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
