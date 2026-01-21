import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { cn } from "@/lib/utils" // Recommended for merging tailwind classes
import './globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Docmobi Admin Dashboard',
  description: 'Healthcare management admin dashboard',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png', // Default icon
    shortcut: '/logo.png',
    apple: '/logo.png',
    // Custom media query icon as per your snippet
    other: [
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: light)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}