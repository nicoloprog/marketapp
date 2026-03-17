"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  DollarSign,
  ShoppingBag,
  Calendar,
  Package,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  orders,
  bookings,
  products,
  orderItems,
  formatPrice,
  getUserById,
  getServiceById,
  getVehicleById,
} from "@/lib/data";
import Link from "next/link";

export default function AdminDashboard() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalBookings = bookings.length;
  const totalProducts = products.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const activeOrders = orders.filter(
    (o) => o.status === "PAID" || o.status === "SHIPPED",
  ).length;

  const metrics = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      description: `From ${totalOrders} orders`,
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: totalOrders.toString(),
      description: `${activeOrders} active`,
      icon: ShoppingBag,
    },
    {
      title: "Bookings",
      value: totalBookings.toString(),
      description: `${pendingBookings} pending`,
      icon: Calendar,
    },
    {
      title: "Products",
      value: totalProducts.toString(),
      description: `${products.reduce((s, p) => s + p.stock, 0)} total stock`,
      icon: Package,
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your business metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Bookings</CardTitle>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {bookings.slice(0, 4).map((booking) => {
                const user = getUserById(booking.user_id);
                const service = getServiceById(booking.service_id);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service?.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        booking.status === "PENDING"
                          ? "bg-chart-4/20 text-chart-4"
                          : booking.status === "APPROVED"
                            ? "bg-primary/20 text-primary"
                            : booking.status === "COMPLETED"
                              ? "bg-chart-3/20 text-chart-3"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {orders.map((order) => {
                const user = getUserById(order.user_id);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "COMPLETED"
                          ? "bg-chart-3/20 text-chart-3"
                          : order.status === "SHIPPED"
                            ? "bg-chart-2/20 text-chart-2"
                            : order.status === "PAID"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card className="mt-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Low Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((p) => p.stock < 20)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-md bg-background px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-chart-5">
                    {product.stock} left
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
