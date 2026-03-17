"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, formatPrice, type Product } from "@/lib/data";
import { useCart } from "@/lib/store";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    getFeaturedProducts(4)
      .then(setFeatured)
      .catch(() => toast.error("Failed to load products"));
  }, []);

  return (
    <section className="border-t border-border bg-card py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
              Pieces en Vedette
            </h2>
            <p className="mt-2 text-muted-foreground">
              Des pièces de qualité pour tous les besoins de réparation
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
          >
            Parcourir les pièces
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-lg border border-border bg-card"
                />
              ))
            : featured.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/40"
                >
                  <div className="mb-4 flex h-40 items-center justify-center rounded-md bg-secondary">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <span className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                    {product.category}
                  </span>
                  <h3 className="mb-1 font-medium text-foreground">
                    {product.name}
                  </h3>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        addItem(product.id);
                        toast.success(`${product.name} added to cart`);
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Browse All Parts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
