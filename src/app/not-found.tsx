import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";

const ATAJOS: [string, string][] = [
  ["Fresado", "/categoria/fresado"],
  ["Torneado", "/categoria/torneado"],
  ["Perforación", "/categoria/perforacion"],
  ["Roscado", "/categoria/roscado"],
];

// 404 con marca: en vez del "This page could not be found" pelón de Next, deja al
// usuario con salida (catálogo, buscador en el header, atajos a categorías).
export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-hc-steel">
            Error 404
          </p>
          <h1 className="mt-2 font-heading text-3xl text-hc-navy sm:text-4xl">
            Página no encontrada
          </h1>
          <p className="mt-4 text-hc-gunmetal">
            La página o el producto que buscas no existe o cambió de dirección. Explora el
            catálogo o busca por SKU, marca o tipo desde la barra de arriba.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/productos"
              className="press inline-flex items-center gap-2 rounded-lg bg-hc-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-hc-blue"
            >
              Ver catálogo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/"
              className="press inline-flex items-center rounded-lg border border-hc-metal-light px-5 py-2.5 text-sm font-medium text-hc-navy transition-colors hover:bg-hc-soft"
            >
              Ir al inicio
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2 text-sm">
            {ATAJOS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-hc-metal-light bg-white px-3 py-1.5 text-hc-ink transition-colors hover:border-hc-steel hover:text-hc-navy"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
