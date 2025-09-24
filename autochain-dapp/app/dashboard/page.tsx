"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { CarCard } from "@/components/car-card"
import { StatsOverview } from "@/components/stats-overview"
import { connectWallet, type Web3State, type Car } from "@/lib/web3"
import { Search, Plus, CarIcon, ShoppingCart } from "lucide-react"

export default function DashboardPage() {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    userRole: null,
    contract: null,
    web3: null,
  })
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "for-sale" | "owned">("all")
  const [isLoading, setIsLoading] = useState(true)

  // Données de démonstration
  const mockCars: Car[] = [
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
      id: 2,
      vin: "2HGBH41JXMN109187",
      marque: "BMW",
      modele: "i8",
      enVente: false,
      prix: "0",
      proprietaires: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"],
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

  useEffect(() => {
    // Simuler la connexion automatique si MetaMask est déjà connecté
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
    setCars(mockCars)
    setFilteredCars(mockCars)
  }, [])

  useEffect(() => {
    let filtered = cars

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (car) =>
          car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.vin.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrer par statut
    if (filterStatus === "for-sale") {
      filtered = filtered.filter((car) => car.enVente)
    } else if (filterStatus === "owned" && web3State.account) {
      filtered = filtered.filter(
        (car) => car.proprietaires[car.proprietaires.length - 1]?.toLowerCase() === web3State.account?.toLowerCase(),
      )
    }

    setFilteredCars(filtered)
  }, [searchTerm, filterStatus, cars, web3State.account])

  const handleConnectWallet = async () => {
    try {
      const newState = await connectWallet()
      setWeb3State(newState)
    } catch (error) {
      console.error("Erreur de connexion:", error)
      alert("Erreur de connexion à MetaMask")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!web3State.isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          currentPath="/dashboard"
          userRole={web3State.userRole}
          isConnected={web3State.isConnected}
          onConnectWallet={handleConnectWallet}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez votre portefeuille MetaMask pour accéder au tableau de bord AutoChain.
          </p>
          <Button onClick={handleConnectWallet} size="lg" className="glow-effect">
            Connecter MetaMask
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPath="/dashboard"
        userRole={web3State.userRole}
        isConnected={web3State.isConnected}
        onConnectWallet={handleConnectWallet}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-balance mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bienvenue {web3State.userRole === "constructor" && "Constructeur"}
                {web3State.userRole === "seller" && "Vendeur"}
                {web3State.userRole === "buyer" && "Acheteur"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              {web3State.userRole === "constructor" && (
                <Button asChild className="flex items-center space-x-2">
                  <a href="/create-car">
                    <Plus className="w-4 h-4" />
                    <span>Créer véhicule</span>
                  </a>
                </Button>
              )}
              {(web3State.userRole === "seller" || web3State.userRole === "constructor") && (
                <Button variant="outline" asChild className="flex items-center space-x-2 bg-transparent">
                  <a href="/sell-car">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Vendre</span>
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview userRole={web3State.userRole} cars={cars} userAccount={web3State.account} />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par marque, modèle ou VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Tous
              </Button>
              <Button
                variant={filterStatus === "for-sale" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("for-sale")}
              >
                En vente
              </Button>
              <Button
                variant={filterStatus === "owned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("owned")}
              >
                Mes véhicules
              </Button>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              userRole={web3State.userRole}
              userAccount={web3State.account}
              onAction={(action, carId) => {
                console.log(`Action ${action} sur véhicule ${carId}`)
                // Ici, on appellerait les fonctions du smart contract
              }}
            />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CarIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Essayez de modifier vos critères de recherche."
                : "Il n'y a pas encore de véhicules disponibles."}
            </p>
            {web3State.userRole === "constructor" && (
              <Button asChild>
                <a href="/create-car">Créer le premier véhicule</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
