"use server";

import { revalidatePath } from "next/cache";
import {
  updateCustomerProfile,
  addCustomerAddress,
  editCustomerAddress,
  removeCustomerAddress,
  setDefaultAddress,
  type MutationResult,
  type AddressInput,
} from "@/lib/customer-account";

const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export async function saveProfileAction(input: {
  firstName: string;
  lastName: string;
}): Promise<MutationResult> {
  const firstName = clean(input.firstName);
  const lastName = clean(input.lastName);
  if (!firstName && !lastName) return { ok: false, error: "Escribe al menos un nombre." };
  const r = await updateCustomerProfile(firstName, lastName);
  if (r.ok) revalidatePath("/cuenta");
  return r;
}

export type AddressFormInput = AddressInput & { id?: string; makeDefault?: boolean };

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
  if (r.ok) revalidatePath("/cuenta");
  return r;
}

export async function deleteAddressAction(id: string): Promise<MutationResult> {
  if (!id) return { ok: false, error: "Dirección no válida." };
  const r = await removeCustomerAddress(id);
  if (r.ok) revalidatePath("/cuenta");
  return r;
}

export async function setDefaultAddressAction(id: string): Promise<MutationResult> {
  if (!id) return { ok: false, error: "Dirección no válida." };
  const r = await setDefaultAddress(id);
  if (r.ok) revalidatePath("/cuenta");
  return r;
}
