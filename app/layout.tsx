import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PwaRegister } from "@/components/pwa-register";
import { WelcomeTrigger } from "@/components/pwa/WelcomeTrigger";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Costra",
  description:
    "Comparez les prix les moins chers sur des articles en magasin ou des pièces automobiles au Canada. Trouvez les meilleures offres en un clic.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Costra",
  },
  icons: [
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "icon", url: "/icon-192x192.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#1c7bcd",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <PwaRegister />
          <WelcomeTrigger />
          {children}
        </Providers>

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
