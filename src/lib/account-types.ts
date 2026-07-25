// Tipos compartidos entre las server actions de /cuenta y los componentes cliente.
// Viven fuera del archivo "use server" (que solo debe exportar funciones async) y del
// módulo server-only; al ser solo tipos, el import se borra en compilación (0 runtime).
import type { AddressInput, CustomerOrder } from "./customer-account";

export type AddressFormInput = AddressInput & { id?: string; makeDefault?: boolean };

export type OrdersActionResult =
  | { ok: true; orders: CustomerOrder[]; hasNextPage: boolean; endCursor: string | null }
  | { ok: false; error: string };
