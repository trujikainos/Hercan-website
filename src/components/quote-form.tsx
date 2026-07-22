"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Send, Plus, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { ProductCombobox, type SelectedProduct } from "@/components/product-combobox";
import { site } from "@/lib/site";
import { qtyLabelFor } from "@/lib/frequency";
import { buildWhatsappMessage, waUrl, type WaLine } from "@/lib/whatsapp";
import { submitQuoteAction, type QuoteInput } from "@/app/cotizacion/actions";

interface Line {
  text: string;
  qty: string;
  product?: SelectedProduct;
}
interface Contact {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  mensaje: string;
  consent: boolean;
  hp: string;
}
const EMPTY_CONTACT: Contact = {
  nombre: "",
  empresa: "",
  email: "",
  telefono: "",
  mensaje: "",
  consent: false,
  hp: "",
};
const emptyLine = (text = ""): Line => ({ text, qty: "1", product: undefined });

export function QuoteForm({
  initialSku,
  initialProduct,
}: {
  initialSku?: string;
  initialProduct?: SelectedProduct | null;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [folio, setFolio] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [c, setC] = useState<Contact>(EMPTY_CONTACT);
  const [recurring, setRecurring] = useState(false);
  const [rec, setRec] = useState({
    freqPreset: "Mensual",
    freqN: "2",
    freqUnidad: "meses",
    duracion: "12 meses",
    fechaInicio: "",
  });
  const [lines, setLines] = useState<Line[]>([
    initialProduct
      ? { text: initialProduct.title, qty: "1", product: initialProduct }
      : emptyLine(initialSku ?? ""),
  ]);

  // Frecuencia efectiva (preset o "cada N meses/semanas") + etiqueta de cantidad.
  const frecuencia =
    rec.freqPreset === "Otra" ? `Cada ${(rec.freqN || "").trim() || "?"} ${rec.freqUnidad}` : rec.freqPreset;
  const qtyLabelShort = qtyLabelFor(recurring, frecuencia);

  const updC =
    (k: keyof Contact) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setC((prev) => ({
        ...prev,
        [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
      }));

  function patchLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const hasContent = (l: Line) => Boolean(l.product || l.text.trim());

  function buildLines() {
    return lines.filter(hasContent).map((l) => ({
      text: l.product ? l.product.title : l.text.trim(),
      qty: l.qty.trim() || undefined,
      product: l.product,
    }));
  }

  function whatsappUrl() {
    const waLines: WaLine[] = lines.filter(hasContent).map((l) => ({
      name: l.product ? l.product.title : l.text.trim(),
      qty: l.qty.trim() || undefined,
      sku: l.product?.sku ?? null,
      mpn: l.product?.mpn ?? null,
    }));
    const terminos = recurring
      ? [
          frecuencia ? `frecuencia ${frecuencia}` : "",
          rec.duracion ? `duración ${rec.duracion}` : "",
          rec.fechaInicio ? `inicio ${rec.fechaInicio}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : undefined;
    const msg = buildWhatsappMessage({
      folio,
      lines: waLines,
      nombre: c.nombre,
      empresa: c.empresa || undefined,
      email: c.email,
      telefono: c.telefono,
      recurring,
      terminos,
      mensaje: c.mensaje || undefined,
    });
    return waUrl(site.whatsapp, msg);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Cantidades obligatorias (≥ 1) y al menos un producto.
    const clean = lines.filter(hasContent);
    if (clean.length === 0) return setError("Agrega al menos un producto.");
    for (const l of clean) {
      const q = parseInt(l.qty.replace(/[^\d]/g, ""), 10);
      if (!q || q < 1) return setError("La cantidad de cada producto debe ser al menos 1.");
    }
    const payload: QuoteInput = {
      nombre: c.nombre,
      empresa: c.empresa,
      email: c.email,
      telefono: c.telefono,
      mensaje: c.mensaje,
      consent: c.consent,
      hp: c.hp,
      lines: buildLines(),
      recurring,
      ...(recurring
        ? { frecuencia, duracion: rec.duracion, fechaInicio: rec.fechaInicio || undefined }
        : {}),
    };
    start(async () => {
      const r = await submitQuoteAction(payload);
      if (r.ok) {
        setFolio(r.folio);
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
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot (oculto para humanos, los bots lo llenan) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={c.hp}
        onChange={updC("hp")}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* ── Datos de contacto ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="nombre">Nombre *</label>
          <input id="nombre" required value={c.nombre} onChange={updC("nombre")} className={input} autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="empresa">Empresa</label>
          <input id="empresa" value={c.empresa} onChange={updC("empresa")} className={input} autoComplete="organization" />
        </div>
        <div>
          <label className={label} htmlFor="email">Correo *</label>
          <input id="email" type="email" required value={c.email} onChange={updC("email")} className={input} autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor="telefono">Celular / WhatsApp *</label>
          <input id="telefono" type="tel" inputMode="tel" required value={c.telefono} onChange={updC("telefono")} className={input} autoComplete="tel" placeholder="Ej. 81 1234 5678" />
        </div>
      </div>

      {/* ── Productos a cotizar ── */}
      <div className="rounded-xl border border-hc-metal-light bg-hc-soft/40 p-4">
        <h2 className="font-heading text-sm font-semibold text-hc-navy">¿Qué necesitas cotizar?</h2>

        {/* Tipo de solicitud: compra única vs suministro recurrente */}
        <div className="mt-2">
          <span className={label}>Tipo de solicitud</span>
          <div className="inline-flex rounded-lg border border-hc-metal-light bg-white p-0.5">
            {[
              { v: false, t: "Compra única" },
              { v: true, t: "Suministro recurrente" },
            ].map((o) => (
              <button
                key={o.t}
                type="button"
                onClick={() => setRecurring(o.v)}
                aria-pressed={recurring === o.v}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  recurring === o.v ? "bg-hc-blue text-white" : "text-hc-gunmetal hover:text-hc-ink"
                }`}
              >
                {o.t}
              </button>
            ))}
          </div>

          {recurring && (
            <div className="mt-3 grid gap-3 rounded-lg border border-hc-metal-light bg-white p-3 sm:grid-cols-3">
              <div>
                <label className={label} htmlFor="frecuencia">Frecuencia de entrega</label>
                <select
                  id="frecuencia"
                  value={rec.freqPreset}
                  onChange={(e) => setRec((p) => ({ ...p, freqPreset: e.target.value }))}
                  className={input}
                >
                  <option>Mensual</option>
                  <option>Quincenal</option>
                  <option>Trimestral</option>
                  <option>Semestral</option>
                  <option value="Otra">Otra (personalizada)</option>
                </select>
                {rec.freqPreset === "Otra" && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="shrink-0 text-sm text-hc-gunmetal">Cada</span>
                    <input
                      aria-label="Cada cuántas unidades"
                      value={rec.freqN}
                      onChange={(e) => setRec((p) => ({ ...p, freqN: e.target.value }))}
                      className={`${input} w-14`}
                      inputMode="numeric"
                      placeholder="2"
                    />
                    <select
                      aria-label="Unidad de frecuencia"
                      value={rec.freqUnidad}
                      onChange={(e) => setRec((p) => ({ ...p, freqUnidad: e.target.value }))}
                      className={input}
                    >
                      <option>semanas</option>
                      <option>meses</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className={label} htmlFor="duracion">Duración del acuerdo</label>
                <select
                  id="duracion"
                  value={rec.duracion}
                  onChange={(e) => setRec((p) => ({ ...p, duracion: e.target.value }))}
                  className={input}
                >
                  <option>3 meses</option>
                  <option>6 meses</option>
                  <option>12 meses</option>
                  <option>Indefinido</option>
                </select>
              </div>
              <div>
                <label className={label} htmlFor="inicio">Fecha de inicio</label>
                <input
                  id="inicio"
                  type="date"
                  value={rec.fechaInicio}
                  onChange={(e) => setRec((p) => ({ ...p, fechaInicio: e.target.value }))}
                  className={input}
                />
              </div>
              <p className="text-xs text-hc-gunmetal sm:col-span-3">
                Indica la <strong>cantidad por entrega</strong> (según la frecuencia) por producto abajo.
              </p>
            </div>
          )}
        </div>

        {/* Filas de producto */}
        <div className="mt-3 space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="space-y-1">
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_2rem] items-start gap-2">
                <ProductCombobox
                  id={i === 0 ? "sku" : undefined}
                  value={l.text}
                  onValueChange={(text) => patchLine(i, { text })}
                  onSelect={(p: SelectedProduct | null) =>
                    patchLine(i, p ? { product: p, text: p.title } : { product: undefined })
                  }
                  placeholder="Título, N° de parte o SKU…"
                  inputClassName={input}
                />
                <input
                  aria-label={recurring ? `Cantidad por entrega (${frecuencia})` : "Cantidad"}
                  value={l.qty}
                  onChange={(e) => patchLine(i, { qty: e.target.value })}
                  className={input}
                  inputMode="numeric"
                  placeholder={recurring ? qtyLabelShort : "Cant."}
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
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-hc-blue transition-colors hover:text-hc-steel"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Agregar otro producto
        </button>
      </div>

      {/* ── Mensaje ── */}
      <div>
        <label className={label} htmlFor="mensaje">Mensaje / detalle técnico</label>
        <textarea id="mensaje" rows={4} value={c.mensaje} onChange={updC("mensaje")} className={input} />
      </div>

      <label className="flex items-start gap-2 text-sm text-hc-gunmetal">
        <input type="checkbox" checked={c.consent} onChange={updC("consent")} className="mt-0.5 accent-hc-blue" />
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
      </div>
    </form>
  );
}
