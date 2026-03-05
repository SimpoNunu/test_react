import type { Product } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_KEY = "boutique:cart:v1";

function safeParseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const obj = x as { productId?: unknown; quantity?: unknown };
        if (typeof obj.productId !== "string") return null;
        const q = typeof obj.quantity === "number" ? obj.quantity : 0;
        if (!Number.isFinite(q) || q <= 0) return null;
        return { productId: obj.productId, quantity: Math.floor(q) } satisfies CartItem;
      })
      .filter((x): x is CartItem => Boolean(x));
  } catch {
    return [];
  }
}

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCart(): CartItem[] {
  if (!hasWindow()) return [];
  return safeParseCart(window.localStorage.getItem(CART_KEY));
}

export function setCart(items: CartItem[]): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addToCart(productId: string, quantity = 1): void {
  const q = Math.max(1, Math.floor(quantity));
  const items = getCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.quantity += q;
  else items.push({ productId, quantity: q });
  setCart(items);
}

export function updateQuantity(productId: string, quantity: number): void {
  const q = Math.floor(quantity);
  const items = getCart();
  const next = items
    .map((i) => (i.productId === productId ? { ...i, quantity: q } : i))
    .filter((i) => i.quantity > 0);
  setCart(next);
}

export function removeFromCart(productId: string): void {
  const items = getCart().filter((i) => i.productId !== productId);
  setCart(items);
}

export function countCartItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartLineTotalCents(product: Product, quantity: number): number {
  return product.priceCents * quantity;
}


