"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Package,
  ShoppingBag,
  ArrowLeft,
  Wrench,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
];

// ── Access Denied ─────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060c18] px-4">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <Wrench className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">
          You must be signed in as an admin to access this page.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Sign in as Admin
        </Link>
      </div>
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-blue-500/15 text-blue-400"
          : "text-slate-400 hover:bg-white/[.05] hover:text-slate-100",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active
            ? "text-blue-400"
            : "text-slate-500 group-hover:text-slate-300",
        )}
      />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3 w-3 text-blue-400/60" />}
    </Link>
  );
}

// ── Admin Layout ──────────────────────────────────────────────────────────────
// NOTE: must NOT be async — useAuth() is a client-side hook
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  if (!user || !isAdmin) return <AccessDenied />;

  return (
    <div className="flex min-h-screen bg-[#060c18]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-white/[.06] bg-[#080f1e] lg:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-white/[.06] px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
            <Wrench className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[12.5px] font-bold leading-none text-white">
              EasyPrice
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-slate-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Menu
          </p>
          {adminNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[.06] p-3">
          {/* User chip */}
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/[.04] px-3 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
              {(user.name?.[0] ?? user.email?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-200">
                {user.name ?? "Admin"}
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-slate-500 transition-colors hover:bg-white/[.05] hover:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[.06] bg-[#080f1e] px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
              <Wrench className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Site
          </Link>
        </header>

        {/* Mobile nav */}
        <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/[.06] bg-[#080f1e] px-3 py-2 lg:hidden">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-slate-400 hover:bg-white/[.05] hover:text-slate-200",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
