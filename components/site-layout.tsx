"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
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
  { href: "/construction", label: "Matériaux" },
  { href: "/subscriptions", label: "Abonnements" },
];

const legalMenuLinks = [
  { href: "/privacy", label: "Politique de confidentialité" },
  { href: "/privacy/choices", label: "Choix de confidentialité" },
  { href: "/terms", label: "Conditions d'utilisation" },
];

function menuLinkClass(active: boolean) {
  return cn(
    "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
    active
      ? "bg-gradient-to-t from-black/30 via-transparent to-transparent text-black/70 font-bold"
      : "text-slate-500 hover:bg-slate-900/[.07] hover:text-slate-900",
  );
}

function SheetLink({
  href,
  label,
  onClick,
  active = false,
}: {
  href: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors",
        active
          ? "bg-blue-500/10 text-gray-800 font-bold"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAdmin, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto inline-flex w-full max-w-5xl items-center gap-1 rounded-full border border-slate-900/[.13] bg-white/70 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(30,41,59,0.09),0_1px_3px_rgba(30,41,59,0.06)] backdrop-blur-xl">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-1">
          <Image
            src="/banditprice.png"
            alt="BanditPrice Logo"
            width={27}
            height={27}
            className="rounded-sm"
          />
          <span className="font-roboto text-[14.5px] font-black italic tracking-tighter text-slate-800">
            Banditprice
          </span>
        </Link>

        <div className="mx-1 h-4 w-px shrink-0 bg-slate-900/[.12]" />

        <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex ">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={menuLinkClass(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {!loading && (
            <>
              {user ? (
                <div className="hidden md:block">
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
                      className="mt-2 w-64 rounded-2xl border border-slate-900/[.1] bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(30,41,59,0.12)] backdrop-blur-xl"
                    >
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.name || "Mon compte"}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>

                      <DropdownMenuSeparator className="my-1 h-px bg-slate-900/[.07]" />

                      {isAdmin ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Tableau admin</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : null}

                      <DropdownMenuItem asChild>
                        <Link
                          href="/account"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Mon compte</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-1 h-px bg-slate-900/[.07]" />
                      <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Conditions
                      </div>
                      {legalMenuLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            className="flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-sm text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="my-1 h-px bg-slate-900/[.07]" />
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 outline-none transition-colors hover:bg-red-50 focus:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden items-center gap-1 md:flex md:ml-[-125px]">
                  <Link href="/login">
                    <button className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-900/[.07] hover:text-slate-900">
                      Connexion
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="rounded-full bg-blue-600 px-4 py-[7px] text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700">
                      Créer un compte
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}

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

              <div className="flex items-center gap-2 px-2 pb-6 pt-2">
                <Image
                  src="/banditprice.png"
                  alt="BanditPrice Logo"
                  width={25}
                  height={25}
                  className="rounded-sm"
                />
                <span className="text-[15px] font-bold italic tracking-tight text-slate-900">
                  BanditPrice
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <SheetLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={pathname === link.href}
                    onClick={closeSheet}
                  />
                ))}
              </div>

              <hr className="my-4 border-slate-100" />

              {user ? (
                <>
                  <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Compte
                  </div>
                  <div className="flex flex-col gap-1">
                    {isAdmin ? (
                      <SheetLink
                        href="/admin"
                        label="Tableau admin"
                        onClick={closeSheet}
                      />
                    ) : null}
                    <SheetLink
                      href="/account"
                      label="Mon compte"
                      onClick={closeSheet}
                    />
                  </div>

                  <hr className="my-4 border-slate-100" />
                </>
              ) : null}

              <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Legal
              </div>
              <div className="flex flex-col gap-1">
                {legalMenuLinks.map((link) => (
                  <SheetLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    onClick={closeSheet}
                  />
                ))}
              </div>

              <hr className="my-4 border-slate-100" />

              {user ? (
                <button
                  onClick={() => {
                    logout();
                    closeSheet();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              ) : (
                <div className="ml-4 flex w-full flex-col items-start gap-2 ">
                  <Link href="/login" onClick={closeSheet}>
                    <button className="rounded-md border border-slate-800 px-9 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100">
                      Connexion
                    </button>
                  </Link>
                  <Link href="/register" onClick={closeSheet}>
                    <button className="rounded-md bg-blue-600 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700">
                      Créer un compte
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
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl justify-center px-4 py-5 text-center text-xs text-slate-500 sm:px-6">
          <span>© 2026 BanditPrice. Tous droits reserves.</span>
        </div>
      </div>
    </footer>
  );
}
