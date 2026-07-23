"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";

// Error boundary de página (dentro del layout): captura fallos de render/datos de
// cualquier ruta —p. ej. un hipo de la Storefront API con caché fría— y muestra
// una pantalla CON MARCA + botón de reintento, en vez del 500 pelón de Next.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El servidor ya lo registró; esto ayuda a depurar en el cliente. Nunca
    // mostramos el detalle del error al usuario.
    console.error(error);
  }, [error]);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-hc-navy sm:text-4xl">
            Algo salió mal
          </h1>
          <p className="mt-4 text-hc-gunmetal">
            Tuvimos un problema al cargar esta sección. Suele ser temporal — intenta de
            nuevo. Si continúa, escríbenos y con gusto te ayudamos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="press inline-flex items-center gap-2 rounded-lg bg-hc-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-hc-blue"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              Reintentar
            </button>
            <Link
              href="/"
              className="press inline-flex items-center rounded-lg border border-hc-metal-light px-5 py-2.5 text-sm font-medium text-hc-navy transition-colors hover:bg-hc-soft"
            >
              Ir al inicio
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
