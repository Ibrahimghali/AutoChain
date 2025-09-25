"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { formatEther, parseEther, shortenAddress, type Car } from "@/lib/web3"
import { ShoppingCart, CarIcon, AlertCircle, Search, History, Users, DollarSign, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BuyCarPage() {
  const { isConnected, userRole, account, connect, isLoading: web3Loading } = useWeb3()
  const { 
    carsForSale, 
    isLoading: carsLoading, 
    purchaseCar, 
    canBuyCar, 
    refreshAllData 
  } = useCars()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const filteredCars = carsForSale.filter((car) =>
    car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.id.toString().includes(searchTerm)
  )

  const isLoading = web3Loading || carsLoading

  const handlePurchase = async (car: Car) => {
    if (!canBuyCar(car)) {
      toast({
        title: "Achat impossible",
        description: "Vous ne pouvez pas acheter cette voiture",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    setSelectedCar(car)

    try {
      await purchaseCar(car.id, car.prix)
      
      toast({
        title: "Achat réussi !",
        description: `Félicitations ! Vous êtes maintenant propriétaire du ${car.marque} ${car.modele}`,
      })
    } catch (error) {
      console.error("Erreur lors de l'achat:", error)
      // L'erreur est déjà gérée par le hook useBlockchainError
    } finally {
      setIsPurchasing(false)
      setSelectedCar(null)
    }
  }

  const handleRefresh = async () => {
    await refreshAllData()
    toast({
      title: "Données actualisées",
      description: "La liste des voitures en vente a été mise à jour",
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
          currentPath="/buy-car"
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
            Connectez votre portefeuille MetaMask pour acheter des véhicules.
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
        currentPath="/buy-car"
        userRole={userRole}
        isConnected={isConnected}
        onConnectWallet={connect}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Acheter un véhicule</h1>
                <p className="text-muted-foreground">Découvrez les véhicules certifiés disponibles sur la blockchain</p>
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

          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par marque, modèle ou VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCars.length} véhicule{filteredCars.length > 1 ? 's' : ''} en vente
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-16 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cars Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const currentOwner = car.proprietaires[car.proprietaires.length - 1]
              const isOwnCar = currentOwner?.toLowerCase() === account?.toLowerCase()
              
              return (
                <Card key={car.id} className="car-card-hover border-border/50 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CarIcon className="w-6 h-6 text-primary" />
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
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        En vente
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Prix */}
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Prix</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatEther(car.prix)} ETH</div>
                        <div className="text-xs text-muted-foreground">
                          ≈ ${(Number.parseFloat(formatEther(car.prix)) * 2500).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Propriétaire actuel */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Propriétaire</span>
                      </div>
                      <span className="font-mono text-xs">
                        {shortenAddress(currentOwner)}
                        {isOwnCar && " (Vous)"}
                      </span>
                    </div>

                    {/* Historique */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Propriétaires</span>
                      </div>
                      <span className="font-medium">{car.proprietaires.length}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 pt-2">
                      <Button
                        onClick={() => handlePurchase(car)}
                        disabled={!canBuyCar(car) || isPurchasing}
                        className="w-full flex items-center space-x-2"
                        variant={canBuyCar(car) ? "default" : "secondary"}
                      >
                        {isPurchasing && selectedCar?.id === car.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            <span>Achat en cours...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>
                              {isOwnCar 
                                ? "Votre voiture" 
                                : canBuyCar(car) 
                                  ? "Acheter maintenant" 
                                  : "Non disponible"
                              }
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCars.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche."
                : "Il n'y a pas de véhicules disponibles à l'achat pour le moment."}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser la liste
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
