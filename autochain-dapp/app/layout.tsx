import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/toast-provider"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AutoChain - Blockchain Car Trading Platform",
  description:
    "Révolutionnez la vente de véhicules avec la blockchain. Traçabilité complète, certification constructeur, et transactions sécurisées.",
  generator: "AutoChain DApp",
  keywords: ["blockchain", "voiture", "automobile", "NFT", "Ethereum", "MetaMask", "traçabilité"],
  authors: [{ name: "AutoChain Team" }],
  openGraph: {
    title: "AutoChain - Plateforme de Vente Automobile sur Blockchain",
    description:
      "Révolutionnez la vente de véhicules avec la blockchain. Traçabilité complète et transactions sécurisées.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoChain - Blockchain Car Trading",
    description: "Plateforme décentralisée pour la vente de véhicules avec traçabilité blockchain",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
          <ToastProvider />
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
