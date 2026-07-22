"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCart } from "./cart-provider";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

export function CartDrawer() {
  const { isOpen, closeCart, cart, notices } = useCart();
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        asideRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    queueMicrotask(() => (focusables()[0] ?? asideRef.current)?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeCart}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-hc-metal-light px-4 py-3">
          <h2 className="font-heading text-lg text-hc-navy">Tu carrito</h2>
          <button onClick={closeCart} aria-label="Cerrar" className="text-hc-gunmetal hover:text-hc-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {notices.length > 0 && (
          <div className="border-b border-hc-metal-light bg-[#fff8ec] px-4 py-2 text-xs text-[#b25e00]">
            {notices.map((n, i) => (
              <p key={i}>{n.message}</p>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4">
          {cart && cart.lines.length > 0 ? (
            cart.lines.map((l) => <CartLineItem key={l.id} line={l} />)
          ) : (
            <div className="py-10 text-center text-hc-gunmetal">Tu carrito está vacío.</div>
          )}
        </div>
        <div className="border-t border-hc-metal-light p-4">
          <CartSummary />
        </div>
      </aside>
    </div>
  );
}
