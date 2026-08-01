"use client";
import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  useCallback,
  useRef,
} from "react";
import type { Cart, CartLine, CartNotice, Money } from "@/lib/cart-types";
import {
  addToCartAction,
  updateLineAction,
  removeLineAction,
  reorderAction,
  clearCartAction,
  getCartAction,
} from "@/app/cart/actions";
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
  reorder: (items: { variantId: string; quantity: number }[]) => void;
  updateQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
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

  // Serializa las mutaciones del carrito: la 2ª espera a que la 1ª termine (y
  // escriba la cookie del carrito) antes de correr. Elimina la carrera de "agregar
  // dos productos casi al mismo tiempo con el carrito vacío → cada petición no ve
  // la cookie aún, crea un carrito y se pisa con la otra → se pierde un producto".
  const chain = useRef<Promise<void>>(Promise.resolve());
  const serialized = useCallback((fn: () => Promise<void>) => {
    const prev = chain.current;
    let release!: () => void;
    chain.current = new Promise<void>((r) => (release = r));
    return (async () => {
      try {
        await prev;
        await fn();
      } finally {
        release();
      }
    })();
  }, []);

  // Red de seguridad: si la respuesta de una mutación se pierde/aborta EN TRÁNSITO
  // (el producto pudo SÍ guardarse en la cookie del servidor), re-lee el carrito
  // autoritativo para que el cliente refleje la verdad y no se "pierda" nada.
  const reconcile = useCallback(async () => {
    const fresh = await getCartAction().catch(() => null);
    if (fresh?.cart) setBase(fresh.cart);
    return fresh?.cart ?? null;
  }, []);

  const run = useCallback(
    (
      oa: OA,
      action: () => Promise<{ ok: boolean; cart: Cart | null; notices: CartNotice[]; recovered?: boolean }>,
    ) => {
      start(async () => {
        applyOptimistic(oa); // UI instantánea (no espera la serialización)
        await serialized(async () => {
          try {
            const r = await action();
            if (r.cart) setBase(r.cart); // reconciliación autoritativa
            else if (r.recovered) setBase(null); // el carrito del servidor expiró
            // NETWORK (cart == null && ok=false): el cambio NO se aplicó en el
            // servidor → conserva la base; el optimista se revierte solo.
            setNotices(r.notices);
          } catch {
            // Fetch del Server Action abortado/caído: reconcilia con el servidor.
            await reconcile();
          }
        });
      });
    },
    [applyOptimistic, serialized, reconcile],
  );

  const add = useCallback(
    (i: AddInput) => {
      if (!enabled) return;
      setOpen(true);
      run({ kind: "add", i }, () => addToCartAction(i.variantId, i.quantity ?? 1));
    },
    [enabled, run],
  );
  // "Volver a pedir": sin optimista (puede saltar agotados en el servidor); abre el
  // carrito y reconcilia con lo que el servidor sí agregó + avisa lo omitido.
  const reorder = useCallback(
    (items: { variantId: string; quantity: number }[]) => {
      if (!enabled) return;
      setOpen(true);
      start(async () => {
        await serialized(async () => {
          try {
            const r = await reorderAction(items);
            if (r.cart) setBase(r.cart);
            else if (r.recovered) setBase(null);
            setNotices(r.notices);
          } catch {
            await reconcile();
          }
        });
      });
    },
    [enabled, serialized, reconcile],
  );
  const updateQty = useCallback(
    (lineId: string, qty: number) => run({ kind: "update", lineId, qty }, () => updateLineAction(lineId, qty)),
    [run],
  );
  const remove = useCallback(
    (lineId: string) => run({ kind: "remove", lineId }, () => removeLineAction(lineId)),
    [run],
  );
  // Vaciar carrito completo: sin optimista (reconcilia con el carrito vacío del servidor).
  const clear = useCallback(() => {
    if (!enabled) return;
    start(async () => {
      await serialized(async () => {
        try {
          const r = await clearCartAction();
          if (r.cart) setBase(r.cart);
          else if (r.recovered) setBase(null);
          else setBase(null);
          setNotices(r.notices);
        } catch {
          await reconcile();
        }
      });
    });
  }, [enabled, serialized, reconcile]);
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
        reorder,
        updateQty,
        remove,
        clear,
      }}
    >
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}
