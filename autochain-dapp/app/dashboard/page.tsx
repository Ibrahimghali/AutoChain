"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { StatsOverview } from "@/components/stats-overview"
import { BlockchainStatus } from "@/components/blockchain-status"
import { EventsFeed } from "@/components/events-feed"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useWeb3 } from "@/hooks/use-web3"
import { useAutoChain } from "@/hooks/use-autochain"
import { useContractEvents } from "@/hooks/use-contract-events"
import { formatEther } from "@/lib/web3"
import { Search, Plus, Car as CarIcon, ShoppingCart, DollarSign, Users, History, AlertCircle, Wallet } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { isConnected, account, userRole, connect } = useWeb3()
  const { 
    service, 
    userCars, 
    carsForSale, 
    isLoading, 
    refreshUserData,
    canCreateCar,
    canSellCar,
    canBuyCar
  } = useAutoChain()
  
  // Initialisation des événements de contrat
  useContractEvents()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "for-sale" | "owned">("all")

  // Filtrage des voitures en fonction de la recherche et du filtre
  const filteredCars = userCars?.filter(car => {
    const matchesSearch = !searchTerm || 
      car.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "for-sale" && car.enVente) ||
      (filterStatus === "owned" && !car.enVente)
    
    return matchesSearch && matchesFilter
  }) || []

  // Connexion à MetaMask
  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error("Erreur de connexion:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Connexion requise</CardTitle>
                <CardDescription>
                  Connectez votre portefeuille MetaMask pour accéder à votre tableau de bord
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnect} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connecter MetaMask
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Gérez vos véhicules et visualisez l'activité de la blockchain
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <BlockchainStatus />
            {canCreateCar && (
              <Button asChild className="glow-effect">
                <Link href="/create-car">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un véhicule
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mes véhicules
              </CardTitle>
              <CarIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCars?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En vente
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userCars?.filter(car => car.enVente).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rôle
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                <Badge variant={userRole === 'constructor' ? 'default' : 'secondary'}>
                  {userRole === 'constructor' ? 'Constructeur' : 'Utilisateur'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Marché
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carsForSale?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                véhicules disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Section principale - Mes véhicules */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Mes véhicules</CardTitle>
                    <CardDescription>
                      Gérez vos véhicules enregistrés sur la blockchain
                    </CardDescription>
                  </div>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
                      Possédés
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : filteredCars.length === 0 ? (
                  <div className="text-center py-12">
                    <CarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchTerm || filterStatus !== "all" 
                        ? "Aucun véhicule trouvé" 
                        : "Aucun véhicule enregistré"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || filterStatus !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Commencez par créer votre premier véhicule"}
                    </p>
                    {canCreateCar && !searchTerm && filterStatus === "all" && (
                      <Button asChild>
                        <Link href="/create-car">
                          <Plus className="w-4 h-4 mr-2" />
                          Créer un véhicule
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredCars.map((car) => (
                      <Card key={car.id} className="border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <CarIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {car.marque} {car.modele}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs">
                                  VIN: {car.vin.slice(0, 12)}...
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={car.enVente ? "default" : "secondary"}>
                              {car.enVente ? "En vente" : "Possédé"}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              {car.enVente && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {formatEther(car.prix)} ETH
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{car.proprietaires.length} propriétaire(s)</span>
                              </div>
                            </div>
                            
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/car/${car.id}`}>
                                <History className="w-4 h-4 mr-2" />
                                Historique
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section latérale - Activité */}
          <div className="space-y-6">
            <EventsFeed />
            
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canCreateCar && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/create-car">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un véhicule
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/buy-car">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Acheter un véhicule
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/history">
                    <History className="w-4 h-4 mr-2" />
                    Historique complet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
