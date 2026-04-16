"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Ship, Menu, UserIcon, LayoutDashboard, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Voitures" },
  // { href: "/articles", label: "Articles" },
  { href: "/construction", label: "Matériaux" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAdmin, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto inline-flex w-full max-w-3xl items-center gap-1 rounded-full border border-slate-900/[.13] bg-white/70 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(30,41,59,0.09),0_1px_3px_rgba(30,41,59,0.06)] backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <Image
            src="/dealotter.png"
            alt="Costra"
            width={27}
            height={27}
            className="rounded-2xl"
          />
          <span className="text-[13.5px] font-bold italic tracking-tight text-slate-700">
            Costra
          </span>
        </Link>

        {/* Divider */}
        <div className="mx-1 h-4 w-px shrink-0 bg-slate-900/[.12]" />

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-500/10 text-blue-700"
                  : "text-slate-500 hover:bg-slate-900/[.07] hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1">
          {/* Cart Button */}
          {/* <Link href="/shop/cart" className="relative">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-900/[.07] hover:text-slate-900">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link> */}

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-900/[.07] hover:text-slate-900"
                    >
                      <UserIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="mt-2 w-56 rounded-2xl border border-slate-900/[.1] bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(30,41,59,0.12)] backdrop-blur-xl"
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator className="my-1 h-px bg-slate-900/[.07]" />

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 h-px bg-slate-900/[.07]" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 outline-none transition-colors hover:bg-red-50 focus:text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-1 sm:flex">
                  <Link href="/login">
                    <button className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-900/[.07] hover:text-slate-900">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="rounded-full bg-blue-600 px-4 py-[7px] text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-900/[.07] hover:text-slate-900 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-slate-200 bg-white/90 backdrop-blur-xl"
            >
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>

              {/* Logo in sheet */}
              <div className="flex items-center gap-2 px-2 pb-6 pt-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500">
                  <Ship className="h-4 w-4 text-white" />
                </div>
                <span className="text-[15px] font-bold tracking-tight text-slate-900">
                  Costra
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors",
                      pathname === link.href
                        ? "bg-blue-500/10 text-blue-700"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <hr className="my-4 border-slate-100" />

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mb-1 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <button className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <button className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700">
                      Create Account
                    </button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground">
        © 2026 Costra. All rights reserved.
      </div>
    </footer>
  );
}
