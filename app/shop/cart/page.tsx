"use client";

import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store";
import { formatPrice, CartItem } from "@/lib/data";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  // ✅ Use the Cart context
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();

  const total = getTotal();

  const cartProducts = items.map((item: CartItem) => ({
    ...item.product!,
    quantity: item.quantity,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
              Your Cart
            </h1>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear Cart
              </Button>
            )}
          </div>

          {cartProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h2 className="text-xl font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-2 text-muted-foreground">
                Browse our parts catalog to find what you need.
              </p>
              <Link href="/shop" className="mt-6">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {cartProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(product.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">
                        {product.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-semibold text-foreground">
                        {formatPrice(product.price * product.quantity)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeItem(product.id);
                        toast.success(`${product.name} removed from cart`);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(total)}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    clearCart();
                    toast.success("Order placed successfully! (Demo)");
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Checkout
                </Button>
              </div>

              <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
