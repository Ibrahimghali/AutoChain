"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { useToast } from "@/hooks/use-toast"
import { type Car } from "@/lib/web3"
import { DollarSign, CarIcon, AlertCircle, TrendingUp, Wallet, CheckCircle } from "lucide-react"

export default function SellCarPage() {
  const searchParams = useSearchParams()
  const { account, isConnected, userRole, connect } = useWeb3()
  const { userCars, sellCar, isLoading: carsLoading, error: carsError, loadUserCars } = useCars()
  const { toast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [price, setPrice] = useState("")
  const [priceError, setPriceError] = useState("")

  // Charger les voitures de l'utilisateur au montage
  useEffect(() => {
    if (isConnected && account) {
      loadUserCars()
    }
  }, [isConnected, account, loadUserCars])

  // Présélectionner un véhicule si un ID est fourni dans l'URL
  useEffect(() => {
    const preselectedId = searchParams.get('preselect')
    if (preselectedId && userCars.length > 0) {
      const carToPreselect = userCars.find(car => 
        car.id === parseInt(preselectedId) && !car.enVente
      )
      if (carToPreselect) {
        setSelectedCar(carToPreselect)
        toast({
          title: "Véhicule présélectionné",
          description: `${carToPreselect.marque} ${carToPreselect.modele} est prêt pour la vente`,
        })
      }
    }
  }, [searchParams, userCars, toast])

  const validatePrice = (value: string) => {
    if (!value.trim()) {
      setPriceError("Le prix est requis")
      return false
    }

    const numPrice = Number.parseFloat(value)
    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setPriceError("Le prix doit être supérieur à 0")
      return false
    }

    if (numPrice > 1000) {
      setPriceError("Le prix semble trop élevé")
      return false
    }

    setPriceError("")
    return true
  }

  const handleSellCar = async () => {
    if (!selectedCar || !validatePrice(price)) {
      return
    }

    setIsSubmitting(true)
    try {
      await sellCar(selectedCar.id, price)
      
      toast({
        title: "Véhicule mis en vente",
        description: `${selectedCar.marque} ${selectedCar.modele} est maintenant en vente pour ${price} ETH`,
      })

      // Réinitialiser le formulaire
      setSelectedCar(null)
      setPrice("")
      setPriceError("")
      
      // Recharger les données
      await loadUserCars()
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre le véhicule en vente",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connect()
    } catch (error) {
      console.error("Erreur de connexion:", error)
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à MetaMask",
        variant: "destructive"
      })
    }
  }

  // Filtrer les voitures qui ne sont pas en vente
  const availableCars = userCars.filter(car => !car.enVente)

  if (carsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation currentPath="/sell-car" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation currentPath="/sell-car" />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>
                Connectez votre portefeuille pour mettre vos véhicules en vente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleConnectWallet} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Connecter MetaMask
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentPath="/sell-car" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <TrendingUp className="inline-block h-8 w-8 mr-2 text-green-600" />
              Mettre en Vente
            </h1>
            <p className="text-lg text-gray-600">
              Vendez vos véhicules sur la blockchain AutoChain
            </p>
          </div>

          {/* Erreur */}
          {carsError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{carsError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Liste des véhicules disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CarIcon className="h-5 w-5 mr-2" />
                  Mes Véhicules Disponibles
                </CardTitle>
                <CardDescription>
                  Sélectionnez le véhicule que vous souhaitez mettre en vente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableCars.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun véhicule disponible pour la vente</p>
                    <p className="text-sm mt-2">
                      {userCars.length > 0 
                        ? "Tous vos véhicules sont déjà en vente" 
                        : "Vous ne possédez aucun véhicule"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableCars.map((car) => (
                      <div
                        key={car.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCar?.id === car.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedCar(car)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {car.marque} {car.modele}
                            </h3>
                            <p className="text-sm text-gray-600">VIN: {car.vin}</p>
                            <p className="text-sm text-gray-600">ID: {car.id}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">Disponible</Badge>
                            {selectedCar?.id === car.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600 mt-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulaire de vente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Détails de la Vente
                </CardTitle>
                <CardDescription>
                  Définissez le prix de vente de votre véhicule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCar ? (
                  <>
                    {/* Résumé du véhicule sélectionné */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Véhicule sélectionné</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Marque:</span> {selectedCar.marque}</p>
                        <p><span className="font-medium">Modèle:</span> {selectedCar.modele}</p>
                        <p><span className="font-medium">VIN:</span> {selectedCar.vin}</p>
                        <p><span className="font-medium">ID:</span> {selectedCar.id}</p>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix de vente (ETH)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 0.5"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value)
                          if (priceError) validatePrice(e.target.value)
                        }}
                        className={priceError ? "border-red-500" : ""}
                      />
                      {priceError && (
                        <p className="text-sm text-red-600">{priceError}</p>
                      )}
                    </div>

                    {/* Estimation */}
                    {price && !priceError && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Estimation:</strong> Vous recevrez {price} ETH lors de la vente
                        </p>
                      </div>
                    )}

                    {/* Bouton de vente */}
                    <Button
                      onClick={handleSellCar}
                      disabled={isSubmitting || !price || !!priceError}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner />
                          Mise en vente...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Mettre en Vente
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un véhicule pour commencer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informations */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Important
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frais de transaction</h4>
                  <p>Une fois mis en vente, votre véhicule sera visible par tous les utilisateurs de la plateforme.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Annulation</h4>
                  <p>Vous pouvez retirer votre véhicule de la vente à tout moment depuis votre tableau de bord.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}