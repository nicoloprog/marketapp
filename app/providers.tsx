"use client";

import { AuthProvider } from "@/lib/store";
import { LocationCookieBanner } from "@/components/location-cookie-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <LocationCookieBanner />
    </AuthProvider>
  );
}
