/**
 * Skeletons de carga — fallbacks para los `loading.tsx` (Suspense) de Next 16.
 * Server components ligeros: reproducen la silueta del catálogo y de la ficha para
 * un "instant loading state" al navegar (mega menú, taxonomías, resultados de
 * búsqueda). El shimmer respeta prefers-reduced-motion vía `motion-safe`.
 */

function Box({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-hc-soft motion-safe:animate-pulse ${className}`} />;
}

/** Silueta de una página de catálogo/taxonomía: hero + sidebar de filtros + grid. */
export function CatalogSkeleton() {
  return (
    <main id="contenido" className="flex-1" aria-busy="true" aria-label="Cargando catálogo…">
      {/* Hero */}
      <section className="border-b border-hc-metal-light bg-hc-soft">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Box className="h-3 w-44" />
          <Box className="mt-3 h-8 w-56 bg-hc-metal-light" />
          <div className="mt-4 grid gap-x-10 gap-y-2 md:grid-cols-2">
            <Box className="h-3 w-full" />
            <Box className="h-3 w-11/12" />
            <Box className="h-3 w-10/12" />
            <Box className="h-3 w-9/12" />
          </div>
        </div>
      </section>

      {/* Sidebar + grid */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[16rem_1fr]">
        <aside className="hidden space-y-5 md:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Box className="h-4 w-32 bg-hc-metal-light" />
              <Box className="h-3 w-full" />
              <Box className="h-3 w-5/6" />
              <Box className="h-3 w-4/6" />
            </div>
          ))}
        </aside>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-hc-metal-light p-3">
              <Box className="aspect-square w-full" />
              <Box className="mt-3 h-3 w-14" />
              <Box className="mt-2 h-4 w-full" />
              <Box className="mt-1 h-4 w-3/4" />
              <Box className="mt-3 h-5 w-20 bg-hc-metal-light" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/** Silueta de una ficha de producto: galería + columna de información. */
export function ProductSkeleton() {
  return (
    <main id="contenido" className="flex-1" aria-busy="true" aria-label="Cargando producto…">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Box className="h-3 w-64" />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Galería */}
          <div>
            <Box className="aspect-square w-full" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} className="h-16 w-16" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <Box className="h-3 w-28" />
            <Box className="h-8 w-full bg-hc-metal-light" />
            <Box className="h-8 w-2/3 bg-hc-metal-light" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} className="h-6 w-24" />
              ))}
            </div>
            <Box className="h-7 w-28" />
            <Box className="h-11 w-full bg-hc-metal-light" />
            <div className="space-y-2.5 pt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Box className="h-3 w-28" />
                  <Box className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
