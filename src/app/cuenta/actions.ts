"use server";

import { revalidatePath } from "next/cache";
import {
  updateCustomerProfile,
  addCustomerAddress,
  editCustomerAddress,
  removeCustomerAddress,
  setDefaultAddress,
  getCustomerOrders,
  type MutationResult,
  type AddressInput,
} from "@/lib/customer-account";
import { rangeToQuery } from "@/lib/order-filters";
import type { AddressFormInput, OrdersActionResult } from "@/lib/account-types";

const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export async function saveProfileAction(input: {
  firstName: string;
  lastName: string;
}): Promise<MutationResult> {
  const firstName = clean(input.firstName);
  const lastName = clean(input.lastName);
  if (!firstName && !lastName) return { ok: false, error: "Escribe al menos un nombre." };
  const r = await updateCustomerProfile(firstName, lastName);
  if (r.ok) {
    revalidatePath("/cuenta");
    revalidatePath("/cuenta/perfil");
  }
  return r;
}

// Construye el input de dirección solo con campos no vacíos (evita mandar "" a Shopify).
function buildAddress(input: AddressFormInput): { addr: AddressInput; error?: string } {
  const addr: AddressInput = {};
  const map: (keyof AddressInput)[] = [
    "firstName",
    "lastName",
    "company",
    "address1",
    "address2",
    "city",
    "zip",
    "phoneNumber",
    "territoryCode",
    "zoneCode",
  ];
  for (const k of map) {
    const v = clean(input[k]);
    if (v) addr[k] = v;
  }
  // Mínimos para una dirección de envío usable.
  if (!addr.address1) return { addr, error: "La calle y número son obligatorios." };
  if (!addr.city) return { addr, error: "La ciudad es obligatoria." };
  if (!addr.territoryCode) return { addr, error: "Selecciona el país." };
  return { addr };
}

export async function saveAddressAction(input: AddressFormInput): Promise<MutationResult> {
  const { addr, error } = buildAddress(input);
  if (error) return { ok: false, error };
  const makeDefault = Boolean(input.makeDefault);
  const r = input.id
    ? await editCustomerAddress(input.id, addr, makeDefault)
    : await addCustomerAddress(addr, makeDefault);
  if (r.ok) {
    revalidatePath("/cuenta");
    revalidatePath("/cuenta/direcciones");
  }
  return r;
}

export async function deleteAddressAction(id: string): Promise<MutationResult> {
  if (!id) return { ok: false, error: "Dirección no válida." };
  const r = await removeCustomerAddress(id);
  if (r.ok) {
    revalidatePath("/cuenta");
    revalidatePath("/cuenta/direcciones");
  }
  return r;
}

export async function setDefaultAddressAction(id: string): Promise<MutationResult> {
  if (!id) return { ok: false, error: "Dirección no válida." };
  const r = await setDefaultAddress(id);
  if (r.ok) {
    revalidatePath("/cuenta");
    revalidatePath("/cuenta/direcciones");
  }
  return r;
}

// Lista de pedidos: filtro por rango + paginación "Cargar más".
export async function loadOrdersAction(input: {
  range: string;
  after?: string | null;
}): Promise<OrdersActionResult> {
  const query = rangeToQuery(input.range, Date.now());
  const r = await getCustomerOrders({ first: 10, after: input.after ?? null, query });
  if (!r) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  if ("error" in r) return { ok: false, error: "No pudimos cargar los pedidos. Intenta de nuevo." };
  return { ok: true, orders: r.orders, hasNextPage: r.hasNextPage, endCursor: r.endCursor };
}
