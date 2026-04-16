"use client";

import { AuthProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
