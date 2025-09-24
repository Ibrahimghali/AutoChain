"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/lib/web3"
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

interface BlockchainStatusProps {
  isConnected: boolean
  account: string | null
  userRole: "constructor" | "seller" | "buyer" | null
  error?: string | null
  onConnect?: () => void
}

export function BlockchainStatus({ isConnected, account, userRole, error, onConnect }: BlockchainStatusProps) {
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "constructor":
        return "default"
      case "seller":
        return "secondary"
      case "buyer":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "constructor":
        return "Constructeur Certifié"
      case "seller":
        return "Vendeur"
      case "buyer":
        return "Acheteur"
      default:
        return "Non défini"
    }
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">Erreur Blockchain</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {onConnect && (
            <Button onClick={onConnect} variant="outline" size="sm">
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Portefeuille Non Connecté</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connectez votre portefeuille MetaMask pour interagir avec la blockchain.
          </p>
          {onConnect && (
            <Button onClick={onConnect} size="sm" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Connecter MetaMask</span>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Connecté à la Blockchain</CardTitle>
          </div>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Adresse</span>
          <div className="flex items-center space-x-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {account ? shortenAddress(account) : "N/A"}
            </code>
            {account && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rôle</span>
          <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
            {getRoleLabel(userRole)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Réseau</span>
          <span className="text-sm font-medium">Ethereum Mainnet</span>
        </div>
      </CardContent>
    </Card>
  )
}
