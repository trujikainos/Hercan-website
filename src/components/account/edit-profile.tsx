"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, User, X } from "lucide-react";
import { saveProfileAction } from "@/app/cuenta/actions";

type Profile = {
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
};

export function EditProfile({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function cancel() {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    start(async () => {
      const r = await saveProfileAction({ firstName, lastName });
      if (r.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-hc-metal-light bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-hc-gunmetal">
          <User className="h-4 w-4" aria-hidden />
          Datos de contacto
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-hc-blue hover:text-hc-steel"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-hc-gunmetal">Nombre</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-hc-metal-light px-3 py-2 text-sm outline-none focus:border-hc-steel"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-hc-gunmetal">Apellido</span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-hc-metal-light px-3 py-2 text-sm outline-none focus:border-hc-steel"
              />
            </label>
          </div>
          <div>
            <span className="text-xs text-hc-gunmetal">Correo</span>
            <p className="break-all text-sm text-hc-ink">{profile.email || "—"}</p>
            <p className="mt-0.5 text-[11px] text-hc-metal">El correo y el teléfono se gestionan en el checkout.</p>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="press inline-flex items-center gap-1.5 rounded-lg bg-hc-blue px-3.5 py-2 text-sm font-medium text-white hover:bg-hc-steel disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
              Guardar
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              className="press inline-flex items-center gap-1.5 rounded-lg border border-hc-metal-light px-3.5 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <dl className="space-y-1.5 text-sm">
          <div>
            <dt className="text-hc-gunmetal">Nombre</dt>
            <dd className="text-hc-ink">{profile.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-hc-gunmetal">Correo</dt>
            <dd className="break-all text-hc-ink">{profile.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-hc-gunmetal">Teléfono</dt>
            <dd className="text-hc-ink">{profile.phone || "—"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
