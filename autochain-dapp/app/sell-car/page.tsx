"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { connectWallet, type Web3State, type Car, parseEther } from "@/lib/web3"
import { DollarSign, CarIcon, AlertCircle, TrendingUp } from "lucide-react"

export default function SellCarPage() {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    userRole: null,
    contract: null,
    web3: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [price, setPrice] = useState("")
  const [priceError, setPriceError] = useState("")

  // Données de démonstration - véhicules possédés par l'utilisateur
  const mockOwnedCars: Car[] = [
    {
      id: 2,
      vin: "2HGBH41JXMN109187",
      marque: "BMW",
      modele: "i8",
      enVente: false,
      prix: "0",
      proprietaires: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"],
    },
    {
      id: 5,
      vin: "5HGBH41JXMN109190",
      marque: "Porsche",
      modele: "Taycan",
      enVente: false,
      prix: "0",
      proprietaires: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"],
    },
  ]

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const state = await connectWallet()
            setWeb3State(state)
          }
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWeb3()
  }, [])

  const handleConnectWallet = async () => {
    try {
      const newState = await connectWallet()
      setWeb3State(newState)
    } catch (error) {
      console.error("Erreur de connexion:", error)
      alert("Erreur de connexion à MetaMask")
    }
  }

  const validatePrice = (value: string) => {
    if (!value.trim()) {
      setPriceError("Le prix est requis")
      return false
    }

    const numPrice = Number.parseFloat(value)
    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setPriceError("Le prix doit être supérieur à 0")
      return false
    }

    if (numPrice > 1000) {
      setPriceError("Le prix semble trop élevé")
      return false
    }

    setPriceError("")
    return true
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (priceError) {
      validatePrice(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCar || !validatePrice(price)) {
      return
    }

    setIsSubmitting(true)

    try {
      // Ici, on appellerait la fonction putCarForSale du smart contract
      console.log("Mise en vente du véhicule:", {
        carId: selectedCar.id,
        price: parseEther(price),
      })

      // Simulation d'un appel au contrat
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert(`Véhicule ${selectedCar.marque} ${selectedCar.modele} mis en vente pour ${price} ETH !`)

      // Réinitialiser le formulaire
      setSelectedCar(null)
      setPrice("")
    } catch (error) {
      console.error("Erreur lors de la mise en vente:", error)
      alert("Erreur lors de la mise en vente")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!web3State.isConnected || !web3State.userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          currentPath="/sell-car"
          userRole={web3State.userRole}
          isConnected={web3State.isConnected}
          onConnectWallet={handleConnectWallet}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez-vous avec MetaMask pour vendre vos véhicules sur la blockchain.
          </p>
          {!web3State.isConnected && (
            <Button onClick={handleConnectWallet} size="lg">
              Connecter MetaMask
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPath="/sell-car"
        userRole={web3State.userRole}
        isConnected={web3State.isConnected}
        onConnectWallet={handleConnectWallet}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mettre en vente</h1>
              <p className="text-muted-foreground">Vendez vos véhicules sur la blockchain</p>
            </div>
          </div>

          <Card className="bg-accent/5 border-accent/20 mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg">Vente sécurisée</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Les transactions sont sécurisées par smart contract. Le paiement est automatiquement transféré lors de
                l'achat, et la propriété est immédiatement transférée à l'acheteur.
              </p>
            </CardContent>
          </Card>
        </div>

        {!selectedCar ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sélectionnez un véhicule à vendre</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mockOwnedCars.map((car) => (
                <Card
                  key={car.id}
                  className="car-card-hover cursor-pointer border-border/50"
                  onClick={() => setSelectedCar(car)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {car.marque} {car.modele}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">VIN: {car.vin.slice(0, 8)}...</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Privé</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Sélectionner
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {mockOwnedCars.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun véhicule disponible</h3>
                <p className="text-muted-foreground">Vous ne possédez aucun véhicule disponible à la vente.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Véhicule sélectionné</CardTitle>
                <CardDescription>Définissez le prix de vente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedCar.marque} {selectedCar.modele}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono">VIN: {selectedCar.vin}</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCar(null)}>
                    Changer
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix de vente (ETH) *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0"
                      value={price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="45.000"
                      className={priceError ? "border-destructive" : ""}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      ETH
                    </div>
                  </div>
                  {priceError && <p className="text-sm text-destructive">{priceError}</p>}
                  {price && !priceError && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ${(Number.parseFloat(price) * 2500).toLocaleString()} USD
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => setSelectedCar(null)}>
                Retour
              </Button>
              <Button type="submit" disabled={isSubmitting || !!priceError} className="flex items-center space-x-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Mise en vente...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span>Mettre en vente</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
