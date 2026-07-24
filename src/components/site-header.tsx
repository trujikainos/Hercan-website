import Link from "next/link";
import Image from "next/image";
import { FileText, User } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";
import { SearchBar } from "@/components/search-bar";
import { NavMenu } from "@/components/nav-menu";
import { MegaMenu } from "@/components/mega-menu";
import { MarcasMenu } from "@/components/marcas-menu";
import { ParaMenu } from "@/components/para-menu";
import { getMenuData } from "@/lib/menu-data";

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

export async function SiteHeader() {
  const menuData = await getMenuData();
  return (
    <header className="sticky top-0 z-40 border-b border-hc-metal-light bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="HERCAN — inicio">
          <Image
            src="/brand/hercan-logo.jpg"
            alt="HERCAN — Herramientas de Carburo de Tungsteno del Norte"
            width={220}
            height={102}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <SearchBar />

        {/* "Más" (páginas de empresa) vive ahora en el top header, no en la barra navy. */}
        <NavMenu />

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
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 font-heading text-base text-white">
          {/* Trigger del mega menú: las categorías viven ahora en el riel del panel.
              Fuera de cualquier overflow para que el panel ancho no se recorte. */}
          <MegaMenu data={menuData} />
          <ParaMenu />
          <MarcasMenu />
          {/* Acceso fijo a la derecha: "Ver todo" el catálogo. */}
          <div className="ml-auto flex shrink-0 items-center py-2.5">
            <Link
              href="/productos"
              className="whitespace-nowrap text-white transition-colors hover:text-hc-sky"
            >
              Ver todo
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
