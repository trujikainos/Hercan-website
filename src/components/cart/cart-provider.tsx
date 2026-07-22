"use client";
import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  useCallback,
} from "react";
import type { Cart, CartLine, CartNotice, Money } from "@/lib/cart-types";
import { addToCartAction, updateLineAction, removeLineAction } from "@/app/cart/actions";
import { CartDrawer } from "./cart-drawer";

export interface AddInput {
  variantId: string;
  quantity?: number;
  optimistic: { productTitle: string; handle: string; image: string | null; unitPrice: Money };
}

interface CartCtx {
  cart: Cart | null;
  enabled: boolean;
  count: number;
  isPending: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  notices: CartNotice[];
  dismissNotices: () => void;
  notify: (message: string) => void;
  add: (i: AddInput) => void;
  updateQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
}

const Ctx = createContext<CartCtx | null>(null);
export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};

type OA =
  | { kind: "add"; i: AddInput }
  | { kind: "update"; lineId: string; qty: number }
  | { kind: "remove"; lineId: string };

function money(amount: number, currencyCode: string): Money {
  return { amount: amount.toFixed(2), currencyCode };
}

function buildCart(prev: Cart | null, lines: CartLine[], currencyCode: string): Cart {
  const totalQuantity = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotalAmount = lines.reduce((s, l) => s + parseFloat(l.unitPrice.amount) * l.quantity, 0);
  return {
    id: prev?.id ?? "optimistic",
    checkoutUrl: prev?.checkoutUrl ?? "",
    totalQuantity,
    subtotal: money(subtotalAmount, currencyCode),
    total: money(subtotalAmount, currencyCode),
    currencyCode,
    lines,
  };
}

function reduce(cart: Cart | null, a: OA): Cart | null {
  if (a.kind === "add") {
    const { i } = a;
    const qty = i.quantity ?? 1;
    const cc = i.optimistic.unitPrice.currencyCode;
    const lines: CartLine[] = cart ? [...cart.lines] : [];
    const idx = lines.findIndex((l) => l.merchandiseId === i.variantId);
    if (idx >= 0) {
      const l = lines[idx];
      const newQty = l.quantity + qty;
      lines[idx] = { ...l, quantity: newQty, lineTotal: money(parseFloat(l.unitPrice.amount) * newQty, cc) };
    } else {
      lines.push({
        id: `optimistic:${i.variantId}`,
        quantity: qty,
        merchandiseId: i.variantId,
        productTitle: i.optimistic.productTitle,
        variantTitle: "",
        handle: i.optimistic.handle,
        sku: null,
        unitPrice: i.optimistic.unitPrice,
        lineTotal: money(parseFloat(i.optimistic.unitPrice.amount) * qty, cc),
        image: i.optimistic.image,
        availableForSale: true,
        quantityAvailable: null,
      });
    }
    return buildCart(cart, lines, cc);
  }
  if (a.kind === "update") {
    if (!cart) return cart;
    const lines = cart.lines
      .map((l) =>
        l.id === a.lineId
          ? { ...l, quantity: a.qty, lineTotal: money(parseFloat(l.unitPrice.amount) * a.qty, cart.currencyCode) }
          : l,
      )
      .filter((l) => l.quantity > 0);
    return buildCart(cart, lines, cart.currencyCode);
  }
  // remove
  if (!cart) return cart;
  const lines = cart.lines.filter((l) => l.id !== a.lineId);
  return buildCart(cart, lines, cart.currencyCode);
}

export function CartProvider({
  children,
  initialCart,
  enabled,
}: {
  children: React.ReactNode;
  initialCart: Cart | null;
  enabled: boolean;
}) {
  const [base, setBase] = useState<Cart | null>(initialCart);
  const [optimistic, applyOptimistic] = useOptimistic(base, (c: Cart | null, a: OA) => reduce(c, a));
  const [pending, start] = useTransition();
  const [isOpen, setOpen] = useState(false);
  const [notices, setNotices] = useState<CartNotice[]>([]);

  const run = useCallback(
    (
      oa: OA,
      action: () => Promise<{ ok: boolean; cart: Cart | null; notices: CartNotice[]; recovered?: boolean }>,
    ) => {
      start(async () => {
        applyOptimistic(oa); // UI instantánea (cantidades absolutas)
        const r = await action();
        if (r.cart) setBase(r.cart); // reconciliación autoritativa
        else if (r.recovered) setBase(null); // el carrito del servidor expiró → descartar la base vieja
        // NETWORK (cart == null && !ok && !recovered): conserva la base; el optimista se revierte solo
        setNotices(r.notices);
      });
    },
    [applyOptimistic],
  );

  const add = useCallback(
    (i: AddInput) => {
      if (!enabled) return;
      setOpen(true);
      run({ kind: "add", i }, () => addToCartAction(i.variantId, i.quantity ?? 1));
    },
    [enabled, run],
  );
  const updateQty = useCallback(
    (lineId: string, qty: number) => run({ kind: "update", lineId, qty }, () => updateLineAction(lineId, qty)),
    [run],
  );
  const remove = useCallback(
    (lineId: string) => run({ kind: "remove", lineId }, () => removeLineAction(lineId)),
    [run],
  );
  // Aviso solo-cliente (p. ej. tope de stock), sin ir al servidor.
  const notify = useCallback((message: string) => {
    setNotices([{ code: "OUT_OF_STOCK", message }]);
  }, []);

  return (
    <Ctx.Provider
      value={{
        cart: optimistic,
        enabled,
        count: optimistic?.totalQuantity ?? 0,
        isPending: pending,
        isOpen,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
        notices,
        dismissNotices: () => setNotices([]),
        notify,
        add,
        updateQty,
        remove,
      }}
    >
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}
