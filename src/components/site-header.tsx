import Link from "next/link";
import Image from "next/image";
import { FileText, User } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import { CartButton } from "@/components/cart/cart-button";
import { SearchBar } from "@/components/search-bar";

// Portal de cuentas de cliente de Shopify (login sin contraseña + pedidos + rastreo).
const ACCOUNT_URL =
  process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || "https://shopify.com/67925475403/account";

export function AnnouncementBar() {
  return (
    <div className="bg-hc-navy px-4 py-2 text-center text-xs text-hc-sky">
      B2B industrial · Envíos a todo México · Cotización en línea
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hc-metal-light bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="HERCAN — inicio">
          <Image
            src="/brand/hercan-logo.jpg"
            alt="HERCAN — Herramientas de Carburo de Tungsteno del Norte"
            width={220}
            height={102}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <SearchBar />

        <Link
          href="/cotizacion"
          className="press hidden items-center gap-2 rounded-lg bg-hc-steel px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-hc-blue sm:flex"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Solicitar cotización
        </Link>
        <a
          href={ACCOUNT_URL}
          aria-label="Mi cuenta"
          className="text-hc-navy transition hover:text-hc-blue"
        >
          <User className="h-6 w-6" />
        </a>
        <CartButton />
      </div>

      <nav className="bg-hc-navy">
        <ul className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 font-heading text-sm text-white">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="whitespace-nowrap">
              <Link href={`/productos?categoria=${c.slug}`} className="hover:text-hc-sky">
                {c.name}
              </Link>
            </li>
          ))}
          <li className="ml-auto whitespace-nowrap">
            <Link href="/blog" className="hover:text-hc-sky">
              Blog
            </Link>
          </li>
          <li className="whitespace-nowrap text-hc-sky">
            <Link href="/productos">Ver todo</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
