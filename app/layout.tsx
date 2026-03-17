import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: 'IronWorks Auto | Repair & Parts',
    template: '%s | IronWorks Auto',
  },
  description: 'Professional auto repair services and premium parts. Book your service online or shop our catalog.',
}

export const viewport: Viewport = {
  themeColor: '#1a1a1f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
