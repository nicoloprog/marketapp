"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  DollarSign,
  ShoppingBag,
  Calendar,
  Package,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import {
  orders,
  bookings,
  products,
  formatPrice,
  getUserById,
  getServiceById,
} from "@/lib/data";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  // bookings
  PENDING: "bg-yellow-500/10 text-yellow-400",
  APPROVED: "bg-blue-500/10   text-blue-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-white/5       text-slate-500",
  // orders
  PAID: "bg-blue-500/10   text-blue-400",
  SHIPPED: "bg-purple-500/10 text-purple-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? "bg-white/5 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        accent
          ? "border-blue-500/30 bg-blue-500/10"
          : "border-white/[.07] bg-white/[.03]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11.5px] font-medium uppercase tracking-widest text-slate-500">
            {title}
          </p>
          <p
            className={`mt-2 text-[1.7rem] font-bold leading-none tracking-tight ${
              accent ? "text-blue-400" : "text-white"
            }`}
          >
            {value}
          </p>
          <p className="mt-1.5 text-[12px] text-slate-500">{description}</p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent ? "bg-blue-500/20" : "bg-white/[.06]"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${accent ? "text-blue-400" : "text-slate-400"}`}
          />
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  href,
  label = "View all",
}: {
  title: string;
  href: string;
  label?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-[11.5px] font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        {label} <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({
  primary,
  secondary,
  right,
}: {
  primary: string;
  secondary: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[.03] px-4 py-3 transition-colors hover:bg-white/[.05]">
      <div>
        <p className="text-[13px] font-medium text-slate-200">{primary}</p>
        <p className="text-[11.5px] text-slate-500">{secondary}</p>
      </div>
      {right}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const activeOrders = orders.filter(
    (o) => o.status === "PAID" || o.status === "SHIPPED",
  ).length;
  const lowStock = products.filter((p) => p.stock < 20);

  const metrics = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      description: `From ${orders.length} orders`,
      icon: DollarSign,
      accent: true,
    },
    {
      title: "Orders",
      value: orders.length.toString(),
      description: `${activeOrders} active`,
      icon: ShoppingBag,
    },
    {
      title: "Bookings",
      value: bookings.length.toString(),
      description: `${pendingBookings} pending`,
      icon: Calendar,
    },
    {
      title: "Products",
      value: products.length.toString(),
      description: `${products.reduce((s, p) => s + p.stock, 0)} total stock`,
      icon: Package,
    },
  ];

  return (
    <AdminLayout>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your business metrics.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Recent Bookings + Orders */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bookings */}
        <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5">
          <SectionHeader title="Recent Bookings" href="/admin/bookings" />
          <div className="flex flex-col gap-2">
            {bookings.slice(0, 4).map((booking) => {
              const user = getUserById(booking.user_id);
              const service = getServiceById(booking.service_id);
              return (
                <Row
                  key={booking.id}
                  primary={user?.name ?? "—"}
                  secondary={service?.name ?? "—"}
                  right={<StatusBadge status={booking.status} />}
                />
              );
            })}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-5">
          <SectionHeader title="Recent Orders" href="/admin/orders" />
          <div className="flex flex-col gap-2">
            {orders.slice(0, 4).map((order) => {
              const user = getUserById(order.user_id);
              return (
                <Row
                  key={order.id}
                  primary={user?.name ?? "—"}
                  secondary={formatPrice(order.total)}
                  right={<StatusBadge status={order.status} />}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/[.04] p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h2 className="text-[14px] font-semibold text-white">
              Low Stock Alert
            </h2>
            <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-yellow-400">
              {lowStock.length} product{lowStock.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((product) => (
              <Row
                key={product.id}
                primary={product.name}
                secondary={product.category}
                right={
                  <span className="text-[13px] font-bold text-yellow-400">
                    {product.stock} left
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
