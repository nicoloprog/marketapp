"use client";

import { AuthProvider } from "@/lib/store";
import { GoogleTranslateDomGuard } from "@/components/google-translate-dom-guard";
import { LocationCookieBanner } from "@/components/location-cookie-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GoogleTranslateDomGuard />
      {children}
      <LocationCookieBanner />
    </AuthProvider>
  );
}
