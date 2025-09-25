

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/lib/auth_context"
import { CartProvider } from "@/lib/cart_context"

export const metadata: Metadata = {
  title: "KRD Hair Exports - Premium Human Hair Worldwide",
  description:
    "Leading exporter of premium virgin human hair, closures, frontals and hair extensions. Wholesale and bulk orders worldwide.",
  generator: "v0.app",
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.className}`}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
