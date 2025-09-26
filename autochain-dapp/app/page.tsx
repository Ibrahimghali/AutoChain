"use client"

import { WalletConnect } from "@/components/wallet-connect"
import { Dashboard } from "@/components/dashboard"
import { useWeb3 } from "@/hooks/use-web3"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const { isConnected } = useWeb3()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {isConnected ? (
          <Dashboard />
        ) : (
          <div className="flex items-center justify-center min-h-[80vh]">
            <WalletConnect />
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
