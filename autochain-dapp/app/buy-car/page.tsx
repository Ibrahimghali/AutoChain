"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { formatEther } from "@/lib/web3"
import { ShoppingCart, CarIcon, AlertCircle, Search, History, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BuyCarPage() {
  const { isConnected, account, userRole, connect, isLoading: web3Loading, error } = useWeb3()
  const { carsForSale, purchaseCar, isLoading: carsLoading, error: carsError } = useCars()
  const { toast } = useToast()

  const [isPurchasing, setIsPurchasing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null)

  const filteredCars = carsForSale.filter(
    (car) =>
      car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePurchase = async (car: any) => {
    if (!car.prix || car.prix === "0") {
      toast({
        title: "Erreur",
        description: "Prix invalide pour ce véhicule",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    setSelectedCarId(car.id)

    try {
      await purchaseCar(car.id, car.prix)

      toast({
        title: "Achat réussi !",
        description: `Félicitations ! Vous êtes maintenant propriétaire du ${car.marque} ${car.modele} !`,
      })
    } catch (error: any) {
      console.error("Erreur lors de l'achat:", error)
      toast({
        title: "Erreur lors de l'achat",
        description: error.message || "Une erreur est survenue lors de l'achat",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
      setSelectedCarId(null)
    }
  }

  const isLoading = web3Loading || carsLoading

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
        <Navigation currentPath="/buy-car" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />
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

  if (error || carsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/buy-car" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Erreur de connexion blockchain</h1>
          <p className="text-muted-foreground mb-8">{error || carsError}</p>
          <Button onClick={() => window.location.reload()} size="lg">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/buy-car" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Acheter un véhicule</h1>
              <p className="text-muted-foreground">
                Découvrez les véhicules certifiés disponibles ({carsForSale.length} en vente)
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par marque, modèle ou VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
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
                      <CardDescription className="font-mono text-xs">VIN: {car.vin.slice(0, 8)}...</CardDescription>
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

                {/* Propriétaires */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Propriétaires</span>
                  </div>
                  <span className="font-medium">{car.proprietaires?.length || 0}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 pt-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center space-x-2 bg-transparent"
                      asChild
                    >
                      <a href={`/car/${car.id}`}>
                        <History className="w-4 h-4" />
                        <span>Historique</span>
                      </a>
                    </Button>
                  </div>

                  <Button
                    onClick={() => handlePurchase(car)}
                    disabled={isPurchasing && selectedCarId === car.id}
                    className="w-full flex items-center space-x-2 glow-effect"
                  >
                    {isPurchasing && selectedCarId === car.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Achat en cours...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Acheter maintenant</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche."
                : "Il n'y a pas de véhicules disponibles à l'achat pour le moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
