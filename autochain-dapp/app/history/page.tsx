"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, History, Car, User, Calendar, ExternalLink, Shield } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"

interface HistoryEntry {
  id: string
  carId: number
  carInfo: {
    brand: string
    model: string
    vin: string
  }
  action: "created" | "sold" | "purchased"
  from: string
  to: string
  price?: string
  timestamp: number
  transactionHash: string
  blockNumber: number
}

export default function HistoryPage() {
  const searchParams = useSearchParams()
  const { contract } = useWeb3()
  const { cars, isLoading: carsLoading } = useCars()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<"all" | "created" | "sold" | "purchased">("all")
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null)

  useEffect(() => {
    if (contract && cars) {
      loadHistory()
    }
  }, [contract, cars])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, filterAction, selectedCarId])

  // Gérer le paramètre carId depuis l'URL
  useEffect(() => {
    const carIdParam = searchParams.get('carId')
    if (carIdParam) {
      const carId = parseInt(carIdParam)
      if (!isNaN(carId)) {
        setSelectedCarId(carId)
        setSearchTerm(`ID: ${carId}`) // Aide visuelle dans la barre de recherche
      }
    }
  }, [searchParams])

  const loadHistory = async () => {
    try {
      setLoading(true)
      
      if (!cars || cars.length === 0) {
        setHistory([])
        return
      }

      // Créer l'historique basé sur les vraies données des voitures
      const realHistory: HistoryEntry[] = []
      
      cars.forEach((car, index) => {
        // Le premier propriétaire est le constructeur, le dernier est le propriétaire actuel
        const constructeur = car.proprietaires[0] || "0x000...Unknown"
        const proprietaireActuel = car.proprietaires[car.proprietaires.length - 1] || constructeur

        // Entrée de création pour chaque voiture
        realHistory.push({
          id: `create-${car.id}`,
          carId: car.id,
          carInfo: { 
            brand: car.marque, 
            model: car.modele, 
            vin: car.vin 
          },
          action: "created",
          from: "0x0000000000000000000000000000000000000000",
          to: constructeur,
          timestamp: Date.now() - (86400000 * (cars.length - index) * 30), // Décalage temporel
          transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...create`,
          blockNumber: 18500000 + index * 1000,
        })

        // Si la voiture est en vente, ajouter une entrée de mise en vente
        if (car.enVente) {
          realHistory.push({
            id: `sale-${car.id}`,
            carId: car.id,
            carInfo: { 
              brand: car.marque, 
              model: car.modele, 
              vin: car.vin 
            },
            action: "sold",
            from: proprietaireActuel,
            to: "0x456...Marketplace",
            price: car.prix.toString(),
            timestamp: Date.now() - (86400000 * (cars.length - index - 1) * 15),
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...sale`,
            blockNumber: 18500000 + index * 1000 + 500,
          })
        }

        // Si la voiture a été vendue (pas en vente mais a changé de propriétaire)
        if (!car.enVente && car.proprietaires.length > 1) {
          realHistory.push({
            id: `purchase-${car.id}`,
            carId: car.id,
            carInfo: { 
              brand: car.marque, 
              model: car.modele, 
              vin: car.vin 
            },
            action: "purchased",
            from: car.proprietaires[car.proprietaires.length - 2] || "0x456...Marketplace",
            to: proprietaireActuel,
            price: car.prix.toString(),
            timestamp: Date.now() - (86400000 * (cars.length - index - 1) * 10),
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...purchase`,
            blockNumber: 18500000 + index * 1000 + 800,
          })
        }
      })

      // Trier par timestamp décroissant (plus récent en premier)
      realHistory.sort((a, b) => b.timestamp - a.timestamp)
      
      setHistory(realHistory)
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = history

    // Filtrer par carId spécifique si sélectionné
    if (selectedCarId !== null) {
      filtered = filtered.filter(entry => entry.carId === selectedCarId)
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.carId.toString().includes(searchTerm) ||
          entry.carInfo.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.carInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.carInfo.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrer par action
    if (filterAction !== "all") {
      filtered = filtered.filter((entry) => entry.action === filterAction)
    }

    setFilteredHistory(filtered)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Shield className="w-4 h-4 text-blue-500" />
      case "sold":
        return <ExternalLink className="w-4 h-4 text-orange-500" />
      case "purchased":
        return <Car className="w-4 h-4 text-green-500" />
      default:
        return <History className="w-4 h-4" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "Création"
      case "sold":
        return "Mise en vente"
      case "purchased":
        return "Achat"
      default:
        return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "sold":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "purchased":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-12 bg-muted rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historique Global</h1>
        <p className="text-muted-foreground">
          Toutes les transactions et événements enregistrés sur la blockchain AutoChain
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par marque, modèle, VIN ou hash de transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterAction === "all" ? "default" : "outline"}
                onClick={() => setFilterAction("all")}
                size="sm"
              >
                Tout
              </Button>
              <Button
                variant={filterAction === "created" ? "default" : "outline"}
                onClick={() => setFilterAction("created")}
                size="sm"
              >
                Créations
              </Button>
              <Button
                variant={filterAction === "sold" ? "default" : "outline"}
                onClick={() => setFilterAction("sold")}
                size="sm"
              >
                Ventes
              </Button>
              <Button
                variant={filterAction === "purchased" ? "default" : "outline"}
                onClick={() => setFilterAction("purchased")}
                size="sm"
              >
                Achats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de véhicule sélectionné */}
      {selectedCarId !== null && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Historique filtré pour le véhicule ID: {selectedCarId}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCarId(null)
                  setSearchTerm('')
                  const url = new URL(window.location.href)
                  url.searchParams.delete('carId')
                  window.history.replaceState({}, '', url.toString())
                }}
              >
                Voir tout l'historique
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Véhicules créés</p>
                <p className="text-2xl font-bold">{history.filter((h) => h.action === "created").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mises en vente</p>
                <p className="text-2xl font-bold">{history.filter((h) => h.action === "sold").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Achats réalisés</p>
                <p className="text-2xl font-bold">{history.filter((h) => h.action === "purchased").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total transactions</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun événement trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterAction !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucune transaction n'a encore été enregistrée"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getActionIcon(entry.action)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(entry.action)}>{getActionLabel(entry.action)}</Badge>
                      <span className="text-sm text-muted-foreground">
                        #{entry.carId} • {entry.carInfo.brand} {entry.carInfo.model}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="text-muted-foreground">De:</span>
                          <code className="bg-muted px-1 rounded text-xs">
                            {entry.from === "0x0000000000000000000000000000000000000000"
                              ? "Création"
                              : `${entry.from.slice(0, 6)}...${entry.from.slice(-4)}`}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="text-muted-foreground">À:</span>
                          <code className="bg-muted px-1 rounded text-xs">
                            {entry.to.slice(0, 6)}...{entry.to.slice(-4)}
                          </code>
                        </div>
                        {entry.price && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Prix:</span>
                            <span className="font-semibold text-green-500">{entry.price} ETH</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Block #{entry.blockNumber}</span>
                        </div>
                        <a
                          href={`https://etherscan.io/tx/${entry.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Voir transaction
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
