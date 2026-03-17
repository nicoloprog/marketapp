"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { orders, orderItems, getUserById, getProductById, formatPrice, formatDate } from "@/lib/data"
import type { OrderStatus } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-chart-4/20 text-chart-4",
  PAID: "bg-primary/20 text-primary",
  SHIPPED: "bg-chart-2/20 text-chart-2",
  COMPLETED: "bg-chart-3/20 text-chart-3",
  CANCELLED: "bg-destructive/20 text-destructive",
}

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("ALL")
  const [localOrders, setLocalOrders] = useState(orders)

  const filtered = filter === "ALL"
    ? localOrders
    : localOrders.filter((o) => o.status === filter)

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    )
    toast.success(`Order status updated to ${newStatus}`)
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage customer orders
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const user = getUserById(order.userId)
                const items = orderItems.filter((oi) => oi.orderId === order.id)
                return (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">
                      {order.id.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColors[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Order {order.id.toUpperCase()}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-3">
                              {items.map((item) => {
                                const product = getProductById(item.productId)
                                return (
                                  <div key={item.id} className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{product?.name}</p>
                                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                )
                              })}
                              <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                        >
                          <SelectTrigger className="h-8 w-32 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 p-4 lg:hidden">
          {filtered.map((order) => {
            const user = getUserById(order.userId)
            return (
              <div key={order.id} className="rounded-md border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-medium text-foreground">{order.id.toUpperCase()}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColors[order.status])}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{user?.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                </div>
                <div className="mt-3">
                  <Select
                    value={order.status}
                    onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                  >
                    <SelectTrigger className="h-8 bg-card text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
