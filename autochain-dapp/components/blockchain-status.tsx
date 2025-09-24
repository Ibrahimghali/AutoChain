"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { shortenAddress, getCurrentNetwork, getBalance } from "@/lib/web3"
import { useWeb3 } from "@/hooks/use-web3"
import { Wallet, AlertCircle, CheckCircle, ExternalLink, Copy, Network } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BlockchainStatusProps {
  isConnected: boolean
  account: string | null
  userRole?: "constructor" | "user" | null
  error?: string | null
  onConnect?: () => void
}

export function BlockchainStatus({ isConnected, account, userRole, error, onConnect }: BlockchainStatusProps) {
  const { toast } = useToast()
  const { web3 } = useWeb3()
  const [networkInfo, setNetworkInfo] = useState<{ chainId: number; name: string; isSupported: boolean } | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Charger les informations du réseau
  useEffect(() => {
    const loadNetworkInfo = async () => {
      try {
        const info = await getCurrentNetwork()
        setNetworkInfo(info)
      } catch (error) {
        console.error("Erreur lors du chargement du réseau:", error)
      }
    }

    if (isConnected) {
      loadNetworkInfo()
    }
  }, [isConnected])

  // Charger le solde du compte
  useEffect(() => {
    const loadBalance = async () => {
      if (!web3 || !account) return

      try {
        setIsLoadingBalance(true)
        const balance = await getBalance(web3, account)
        setBalance(balance)
      } catch (error) {
        console.error("Erreur lors du chargement du solde:", error)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    if (isConnected && web3 && account) {
      loadBalance()
    }
  }, [isConnected, web3, account])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copié",
        description: "Adresse copiée dans le presse-papiers",
      })
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }
  const getRoleBadgeVariant = (role: string | null | undefined) => {
    switch (role) {
      case "constructor":
        return "default"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string | null | undefined) => {
    switch (role) {
      case "constructor":
        return "Constructeur Certifié"
      case "user":
        return "Utilisateur"
      default:
        return "Utilisateur"
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
    <Card className={`border-primary/50 ${networkInfo?.isSupported ? 'bg-primary/5' : 'bg-yellow-50 border-yellow-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {networkInfo?.isSupported ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <CardTitle className="text-lg">
              {networkInfo?.isSupported ? "Connecté à la Blockchain" : "Réseau non supporté"}
            </CardTitle>
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
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(account)}
                  className="h-6 w-6 p-0"
                  title="Copier l'adresse"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const explorerUrl = networkInfo?.chainId === 1337 
                      ? `#` // Pas d'explorateur pour Ganache local
                      : `https://etherscan.io/address/${account}`
                    if (networkInfo?.chainId !== 1337) {
                      window.open(explorerUrl, "_blank")
                    }
                  }}
                  className="h-6 w-6 p-0"
                  title="Voir sur l'explorateur"
                  disabled={networkInfo?.chainId === 1337}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Solde</span>
          <div className="flex items-center space-x-1">
            {isLoadingBalance ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-sm font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
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
          <div className="flex items-center space-x-2">
            <Network className="w-3 h-3 text-muted-foreground" />
            <span className={`text-sm font-medium ${networkInfo?.isSupported ? '' : 'text-yellow-600'}`}>
              {networkInfo?.name || "Chargement..."}
            </span>
            {networkInfo && !networkInfo.isSupported && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                Non supporté
              </Badge>
            )}
          </div>
        </div>

        {networkInfo && !networkInfo.isSupported && (
          <div className="pt-2 border-t border-yellow-200">
            <p className="text-xs text-yellow-700 mb-2">
              Ce réseau n'est pas supporté. Veuillez vous connecter à Ganache Local ou Sepolia Testnet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
