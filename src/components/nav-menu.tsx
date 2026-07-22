"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type NavItem = { href: string; label: string };

// Accesos rápidos a páginas secundarias (fuera de la barra de categorías).
const ITEMS: NavItem[] = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/blog", label: "Blog" },
  { href: "/cotizacion", label: "Cotización" },
];

/**
 * Menú "Más ▾" del nav superior: accesos a páginas secundarias.
 *
 * Client Component (interactivo): abre/cierra con click, cierra al hacer click
 * fuera y con Escape, y es navegable por teclado (flechas / Home / End) siguiendo
 * el patrón WAI-ARIA de menú (button + role="menu" / "menuitem", roving tabindex).
 * Reutiliza el look de los otros dropdowns del sitio (search-bar / product-combobox)
 * y respeta prefers-reduced-motion (variantes motion-safe / motion-reduce + el
 * override global de globals.css).
 */
export function NavMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // índice enfocado (roving tabindex); -1 = ninguno
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  // Cerrar al hacer click fuera (mismo patrón que search-bar / product-combobox).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Mover el foco real al item activo cuando se navega por teclado.
  useEffect(() => {
    if (open && active >= 0) itemRefs.current[active]?.focus();
  }, [open, active]);

  function openMenu(index: number) {
    setActive(index);
    setOpen(true);
  }

  function closeMenu(returnFocus = true) {
    setOpen(false);
    setActive(-1);
    if (returnFocus) btnRef.current?.focus();
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape") {
      if (!open) return;
      e.preventDefault();
      closeMenu();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open) setActive(0);
      else openMenu(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setActive(ITEMS.length - 1);
      else openMenu(ITEMS.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      // Controlamos el foco a mano y evitamos el click sintetizado (doble toggle).
      e.preventDefault();
      if (open) closeMenu(false);
      else openMenu(0);
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % ITEMS.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + ITEMS.length) % ITEMS.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(ITEMS.length - 1);
        break;
      case "Tab":
        // Tab sale del menú siguiendo el orden natural del documento.
        closeMenu(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => {
          if (e.detail === 0) return; // click sintetizado por teclado → lo maneja onKeyDown
          if (open) closeMenu(false);
          else openMenu(-1);
        }}
        onKeyDown={onButtonKeyDown}
        className="flex items-center gap-1 whitespace-nowrap rounded font-heading text-base text-white transition-colors hover:text-hc-sky focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-sky"
      >
        Más
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Más enlaces"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-hc-metal-light bg-white py-1 text-hc-ink shadow-xl motion-safe:animate-[fadeUp_0.16s_ease-out]"
        >
          {ITEMS.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              role="menuitem"
              tabIndex={active === i ? 0 : -1}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => closeMenu(false)}
              onMouseEnter={() => setActive(i)}
              className="block px-4 py-2 text-sm transition-colors hover:bg-hc-soft focus:bg-hc-soft focus:outline-none"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
