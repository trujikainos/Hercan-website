"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, X, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ProductCombobox, type SelectedProduct } from "@/components/product-combobox";
import { site } from "@/lib/site";
import { buildWhatsappMessage, waUrl, type WaLine } from "@/lib/whatsapp";
import { submitQuoteAction, type QuoteInput } from "@/app/cotizacion/actions";

/**
 * "Solicitar por WhatsApp" con captura previa: mini-form paso a paso que se abre
 * INLINE (en la misma caja, sin modal) y crea el Borrador de pedido en Shopify
 * ANTES de abrir WhatsApp. Soporta varios productos (el primero prellenado desde
 * la ficha). El mensaje de WhatsApp lleva folio + SKU/N° parte con emojis.
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

  if (open) return <InlineForm product={product} onClose={() => setOpen(false)} />;

  const base = "press inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition";
  const style =
    variant === "solid"
      ? "bg-[#25D366] text-white hover:brightness-95"
      : "border border-[#25D366] text-[#128C4B] hover:bg-[#25D366]/10";
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      data-event="generate_lead"
      className={className ?? `${base} ${style}`}
    >
      <WhatsAppIcon className="h-5 w-5" />
      Solicitar por WhatsApp
    </button>
  );
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Line {
  text: string;
  qty: string;
  product?: SelectedProduct;
}

function InlineForm({ product, onClose }: { product: SelectedProduct; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | undefined>(undefined);
  const [f, setF] = useState({ nombre: "", empresa: "", email: "", telefono: "", mensaje: "", consent: false });
  const [lines, setLines] = useState<Line[]>([{ text: product.title, qty: "1", product }]);

  const up =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({
        ...p,
        [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  function patchLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  const addLine = () => setLines((prev) => [...prev, { text: "", qty: "1", product: undefined }]);
  const removeLine = (i: number) => setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  const hasContent = (l: Line) => Boolean(l.product || l.text.trim());

  function next() {
    if (f.nombre.trim().length < 2) return setError("Escribe tu nombre.");
    if (!emailRe.test(f.email.trim())) return setError("Escribe un correo válido.");
    if (f.telefono.replace(/\D/g, "").length < 8) return setError("Escribe tu celular / WhatsApp.");
    setError(null);
    setStep(2);
  }

  function waMessage() {
    const waLines: WaLine[] = lines.filter(hasContent).map((l) => ({
      name: l.product ? l.product.title : l.text.trim(),
      qty: l.qty.trim() || "1",
      sku: l.product?.sku ?? null,
      mpn: l.product?.mpn ?? null,
    }));
    return buildWhatsappMessage({
      folio,
      lines: waLines,
      nombre: f.nombre,
      empresa: f.empresa || undefined,
      email: f.email,
      telefono: f.telefono,
      mensaje: f.mensaje || undefined,
    });
  }

  function submit() {
    const clean = lines.filter(hasContent);
    if (clean.length === 0) return setError("Agrega al menos un producto.");
    for (const l of clean) {
      const q = parseInt(l.qty.replace(/[^\d]/g, ""), 10);
      if (!q || q < 1) return setError("La cantidad de cada producto debe ser al menos 1.");
    }
    if (!f.consent) return setError("Acepta el aviso de privacidad para continuar.");
    setError(null);
    const payload: QuoteInput = {
      nombre: f.nombre,
      empresa: f.empresa || undefined,
      email: f.email,
      telefono: f.telefono,
      mensaje: f.mensaje || undefined,
      lines: clean.map((l) => ({
        text: l.product ? l.product.title : l.text.trim(),
        qty: l.qty.trim() || "1",
        product: l.product,
      })),
      recurring: false,
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
  const stepLbl = "mb-3 text-xs font-medium uppercase tracking-wide text-hc-gunmetal";

  return (
    <div className="w-full rounded-xl border border-[#25D366]/40 bg-white p-4 text-left shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          <span className="font-heading text-sm font-semibold text-hc-navy">Solicitar por WhatsApp</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="text-hc-gunmetal transition hover:text-hc-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      {step === 1 && (
        <>
          <p className={stepLbl}>Paso 1 de 2 · Tus datos</p>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={lbl} htmlFor="wr-nombre">Nombre *</label>
                <input id="wr-nombre" value={f.nombre} onChange={up("nombre")} className={inp} autoComplete="name" />
              </div>
              <div>
                <label className={lbl} htmlFor="wr-empresa">Empresa</label>
                <input id="wr-empresa" value={f.empresa} onChange={up("empresa")} className={inp} autoComplete="organization" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={lbl} htmlFor="wr-email">Correo *</label>
                <input id="wr-email" type="email" value={f.email} onChange={up("email")} className={inp} autoComplete="email" />
              </div>
              <div>
                <label className={lbl} htmlFor="wr-tel">Celular / WhatsApp *</label>
                <input id="wr-tel" type="tel" inputMode="tel" value={f.telefono} onChange={up("telefono")} className={inp} placeholder="Ej. 81 1234 5678" autoComplete="tel" />
              </div>
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
          <p className={stepLbl}>Paso 2 de 2 · Confirma tu producto o productos</p>
          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_1.75rem] items-start gap-2">
                  <ProductCombobox
                    value={l.text}
                    onValueChange={(text) => patchLine(i, { text })}
                    onSelect={(p) => patchLine(i, p ? { product: p, text: p.title } : { product: undefined })}
                    placeholder="Título, N° de parte o SKU…"
                    inputClassName={inp}
                  />
                  <input
                    aria-label="Cantidad"
                    value={l.qty}
                    onChange={(e) => patchLine(i, { qty: e.target.value })}
                    className={inp}
                    inputMode="numeric"
                    placeholder="Cant."
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    aria-label="Quitar producto"
                    className="press flex h-[42px] items-center justify-center rounded-lg text-hc-gunmetal transition hover:bg-hc-metal-light/40 hover:text-hc-ink disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {l.product && (
                  <p className="pl-1 text-xs text-[#2e7d46]">
                    ✓ {l.product.sku ? `SKU ${l.product.sku}` : "Del catálogo"}
                    {l.product.mpn ? ` · N° parte ${l.product.mpn}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-hc-blue transition-colors hover:text-hc-steel"
          >
            <Plus className="h-4 w-4" aria-hidden /> Agregar otro producto
          </button>

          <div className="mt-3">
            <label className={lbl} htmlFor="wr-msg">Mensaje / detalle técnico</label>
            <textarea id="wr-msg" rows={2} value={f.mensaje} onChange={up("mensaje")} className={inp} />
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
        <div className="py-2 text-center">
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
            href={waUrl(site.whatsapp, waMessage())}
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
  );
}
