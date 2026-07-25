// Helpers de formato compartidos por las secciones de /cuenta.

export const money = (m: { amount: string; currencyCode: string } | null) => {
  if (!m) return "—";
  const n = Number(m.amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: m.currencyCode || "MXN",
  }).format(n);
};

export const fmtDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

// Estado financiero → etiqueta + color.
export const FIN_STATUS: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Pagado", cls: "bg-[#e6f4ea] text-[#2e7d46]" },
  PENDING: { label: "Pendiente", cls: "bg-[#fff4e5] text-[#b25e00]" },
  PARTIALLY_PAID: { label: "Pago parcial", cls: "bg-[#fff4e5] text-[#b25e00]" },
  AUTHORIZED: { label: "Autorizado", cls: "bg-hc-soft text-hc-steel" },
  REFUNDED: { label: "Reembolsado", cls: "bg-hc-soft text-hc-gunmetal" },
  PARTIALLY_REFUNDED: { label: "Reembolso parcial", cls: "bg-hc-soft text-hc-gunmetal" },
  VOIDED: { label: "Anulado", cls: "bg-hc-soft text-hc-gunmetal" },
  EXPIRED: { label: "Expirado", cls: "bg-hc-soft text-hc-gunmetal" },
};

export function finStatus(status: string | null) {
  return (status && FIN_STATUS[status]) || { label: status ?? "—", cls: "bg-hc-soft text-hc-gunmetal" };
}
