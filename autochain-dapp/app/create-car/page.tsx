"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { useWeb3 } from "@/hooks/use-web3"
import { useCars } from "@/hooks/use-cars"
import { Plus, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreateCarPage() {
  const { isConnected, userRole, connect, isLoading: web3Loading } = useWeb3()
  const { createNewCar } = useCars()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vin: "",
    marque: "",
    modele: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vin.trim()) {
      newErrors.vin = "Le numéro VIN est requis"
    } else if (formData.vin.length !== 17) {
      newErrors.vin = "Le VIN doit contenir exactement 17 caractères"
    }

    if (!formData.marque.trim()) {
      newErrors.marque = "La marque est requise"
    }

    if (!formData.modele.trim()) {
      newErrors.modele = "Le modèle est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Création du véhicule:", formData)

      const carId = await createNewCar(formData.vin, formData.marque, formData.modele)

      toast({
        title: "Véhicule créé avec succès !",
        description: `Le véhicule a été créé avec l'ID ${carId} et enregistré sur la blockchain.`,
      })

      // Réinitialiser le formulaire
      setFormData({
        vin: "",
        marque: "",
        modele: "",
      })
    } catch (error) {
      console.error("[v0] Erreur lors de la création:", error)
      toast({
        title: "Erreur lors de la création",
        description: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (web3Loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isConnected || userRole !== "constructor") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/create-car" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Accès restreint</h1>
          <p className="text-muted-foreground mb-8">
            Cette page est réservée aux constructeurs certifiés. Connectez-vous avec un compte constructeur pour
            continuer.
          </p>
          {!isConnected && (
            <Button onClick={connect} size="lg">
              Connecter MetaMask
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/create-car" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Créer un nouveau véhicule</h1>
              <p className="text-muted-foreground">Enregistrez et certifiez un véhicule sur la blockchain</p>
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20 mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Certification Constructeur</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                En tant que constructeur certifié, vous garantissez l'authenticité et la conformité de ce véhicule.
                Cette certification sera enregistrée de manière permanente sur la blockchain Ethereum.
              </p>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du véhicule</CardTitle>
              <CardDescription>Renseignez les détails essentiels du véhicule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vin">Numéro VIN *</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                    placeholder="1HGBH41JXMN109186"
                    maxLength={17}
                    className={errors.vin ? "border-destructive" : ""}
                  />
                  {errors.vin && <p className="text-sm text-destructive">{errors.vin}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marque">Marque *</Label>
                  <Input
                    id="marque"
                    value={formData.marque}
                    onChange={(e) => handleInputChange("marque", e.target.value)}
                    placeholder="Tesla"
                    className={errors.marque ? "border-destructive" : ""}
                  />
                  {errors.marque && <p className="text-sm text-destructive">{errors.marque}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modele">Modèle *</Label>
                  <Input
                    id="modele"
                    value={formData.modele}
                    onChange={(e) => handleInputChange("modele", e.target.value)}
                    placeholder="Model S"
                    className={errors.modele ? "border-destructive" : ""}
                  />
                  {errors.modele && <p className="text-sm text-destructive">{errors.modele}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Créer et certifier</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
