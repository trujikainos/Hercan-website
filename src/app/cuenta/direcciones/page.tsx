import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCustomerAccount } from "@/lib/customer-account";
import { AccountShell } from "@/components/account/account-shell";
import { AddressManager } from "@/components/account/address-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Mis direcciones | HERCAN" },
  robots: { index: false, follow: false },
};

export default async function DireccionesPage() {
  const acc = await getCustomerAccount();
  if (!acc) redirect("/account/login");

  if ("error" in acc) {
    return (
      <main id="contenido" className="mx-auto max-w-3xl flex-1 px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-hc-navy">Mis direcciones</h1>
        <p className="mt-3 text-hc-gunmetal">No pudimos cargar tus direcciones. Vuelve a intentarlo en unos segundos.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/cuenta/direcciones" className="press rounded-lg bg-hc-steel px-4 py-2 text-sm font-medium text-white hover:bg-hc-blue">
            Reintentar
          </Link>
          <a href="/account/logout" className="press inline-flex items-center gap-1 rounded-lg border border-hc-metal-light px-4 py-2 text-sm font-medium text-hc-navy hover:border-hc-steel">
            <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
          </a>
        </div>
      </main>
    );
  }

  return (
    <AccountShell name={acc.profile.name} email={acc.profile.email} active="direcciones">
      <div className="mx-auto max-w-xl">
        <AddressManager addresses={acc.addresses} />
      </div>
    </AccountShell>
  );
}
