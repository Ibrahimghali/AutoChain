"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Car, Shield } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"

export function WalletConnect() {
  const { account, isConstructor, isConnected, isLoading, error, connectWallet, disconnect } = useWeb3()

  if (isConnected && account) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Portefeuille connecté
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-mono text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConstructor ? "default" : "secondary"} className="flex items-center gap-1">
              {isConstructor ? <Shield className="h-3 w-3" /> : <Car className="h-3 w-3" />}
              {isConstructor ? "Constructeur" : "Utilisateur"}
            </Badge>
          </div>
          <Button variant="outline" onClick={disconnect} className="w-full bg-transparent">
            Déconnecter
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Car className="h-6 w-6" />
          AutoChain
        </CardTitle>
        <CardDescription>Plateforme décentralisée de vente de véhicules avec traçabilité blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Certification constructeur</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span>Historique complet des véhicules</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Transactions sécurisées</span>
          </div>
        </div>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <Button onClick={connectWallet} disabled={isLoading} className="w-full">
          {isLoading ? "Connexion..." : "Se connecter avec MetaMask"}
        </Button>
      </CardContent>
    </Card>
  )
}
