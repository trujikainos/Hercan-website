"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ProductCombobox, type SelectedProduct } from "@/components/product-combobox";
import { site } from "@/lib/site";
import { submitQuoteAction, type QuoteInput } from "@/app/cotizacion/actions";

const EMPTY: QuoteInput = {
  nombre: "",
  empresa: "",
  email: "",
  telefono: "",
  sku: "",
  cantidad: "",
  mensaje: "",
  consent: false,
  hp: "",
};

export function QuoteForm({ initialSku }: { initialSku?: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<QuoteInput>({ ...EMPTY, sku: initialSku ?? "" });

  const upd =
    (k: keyof QuoteInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((prev) => ({
        ...prev,
        [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  function whatsappUrl() {
    const p = f.product;
    const lines = [
      "Solicitud de cotización",
      `Nombre: ${f.nombre}`,
      f.empresa && `Empresa: ${f.empresa}`,
      `Correo: ${f.email}`,
      f.telefono && `Teléfono: ${f.telefono}`,
      p ? `Producto: ${p.title}` : f.sku && `Producto / N° de parte: ${f.sku}`,
      p?.mpn && `N° de parte: ${p.mpn}`,
      p?.sku && `SKU: ${p.sku}`,
      p?.handle && `Ficha: ${site.url}/producto/${p.handle}`,
      f.cantidad && `Cantidad: ${f.cantidad}`,
      f.mensaje && `Mensaje: ${f.mensaje}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await submitQuoteAction(f);
      if (r.ok) {
        setDone(true);
        // Evento de conversión (KPI B2B) — se dispara si GA4 está montado.
        const w = window as unknown as { gtag?: (...a: unknown[]) => void };
        w.gtag?.("event", "generate_lead", { method: "form" });
      } else {
        setError(r.message);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-hc-metal-light bg-hc-soft/50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f2ec] text-[#2f7d57]">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 font-heading text-xl text-hc-navy">¡Solicitud enviada!</h2>
        <p className="mt-1 text-sm text-hc-gunmetal">
          Te responderemos muy pronto con precio y disponibilidad. Si lo necesitas antes,
          escríbenos por WhatsApp.
        </p>
        {site.whatsapp && (
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 font-medium text-white transition hover:brightness-95"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Escribir por WhatsApp
          </a>
        )}
      </div>
    );
  }

  const label = "mb-1 block text-sm font-medium text-hc-ink";
  const input =
    "w-full rounded-lg border border-hc-metal-light bg-white px-3 py-2.5 text-sm text-hc-ink outline-none transition focus:border-hc-blue focus:ring-2 focus:ring-hc-blue/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot (oculto para humanos, los bots lo llenan) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={f.hp}
        onChange={upd("hp")}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="nombre">Nombre *</label>
          <input id="nombre" required value={f.nombre} onChange={upd("nombre")} className={input} autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="empresa">Empresa</label>
          <input id="empresa" value={f.empresa} onChange={upd("empresa")} className={input} autoComplete="organization" />
        </div>
        <div>
          <label className={label} htmlFor="email">Correo *</label>
          <input id="email" type="email" required value={f.email} onChange={upd("email")} className={input} autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor="telefono">Teléfono / WhatsApp</label>
          <input id="telefono" value={f.telefono} onChange={upd("telefono")} className={input} autoComplete="tel" />
        </div>
        <div>
          <label className={label} htmlFor="sku">Producto o N° de parte</label>
          <ProductCombobox
            id="sku"
            value={f.sku ?? ""}
            onValueChange={(text) => setF((prev) => ({ ...prev, sku: text }))}
            onSelect={(p: SelectedProduct | null) =>
              setF((prev) => ({ ...prev, product: p ?? undefined }))
            }
            placeholder="Escribe título, N° de parte o SKU…"
            inputClassName={input}
          />
          {f.product && (
            <p className="mt-1 text-xs text-[#2e7d46]">
              ✓ Producto del catálogo{f.product.sku ? ` · SKU ${f.product.sku}` : ""}
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="cantidad">Cantidad</label>
          <input id="cantidad" value={f.cantidad} onChange={upd("cantidad")} className={input} inputMode="numeric" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="mensaje">Mensaje / detalle técnico</label>
        <textarea id="mensaje" rows={4} value={f.mensaje} onChange={upd("mensaje")} className={input} />
      </div>

      <label className="flex items-start gap-2 text-sm text-hc-gunmetal">
        <input type="checkbox" checked={f.consent} onChange={upd("consent")} className="mt-0.5 accent-hc-blue" />
        <span>
          Acepto el tratamiento de mis datos conforme al aviso de privacidad para recibir
          respuesta a mi solicitud.
        </span>
      </label>

      {error && (
        <p className="rounded-lg border border-[#ecdcbb] bg-[#f7efe0] px-3 py-2 text-sm text-[#9c6408]">
          {error}
          {site.whatsapp && (
            <>
              {" "}
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                Envíanos por WhatsApp
              </a>
              .
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="press inline-flex items-center gap-2 rounded-lg bg-hc-blue px-5 py-2.5 font-medium text-white transition-colors hover:bg-hc-steel disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          Enviar solicitud
        </button>
        {site.whatsapp && (
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            data-event="generate_lead"
            className="press inline-flex items-center gap-2 rounded-lg border border-[#25D366] px-5 py-2.5 font-medium text-[#128C4B] transition hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Enviar por WhatsApp
          </a>
        )}
      </div>
    </form>
  );
}
