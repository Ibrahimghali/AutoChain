"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Car, Calendar, User, Shield, DollarSign, History, ExternalLink, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { useBlockchainError } from "@/hooks/use-blockchain-error"
import { useToast } from "@/hooks/use-toast"
import { formatEther } from "@/lib/web3"

interface CarOwnershipHistory {
  address: string
  timestamp: number
  transactionHash: string
}

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { account, isConnected, userRole } = useWeb3()
  const { getCarById, purchaseCar, isLoading } = useCars()
  const { handleError } = useBlockchainError()
  const { toast } = useToast()
  
  const [car, setCar] = useState<Car | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [carHistory, setCarHistory] = useState<CarOwnershipHistory[]>([])

  const carId = params.id as string

  useEffect(() => {
    if (carId) {
      loadCarDetails()
    }
  }, [carId])

  const loadCarDetails = async () => {
    try {
      setLoadingCar(true)
      const carData = await getCarById(BigInt(carId))
      
      if (!carData) {
        setCar(null)
        return
      }

      setCar(carData)
      
      // Simuler l'historique pour la démo (sera remplacé par la vraie fonction du contrat)
      const mockHistory: CarOwnershipHistory[] = [
        {
          address: carData.constructeur,
          timestamp: Date.now() - 86400000 * 365,
          transactionHash: "0xabc123...",
        },
        {
          address: carData.proprietaire,
          timestamp: Date.now() - 86400000 * 30,
          transactionHash: "0x789ghi...",
        },
      ]
      setCarHistory(mockHistory)
      
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
      handleError(error as Error)
      setCar(null)
    } finally {
      setLoadingCar(false)
    }
  }

  const handlePurchase = async () => {
    if (!car) return

    try {
      setPurchasing(true)
      await purchaseCar(car.id)
      
      toast({
        title: "Achat réussi !",
        description: `Vous êtes maintenant propriétaire de ${car.marque} ${car.modele}`,
      })

      // Rediriger vers le dashboard après achat
      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur lors de l'achat:", error)
      // L'erreur est déjà gérée par le hook useBlockchainError
    } finally {
      setPurchasing(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez-vous avec MetaMask pour voir les détails du véhicule.
          </p>
          <Button onClick={() => router.push("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  if (loadingCar || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Le véhicule avec l'ID #{carId} n'existe pas ou n'est pas accessible.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {car.brand} {car.model}
          </h1>
          <p className="text-muted-foreground">VIN: {car.vin}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image du véhicule */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <Car className="w-24 h-24 text-primary/40" />
              </div>
            </CardContent>
          </Card>

          {/* Détails techniques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Informations Certifiées
              </CardTitle>
              <CardDescription>Données vérifiées et certifiées par le constructeur sur la blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Année</p>
                  <p className="font-semibold">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Couleur</p>
                  <p className="font-semibold">{car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kilométrage</p>
                  <p className="font-semibold">{car.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={car.isForSale ? "default" : "secondary"}>
                    {car.isForSale ? "En vente" : "Non disponible"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Constructeur Certifié</p>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <code className="text-sm bg-muted px-2 py-1 rounded">{car.constructor}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historique des propriétaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Historique de Propriété
              </CardTitle>
              <CardDescription>Traçabilité complète et transparente de tous les propriétaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {car.owners.map((owner, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{owner.address}</code>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Constructeur
                          </Badge>
                        )}
                        {index === car.owners.length - 1 && (
                          <Badge variant="default" className="text-xs">
                            Propriétaire actuel
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(owner.timestamp).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <a
                            href={`https://etherscan.io/tx/${owner.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            Voir transaction
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Prix et achat */}
          {car.isForSale && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Prix de vente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{car.price} ETH</p>
                  <p className="text-sm text-muted-foreground">≈ $85,000 USD</p>
                </div>

                {isConnected && account !== car.currentOwner ? (
                  <Button className="w-full" size="lg" onClick={handlePurchase} disabled={purchasing}>
                    {purchasing ? "Achat en cours..." : "Acheter maintenant"}
                  </Button>
                ) : account === car.currentOwner ? (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Vous êtes le propriétaire de ce véhicule</p>
                  </div>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    Connectez votre wallet
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informations blockchain */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Blockchain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ID du véhicule</p>
                <p className="font-mono text-sm">#{car.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Propriétaire actuel</p>
                <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">{car.currentOwner}</code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre de propriétaires</p>
                <p className="font-semibold">{car.owners.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut de certification</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Certifié</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur Etherscan
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <History className="w-4 h-4 mr-2" />
                Rapport complet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
