"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Navigation } from "@/components/navigation"
import { BlockchainStatus } from "@/components/blockchain-status"
import { EventsFeed } from "@/components/events-feed"
import { CarCard } from "@/components/car-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useWeb3 } from "@/hooks/use-web3"
import { useAutoChain } from "@/hooks/use-autochain"
import { useToast } from "@/hooks/use-toast"
import { formatEther, type Car } from "@/lib/web3"
import { ShoppingCart, CarIcon, AlertCircle, Search, History, Users, DollarSign, Loader2, Wallet } from "lucide-react"
import Link from "next/link"

export default function BuyCarPage() {
  const { toast } = useToast()
  const { isConnected, account, userRole, connect } = useWeb3()
  const { 
    service, 
    carsForSale, 
    isLoading, 
    refreshCarsForSale, 
    refreshUserData, 
    canBuyCar 
  } = useAutoChain()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Filtrer les voitures selon la recherche
  const filteredCars = carsForSale.filter(
    (car) =>
      car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePurchaseClick = (car: Car) => {
    if (!canBuyCar(car)) {
      toast({
        title: "Impossible d'acheter",
        description: "Vous ne pouvez pas acheter votre propre véhicule ou un véhicule non en vente.",
        variant: "destructive",
      })
      return
    }
    
    setSelectedCar(car)
    setShowConfirmDialog(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedCar || !service) return

    setIsPurchasing(true)
    setShowConfirmDialog(false)

    try {
      const result = await service.buyCar(selectedCar.id, selectedCar.prix)
      
      if (result.success) {
        toast({
          title: "Achat réussi !",
          description: `Vous êtes maintenant propriétaire du véhicule ${selectedCar.marque} ${selectedCar.modele}`,
        })
        
        // Rafraîchir les données
        await Promise.all([
          refreshCarsForSale(),
          refreshUserData()
        ])
      } else {
        toast({
          title: "Erreur d'achat",
          description: result.error || "Une erreur est survenue lors de l'achat",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      toast({
        title: "Erreur d'achat",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
      setSelectedCar(null)
    }
  }

  // Affichage en cas de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Affichage si non connecté
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez votre portefeuille MetaMask pour acheter des véhicules.
          </p>
          <Button onClick={connect} size="lg" className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Connecter MetaMask</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlockchainStatus isConnected={isConnected} account={account} userRole={userRole} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Acheter un véhicule</h1>
                  <p className="text-muted-foreground">
                    Découvrez les {carsForSale.length} véhicules certifiés disponibles
                  </p>
                </div>
              </div>

              {/* Barre de recherche */}
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

            {/* Grille des véhicules */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          <CardDescription className="font-mono text-xs">
                            VIN: {car.vin.slice(0, 8)}...
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
                          ≈ ${(parseFloat(formatEther(car.prix)) * 2500).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Propriétaires */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Propriétaires</span>
                      </div>
                      <span className="font-medium">{car.proprietaires.length}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 flex items-center space-x-2"
                          asChild
                        >
                          <Link href={`/car/${car.id}`}>
                            <History className="w-4 h-4" />
                            <span>Historique</span>
                          </Link>
                        </Button>
                      </div>

                      <Button
                        onClick={() => handlePurchaseClick(car)}
                        disabled={
                          !canBuyCar(car) || 
                          (isPurchasing && selectedCar?.id === car.id)
                        }
                        className="w-full flex items-center space-x-2 glow-effect"
                      >
                        {isPurchasing && selectedCar?.id === car.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Achat en cours...</span>
                          </>
                        ) : !canBuyCar(car) ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>Non disponible</span>
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

            {/* État vide */}
            {filteredCars.length === 0 && (
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
                {!searchTerm && (
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Retour au tableau de bord</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar avec les événements */}
          <div className="lg:col-span-1">
            <EventsFeed maxEvents={8} />
          </div>
        </div>
      </div>

      {/* Dialog de confirmation d'achat */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'acheter ce véhicule. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCar && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Véhicule</span>
                  <span className="font-medium">{selectedCar.marque} {selectedCar.modele}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">VIN</span>
                  <span className="font-mono text-sm">{selectedCar.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prix</span>
                  <span className="font-bold text-lg">{formatEther(selectedCar.prix)} ETH</span>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cette transaction sera enregistrée de manière permanente sur la blockchain Ethereum.
                  Assurez-vous d'avoir suffisamment d'ETH pour couvrir le prix et les frais de gas.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmPurchase} 
              disabled={isPurchasing}
              className="flex items-center space-x-2"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Achat en cours...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Confirmer l'achat</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
