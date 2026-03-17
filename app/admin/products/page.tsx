"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  products as initialProducts,
  getProductCategories,
  formatPrice,
} from "@/lib/data";
import type { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";
export default async function AdminProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const categories = getProductCategories();

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState("");

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormStock("");
    setFormCategory("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    // setFormDescription(product.description);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    // setFormCategory(product.category);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formPrice || !formStock || !formCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingProduct) {
      setProductsList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                description: formDescription,
                price: parseFloat(formPrice),
                stock: parseInt(formStock),
                category: formCategory,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      toast.success("Product updated");
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        name: formName,
        description: formDescription,
        price: parseFloat(formPrice),
        stock: parseInt(formStock),
        category: formCategory,
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProductsList((prev) => [newProduct, ...prev]);
      toast.success("Product created");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your parts inventory
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingProduct ? "Edit Product" : "New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Description</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Stock *</Label>
                  <Input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(await categories).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsList.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {product.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${product.stock < 10 ? "text-chart-5" : "text-foreground"}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 p-4 lg:hidden">
          {productsList.map((product) => (
            <div
              key={product.id}
              className="rounded-md border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-secondary text-secondary-foreground"
                  >
                    {product.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span
                  className={
                    product.stock < 10
                      ? "text-chart-5"
                      : "text-muted-foreground"
                  }
                >
                  {product.stock} in stock
                </span>
              </div>
            </div>
          ))}
        </div>

        {productsList.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No products found. Add your first product.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
