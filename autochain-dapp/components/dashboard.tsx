"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, ShoppingCart, Shield, User } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { web3Service, type Car as CarType } from "@/lib/web3"
import { CreateCarForm } from "./create-car-form"
import { CarCard } from "./car-card"
import { SellCarDialog } from "./sell-car-dialog"
import { CarHistoryDialog } from "./car-history-dialog"
import { useToast } from "@/hooks/use-toast"

export function Dashboard() {
  const { account, isConstructor } = useWeb3()
  const [ownedCars, setOwnedCars] = useState<CarType[]>([])
  const [carsForSale, setCarsForSale] = useState<CarType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadCars = async () => {
    if (!account) return

    setIsLoading(true)
    try {
      // Charger les voitures en vente
      const saleIds = await web3Service.getCarsForSale()
      const salePromises = saleIds.map((id) => web3Service.getCar(id))
      const saleResults = await Promise.all(salePromises)
      setCarsForSale(saleResults)

      // Charger toutes les voitures pour trouver celles possédées
      const nextId = await web3Service.getNextCarId()
      const owned: CarType[] = []

      for (let i = 1; i < nextId; i++) {
        try {
          const owner = await web3Service.ownerOf(i)
          if (owner.toLowerCase() === account.toLowerCase()) {
            const car = await web3Service.getCar(i)
            owned.push(car)
          }
        } catch (error) {
          // Voiture peut ne pas exister
        }
      }

      setOwnedCars(owned)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les véhicules",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCars()
  }, [account])

  const handleBuyCar = async (carId: number, price: string) => {
    try {
      const tx = await web3Service.buyCar(carId, price)
      await tx.wait()

      toast({
        title: "Achat réussi",
        description: "Vous êtes maintenant propriétaire de ce véhicule",
      })

      loadCars()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'achat",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Connecté en tant que {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
        <Badge variant={isConstructor ? "default" : "secondary"} className="flex items-center gap-1">
          {isConstructor ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {isConstructor ? "Constructeur" : "Utilisateur"}
        </Badge>
      </div>

      <Tabs defaultValue={isConstructor ? "create" : "owned"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {isConstructor && (
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Créer
            </TabsTrigger>
          )}
          <TabsTrigger value="owned" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Mes véhicules
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Marché
          </TabsTrigger>
        </TabsList>

        {isConstructor && (
          <TabsContent value="create" className="space-y-4">
            <CreateCarForm onCarCreated={loadCars} />
          </TabsContent>
        )}

        <TabsContent value="owned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes véhicules ({ownedCars.length})</CardTitle>
              <CardDescription>Véhicules que vous possédez actuellement</CardDescription>
            </CardHeader>
            <CardContent>
              {ownedCars.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Vous ne possédez aucun véhicule</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ownedCars.map((car) => (
                    <div key={car.id} className="space-y-2">
                      <CarCard car={car} isOwner={true} onViewHistory={(carId) => {}} />
                      <div className="flex gap-2">
                        <CarHistoryDialog carId={car.id} carInfo={`${car.marque} ${car.modele} (${car.vin})`} />
                        {!car.enVente && (
                          <SellCarDialog
                            carId={car.id}
                            carInfo={`${car.marque} ${car.modele} (${car.vin})`}
                            onCarSold={loadCars}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Véhicules en vente ({carsForSale.length})</CardTitle>
              <CardDescription>Véhicules disponibles à l'achat sur le marché</CardDescription>
            </CardHeader>
            <CardContent>
              {carsForSale.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun véhicule en vente actuellement</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {carsForSale.map((car) => (
                    <div key={car.id} className="space-y-2">
                      <CarCard car={car} isOwner={false} onBuy={handleBuyCar} />
                      <CarHistoryDialog carId={car.id} carInfo={`${car.marque} ${car.modele} (${car.vin})`} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
