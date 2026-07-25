"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import type { CustomerAddress } from "@/lib/customer-account";
import { COUNTRIES, ZONES } from "@/lib/geo";
import {
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressFormInput,
} from "@/app/cuenta/actions";

const inputCls =
  "w-full rounded-lg border border-hc-metal-light px-3 py-2 text-sm outline-none focus:border-hc-steel";

type Draft = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  territoryCode: string;
  zoneCode: string;
  zip: string;
  phoneNumber: string;
  makeDefault: boolean;
};

function toDraft(a?: CustomerAddress): Draft {
  return {
    firstName: a?.firstName ?? "",
    lastName: a?.lastName ?? "",
    company: a?.company ?? "",
    address1: a?.address1 ?? "",
    address2: a?.address2 ?? "",
    city: a?.city ?? "",
    territoryCode: a?.territoryCode ?? "MX",
    zoneCode: a?.zoneCode ?? "",
    zip: a?.zip ?? "",
    phoneNumber: a?.phoneNumber ?? "",
    makeDefault: a?.isDefault ?? false,
  };
}

function AddressForm({
  initial,
  addressId,
  onDone,
  onCancel,
}: {
  initial?: CustomerAddress;
  addressId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>(toDraft(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, start] = useTransition();
  const zones = ZONES[d.territoryCode] ?? [];
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  function submit() {
    setError(null);
    const payload: AddressFormInput = { ...d, id: addressId };
    start(async () => {
      const r = await saveAddressAction(payload);
      if (r.ok) onDone();
      else setError(r.error ?? "No se pudo guardar la dirección.");
    });
  }

  return (
    <div className="rounded-lg border border-hc-steel/40 bg-hc-soft/40 p-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Nombre</span>
          <input value={d.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Apellido</span>
          <input value={d.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Empresa</span>
          <input value={d.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Calle y número *</span>
          <input value={d.address1} onChange={(e) => set("address1", e.target.value)} className={inputCls} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Interior, colonia (opcional)</span>
          <input value={d.address2} onChange={(e) => set("address2", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Ciudad *</span>
          <input value={d.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">C.P.</span>
          <input value={d.zip} onChange={(e) => set("zip", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">País *</span>
          <select
            value={d.territoryCode}
            onChange={(e) => setD((p) => ({ ...p, territoryCode: e.target.value, zoneCode: "" }))}
            className={inputCls}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Estado</span>
          <select value={d.zoneCode} onChange={(e) => set("zoneCode", e.target.value)} className={inputCls}>
            <option value="">Selecciona…</option>
            {zones.map((z) => (
              <option key={z.code} value={z.code}>
                {z.name}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs text-hc-gunmetal">Teléfono</span>
          <input value={d.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} className={inputCls} />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-hc-ink">
        <input
          type="checkbox"
          checked={d.makeDefault}
          onChange={(e) => set("makeDefault", e.target.checked)}
          className="h-4 w-4 rounded border-hc-metal-light"
        />
        Usar como dirección predeterminada
      </label>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={saving}
          className="press inline-flex items-center gap-1.5 rounded-lg bg-hc-blue px-3.5 py-2 text-sm font-medium text-white hover:bg-hc-steel disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
          Guardar
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="press inline-flex items-center gap-1.5 rounded-lg border border-hc-metal-light bg-white px-3.5 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel disabled:opacity-60"
        >
          <X className="h-4 w-4" aria-hidden /> Cancelar
        </button>
      </div>
    </div>
  );
}

export function AddressManager({ addresses }: { addresses: CustomerAddress[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const refresh = () => {
    setAdding(false);
    setEditingId(null);
    router.refresh();
  };

  function onDelete(id: string) {
    setError(null);
    setBusyId(id);
    start(async () => {
      const r = await deleteAddressAction(id);
      setBusyId(null);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo eliminar.");
    });
  }

  function onSetDefault(id: string) {
    setError(null);
    setBusyId(id);
    start(async () => {
      const r = await setDefaultAddressAction(id);
      setBusyId(null);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo actualizar.");
    });
  }

  return (
    <div className="rounded-xl border border-hc-metal-light bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
          <MapPin className="h-4 w-4" aria-hidden />
          Direcciones
        </h2>
        {!adding && !editingId && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-hc-blue hover:text-hc-steel"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Agregar
          </button>
        )}
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {adding && <AddressForm onDone={refresh} onCancel={() => setAdding(false)} />}

      {addresses.length === 0 && !adding ? (
        <p className="text-sm text-hc-gunmetal">Sin direcciones guardadas.</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) =>
            editingId === a.id ? (
              <li key={a.id}>
                <AddressForm
                  initial={a}
                  addressId={a.id}
                  onDone={refresh}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={a.id} className="rounded-lg border border-hc-metal-light p-3">
                {a.isDefault && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-hc-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hc-steel">
                    <Star className="h-3 w-3 fill-current" aria-hidden /> Predeterminada
                  </span>
                )}
                <address className="text-sm not-italic leading-relaxed text-hc-ink">
                  {a.formatted.map((l, j) => (
                    <span key={j} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    onClick={() => {
                      setError(null);
                      setEditingId(a.id);
                      setAdding(false);
                    }}
                    disabled={busyId === a.id}
                    className="inline-flex items-center gap-1 font-medium text-hc-blue hover:text-hc-steel disabled:opacity-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
                  </button>
                  {!a.isDefault && (
                    <button
                      onClick={() => onSetDefault(a.id)}
                      disabled={busyId === a.id}
                      className="inline-flex items-center gap-1 font-medium text-hc-gunmetal hover:text-hc-steel disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden /> Hacer predeterminada
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(a.id)}
                    disabled={busyId === a.id}
                    className="inline-flex items-center gap-1 font-medium text-hc-gunmetal hover:text-red-600 disabled:opacity-50"
                  >
                    {busyId === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Eliminar
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
