"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { formatEther, shortenAddress, type Car } from "@/lib/web3"
import { DollarSign, CarIcon, AlertCircle, TrendingUp, RefreshCw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SellCarPage() {
  const { isConnected, userRole, account, connect, isLoading: web3Loading } = useWeb3()
  const { 
    userCars, 
    isLoading: carsLoading, 
    sellCar, 
    cancelCarSale,
    canSellCar, 
    canCancelSale,
    refreshAllData 
  } = useCars()
  const { toast } = useToast()

  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [price, setPrice] = useState("")
  const [priceError, setPriceError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoading = web3Loading || carsLoading

  // Séparer les voitures par statut
  const availableCars = userCars.filter(car => !car.enVente)
  const carsForSale = userCars.filter(car => car.enVente)

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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCar || !validatePrice(price)) {
      return
    }

    setIsSubmitting(true)

    try {
      await sellCar(selectedCar.id, price)
      
      toast({
        title: "Mise en vente réussie !",
        description: `Votre ${selectedCar.marque} ${selectedCar.modele} est maintenant en vente pour ${price} ETH`,
      })

      // Réinitialiser le formulaire
      setSelectedCar(null)
      setPrice("")
    } catch (error) {
      console.error("Erreur lors de la mise en vente:", error)
      // L'erreur est déjà gérée par le hook useBlockchainError
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSale = async (car: Car) => {
    try {
      await cancelCarSale(car.id)
      
      toast({
        title: "Vente annulée",
        description: `La vente de votre ${car.marque} ${car.modele} a été annulée`,
      })
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error)
      // L'erreur est déjà gérée par le hook useBlockchainError
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (value) {
      validatePrice(value)
    } else {
      setPriceError("")
    }
  }

  const handleRefresh = async () => {
    await refreshAllData()
    toast({
      title: "Données actualisées",
      description: "Vos véhicules ont été mis à jour",
    })
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          currentPath="/sell-car"
          userRole={userRole}
          isConnected={isConnected}
          onConnectWallet={connect}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez-vous with MetaMask pour vendre vos véhicules sur la blockchain.
          </p>
          <Button onClick={connect} size="lg">
            Connecter MetaMask
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPath="/sell-car"
        userRole={userRole}
        isConnected={isConnected}
        onConnectWallet={connect}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes véhicules</h1>
                <p className="text-muted-foreground">Gérez la vente de vos véhicules sur la blockchain</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
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
          <div className="space-y-8">
            {/* Voitures en vente */}
            {carsForSale.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <span>Véhicules en vente</span>
                  <Badge variant="secondary">{carsForSale.length}</Badge>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carsForSale.map((car) => (
                    <Card key={car.id} className="border-accent/20">
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
                              <CardDescription className="font-mono text-xs">ID: {car.id}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            En vente
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <span className="text-sm font-medium">Prix</span>
                          <span className="font-bold">{formatEther(car.prix)} ETH</span>
                        </div>
                        <Button
                          onClick={() => handleCancelSale(car)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={!canCancelSale(car)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler la vente
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Voitures disponibles pour la vente */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <span>Disponibles pour la vente</span>
                <Badge variant="secondary">{availableCars.length}</Badge>
              </h2>
              
              {availableCars.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCars.map((car) => (
                    <Card
                      key={car.id}
                      className="car-card-hover cursor-pointer border-border/50"
                      onClick={() => canSellCar(car) ? setSelectedCar(car) : null}
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
                              <CardDescription className="font-mono text-xs">
                                ID: {car.id} • VIN: {car.vin.slice(0, 8)}...
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">Privé</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-transparent"
                          disabled={!canSellCar(car)}
                        >
                          {canSellCar(car) ? "Mettre en vente" : "Non disponible"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <CarIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun véhicule disponible</h3>
                  <p className="text-muted-foreground">
                    {userCars.length === 0 
                      ? "Vous ne possédez aucun véhicule." 
                      : "Tous vos véhicules sont déjà en vente."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mettre en vente</CardTitle>
                <CardDescription>Définissez le prix de vente pour votre véhicule</CardDescription>
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
                      <p className="text-sm text-muted-foreground font-mono">
                        ID: {selectedCar.id} • VIN: {selectedCar.vin}
                      </p>
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
