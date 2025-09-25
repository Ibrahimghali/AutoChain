"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { CarCard } from "@/components/car-card"
import { StatsOverview } from "@/components/stats-overview"
import { ConstructorHeader } from "@/components/constructor-header" // Added constructor header import
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { Search, Plus, CarIcon, ShoppingCart } from "lucide-react"

export default function DashboardPage() {
  const { isConnected, account, userRole, connect, isLoading: web3Loading, error } = useWeb3()
  const { cars, userCars, carsForSale, isLoading: carsLoading, error: carsError } = useCars()

  const [filteredCars, setFilteredCars] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "for-sale" | "owned">("all")

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
      filtered = carsForSale
    } else if (filterStatus === "owned" && account) {
      filtered = userCars
    }

    setFilteredCars(filtered)
  }, [searchTerm, filterStatus, cars, carsForSale, userCars, account])

  const isLoading = web3Loading || carsLoading

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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/dashboard" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">
            Connectez votre portefeuille MetaMask pour accéder au tableau de bord AutoChain.
          </p>
          <Button onClick={connect} size="lg" className="glow-effect">
            Connecter MetaMask
          </Button>
        </div>
      </div>
    )
  }

  if (error || carsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/dashboard" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarIcon className="w-8 h-8 text-destructive" />
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
      <Navigation currentPath="/dashboard" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === "constructor" && <ConstructorHeader />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-balance mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bienvenue {userRole === "constructor" && "Constructeur"}
                {userRole === "user" && "Utilisateur"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              {userRole === "constructor" && (
                <Button asChild className="flex items-center space-x-2">
                  <a href="/create-car">
                    <Plus className="w-4 h-4" />
                    <span>Créer véhicule</span>
                  </a>
                </Button>
              )}
              <Button variant="outline" asChild className="flex items-center space-x-2 bg-transparent">
                <a href="/sell-car">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Vendre</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview userRole={userRole} cars={cars} userAccount={account} />
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
                Tous ({cars.length})
              </Button>
              <Button
                variant={filterStatus === "for-sale" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("for-sale")}
              >
                En vente ({carsForSale.length})
              </Button>
              <Button
                variant={filterStatus === "owned" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("owned")}
              >
                Mes véhicules ({userCars.length})
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
              userRole={userRole}
              userAccount={account}
              onAction={(action, carId) => {
                console.log(`Action ${action} sur véhicule ${carId}`)
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
            {userRole === "constructor" && (
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
