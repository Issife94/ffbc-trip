import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppFrame } from "@/components/app-frame"
import './globals.css'

const cairo = Cairo({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo"
});

export const metadata: Metadata = {
  title: 'FFBC Trip - Récapitulatif de réservation',
  description: 'Récapitulatif de votre réservation de voyage',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-[#FAFDFD]`}>
        <AppFrame>{children}</AppFrame>
        <Analytics />
      </body>
    </html>
  )
}
