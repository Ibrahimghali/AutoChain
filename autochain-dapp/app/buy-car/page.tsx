"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { connectWallet, type Web3State, type Car, formatEther } from "@/lib/web3"
import { ShoppingCart, CarIcon, AlertCircle, Search, History, Users, DollarSign } from "lucide-react"

export default function BuyCarPage() {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    userRole: null,
    contract: null,
    web3: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)

  // Données de démonstration - véhicules en vente
  const mockCarsForSale: Car[] = [
    {
      id: 1,
      vin: "1HGBH41JXMN109186",
      marque: "Tesla",
      modele: "Model S",
      enVente: true,
      prix: "45000000000000000000000", // 45 ETH en Wei
      proprietaires: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4", "0x8ba1f109551bD432803012645Hac189451c4"],
    },
    {
      id: 3,
      vin: "3HGBH41JXMN109188",
      marque: "Audi",
      modele: "e-tron GT",
      enVente: true,
      prix: "38000000000000000000000", // 38 ETH en Wei
      proprietaires: ["0x8ba1f109551bD432803012645Hac189451c4"],
    },
    {
      id: 4,
      vin: "4HGBH41JXMN109189",
      marque: "Mercedes",
      modele: "EQS",
      enVente: true,
      prix: "52000000000000000000000", // 52 ETH en Wei
      proprietaires: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4", "0x9ca2f209661cE532814023756Iac289562d5"],
    },
  ]

  const filteredCars = mockCarsForSale.filter(
    (car) =>
      car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handlePurchase = async (car: Car) => {
    setIsPurchasing(true)
    setSelectedCar(car)

    try {
      // Ici, on appellerait la fonction buyCar du smart contract
      console.log("Achat du véhicule:", {
        carId: car.id,
        price: car.prix,
      })

      // Simulation d'un appel au contrat
      await new Promise((resolve) => setTimeout(resolve, 3000))

      alert(`Félicitations ! Vous êtes maintenant propriétaire du ${car.marque} ${car.modele} !`)
    } catch (error) {
      console.error("Erreur lors de l'achat:", error)
      alert("Erreur lors de l'achat")
    } finally {
      setIsPurchasing(false)
      setSelectedCar(null)
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

  if (!web3State.isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          currentPath="/buy-car"
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
            Connectez votre portefeuille MetaMask pour acheter des véhicules.
          </p>
          <Button onClick={handleConnectWallet} size="lg">
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
        userRole={web3State.userRole}
        isConnected={web3State.isConnected}
        onConnectWallet={handleConnectWallet}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Acheter un véhicule</h1>
              <p className="text-muted-foreground">Découvrez les véhicules certifiés disponibles</p>
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
                  <span className="font-medium">{car.proprietaires.length}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 pt-2">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 flex items-center space-x-2 bg-transparent">
                      <History className="w-4 h-4" />
                      <span>Historique</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => handlePurchase(car)}
                    disabled={isPurchasing && selectedCar?.id === car.id}
                    className="w-full flex items-center space-x-2 glow-effect"
                  >
                    {isPurchasing && selectedCar?.id === car.id ? (
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
