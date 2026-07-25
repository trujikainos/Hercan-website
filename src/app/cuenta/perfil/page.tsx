import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Mail } from "lucide-react";
import { getCustomerAccount } from "@/lib/customer-account";
import { AccountShell } from "@/components/account/account-shell";
import { EditProfile } from "@/components/account/edit-profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Mis datos | HERCAN" },
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const acc = await getCustomerAccount();
  if (!acc) redirect("/account/login");

  if ("error" in acc) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-hc-navy">Mis datos</h1>
        <p className="mt-3 text-hc-gunmetal">No pudimos cargar tu información. Vuelve a intentarlo en unos segundos.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/cuenta/perfil" className="press rounded-lg bg-hc-steel px-4 py-2 text-sm font-medium text-white hover:bg-hc-blue">
            Reintentar
          </Link>
          <a href="/account/logout" className="press inline-flex items-center gap-1 rounded-lg border border-hc-metal-light px-4 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel">
            <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
          </a>
        </div>
      </main>
    );
  }

  const { profile } = acc;

  return (
    <AccountShell name={profile.name} email={profile.email} active="perfil">
      <div className="mx-auto max-w-xl space-y-4">
        <EditProfile profile={profile} />

        {/* El correo/teléfono no se editan por API (identidad de acceso) → contacto. */}
        <div className="flex items-start gap-3 rounded-xl border border-hc-metal-light bg-hc-soft/40 p-4">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-hc-steel" aria-hidden />
          <p className="text-sm text-hc-gunmetal">
            Tu <strong className="text-hc-ink">correo</strong> y <strong className="text-hc-ink">teléfono</strong> son tu
            identidad de acceso y no se cambian desde aquí.{" "}
            <Link href="/contacto" className="font-medium text-hc-blue hover:text-hc-steel">
              Contáctanos
            </Link>{" "}
            y los actualizamos por ti.
          </p>
        </div>
      </div>
    </AccountShell>
  );
}
