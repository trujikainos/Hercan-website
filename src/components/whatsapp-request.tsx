"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { site } from "@/lib/site";
import { submitQuoteAction, type QuoteInput } from "@/app/cotizacion/actions";
import type { SelectedProduct } from "@/components/product-combobox";

/**
 * "Solicitar por WhatsApp" con captura previa: mini-form paso a paso que crea el
 * Borrador de pedido en Shopify ANTES de abrir WhatsApp. Así el lead queda
 * registrado (nada se fuga por WhatsApp) y el equipo le da seguimiento por folio.
 */
export function WhatsAppRequestButton({
  product,
  variant = "solid",
  className,
}: {
  product: SelectedProduct;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const base =
    "press inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition";
  const style =
    variant === "solid"
      ? "bg-[#25D366] text-white hover:brightness-95"
      : "border border-[#25D366] text-[#128C4B] hover:bg-[#25D366]/10";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-event="generate_lead"
        className={className ?? `${base} ${style}`}
      >
        <WhatsAppIcon className="h-5 w-5" />
        Solicitar por WhatsApp
      </button>
      {open && <RequestModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function RequestModal({ product, onClose }: { product: SelectedProduct; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | undefined>(undefined);
  const [f, setF] = useState({ nombre: "", email: "", telefono: "", qty: "1", consent: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const up =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setF((p) => ({
        ...p,
        [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  function next() {
    if (f.nombre.trim().length < 2) return setError("Escribe tu nombre.");
    if (!emailRe.test(f.email.trim())) return setError("Escribe un correo válido.");
    if (f.telefono.replace(/\D/g, "").length < 8) return setError("Escribe tu celular / WhatsApp.");
    setError(null);
    setStep(2);
  }

  function whatsappUrl() {
    const msg = [
      "Hola, acabo de enviar mi solicitud por el sitio:",
      `${product.title} — Cantidad: ${f.qty || "1"}`,
      folio ? `Folio: ${folio}` : null,
      `Mis datos: ${f.nombre} · ${f.email} · ${f.telefono}`,
      "Quiero coordinar la compra. ¿Me confirman precio y disponibilidad?",
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function submit() {
    if (!f.consent) return setError("Acepta el aviso de privacidad para continuar.");
    setError(null);
    const payload: QuoteInput = {
      nombre: f.nombre,
      email: f.email,
      telefono: f.telefono,
      lines: [{ text: product.title, qty: (f.qty || "1").trim(), product }],
      recurring: false,
      mensaje: "Solicitud rápida por WhatsApp desde la ficha de producto.",
      consent: true,
    };
    start(async () => {
      const r = await submitQuoteAction(payload);
      if (r.ok) {
        setFolio(r.folio);
        const w = window as unknown as { gtag?: (...a: unknown[]) => void };
        w.gtag?.("event", "generate_lead", { method: "whatsapp" });
        setStep(3);
      } else {
        setError(r.message);
      }
    });
  }

  const inp =
    "w-full rounded-lg border border-hc-metal-light bg-white px-3 py-2.5 text-sm text-hc-ink outline-none transition focus:border-hc-blue focus:ring-2 focus:ring-hc-blue/20";
  const lbl = "mb-1 block text-sm font-medium text-hc-ink";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar por WhatsApp"
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hc-metal-light px-5 py-3">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            <span className="font-heading text-sm font-semibold text-hc-navy">Solicitar por WhatsApp</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-hc-gunmetal transition hover:text-hc-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {step === 1 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-hc-gunmetal">Paso 1 de 2 · Tus datos</p>
              <div className="space-y-3">
                <div>
                  <label className={lbl} htmlFor="wr-nombre">Nombre *</label>
                  <input id="wr-nombre" value={f.nombre} onChange={up("nombre")} className={inp} autoComplete="name" />
                </div>
                <div>
                  <label className={lbl} htmlFor="wr-email">Correo *</label>
                  <input id="wr-email" type="email" value={f.email} onChange={up("email")} className={inp} autoComplete="email" />
                </div>
                <div>
                  <label className={lbl} htmlFor="wr-tel">Celular / WhatsApp *</label>
                  <input id="wr-tel" type="tel" inputMode="tel" value={f.telefono} onChange={up("telefono")} className={inp} placeholder="Ej. 81 1234 5678" autoComplete="tel" />
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-[#b3261e]">{error}</p>}
              <button
                type="button"
                onClick={next}
                className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hc-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-steel"
              >
                Continuar <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-hc-gunmetal">Paso 2 de 2 · Confirma tu pedido</p>
              <div className="rounded-lg border border-hc-metal-light bg-hc-soft/50 p-3">
                <p className="text-sm font-semibold text-hc-ink">{product.title}</p>
                {(product.mpn || product.sku) && (
                  <p className="mt-0.5 font-mono text-xs text-hc-gunmetal">
                    {product.mpn ? `N° parte ${product.mpn}` : ""}
                    {product.mpn && product.sku ? " · " : ""}
                    {product.sku ? `SKU ${product.sku}` : ""}
                  </p>
                )}
              </div>
              <div className="mt-3">
                <label className={lbl} htmlFor="wr-qty">Cantidad</label>
                <input id="wr-qty" value={f.qty} onChange={up("qty")} className={inp} inputMode="numeric" />
              </div>
              <label className="mt-3 flex items-start gap-2 text-sm text-hc-gunmetal">
                <input type="checkbox" checked={f.consent} onChange={up("consent")} className="mt-0.5 accent-hc-blue" />
                <span>Acepto el tratamiento de mis datos conforme al aviso de privacidad.</span>
              </label>
              {error && <p className="mt-3 text-sm text-[#b3261e]">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="press inline-flex items-center gap-1.5 rounded-lg border border-hc-metal-light px-4 py-2.5 text-sm font-medium text-hc-gunmetal transition hover:bg-hc-soft"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Atrás
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending}
                  className="press inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 font-medium text-white transition hover:brightness-95 disabled:opacity-70"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <WhatsAppIcon className="h-5 w-5" />}
                  Enviar solicitud
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f2ec] text-[#2f7d57]">
                <Check className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-3 font-heading text-lg text-hc-navy">¡Solicitud registrada!</h3>
              <p className="mt-1 text-sm text-hc-gunmetal">
                {folio ? (
                  <>
                    Tu folio es <strong className="text-hc-ink">{folio}</strong>.{" "}
                  </>
                ) : (
                  ""
                )}
                Ahora abre WhatsApp para coordinar la compra con nuestro equipo.
              </p>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:brightness-95"
              >
                <WhatsAppIcon className="h-5 w-5" /> Abrir WhatsApp
              </a>
              <button type="button" onClick={onClose} className="mt-2 text-sm text-hc-gunmetal transition hover:text-hc-ink">
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
