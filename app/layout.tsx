import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default: "EasyPrice - Comparez les prix les moins chers au Canada",
    template: "%s | EasyPrice",
  },
  description:
    "Comparez les prix les moins chers sur des articles en magasin ou des pièces automobiles au Canada. Trouvez les meilleures offres en un clic.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EasyPrice",
  },
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
      {/* <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head> */}
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
