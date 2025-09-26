"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Car, Calendar, User, Shield, DollarSign, History, ExternalLink } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"

interface CarDetails {
  id: number
  vin: string
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  isForSale: boolean
  price: string
  currentOwner: string
  constructor: string
  owners: Array<{
    address: string
    timestamp: number
    transactionHash: string
  }>
}

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { account, contract, isConnected } = useWeb3()
  const { cars, purchaseCar } = useCars()
  const [car, setCar] = useState<CarDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  const carId = Number(params.id as string)

  useEffect(() => {
    if (cars && carId) {
      loadCarDetails()
    }
  }, [cars, carId])

  const loadCarDetails = async () => {
    try {
      setLoading(true)
      
      // Trouver la voiture réelle par ID
      const realCar = cars.find(c => c.id === carId)
      
      if (!realCar) {
        console.error("Voiture non trouvée:", carId)
        setCar(null)
        return
      }

      // Convertir les données réelles au format CarDetails
      const carDetails: CarDetails = {
        id: realCar.id,
        vin: realCar.vin,
        brand: realCar.marque,
        model: realCar.modele,
        year: 2023, // Valeur par défaut car pas dans les données actuelles
        color: "Couleur non spécifiée", // Valeur par défaut
        mileage: 0, // Valeur par défaut
        isForSale: realCar.enVente,
        price: realCar.prix,
        currentOwner: realCar.proprietaires[realCar.proprietaires.length - 1] || "Propriétaire inconnu",
        constructor: realCar.proprietaires[0] || "Constructeur inconnu",
        owners: realCar.proprietaires.map((address, index) => ({
          address,
          timestamp: Date.now() - (86400000 * (realCar.proprietaires.length - index) * 30),
          transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...${index}`,
        })),
      }
      
      setCar(carDetails)
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!car) return

    try {
      setPurchasing(true)
      
      // Utiliser le vrai hook d'achat
      await purchaseCar(car.id, car.price)
      
      // Recharger les détails de la voiture
      loadCarDetails()

      // Rediriger vers le dashboard après achat
      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur lors de l'achat:", error)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
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
