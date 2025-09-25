"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { BlockchainStatus } from "@/components/blockchain-status"
import { useWeb3 } from "@/hooks/use-web3"
import { useAutoChain } from "@/hooks/use-autochain"
import { useToast } from "@/hooks/use-toast"
import { Plus, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateCarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, account, userRole, connect } = useWeb3()
  const { service, canCreateCar, refreshUserData } = useAutoChain()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vin: "",
    marque: "",
    modele: "",
    annee: "",
    couleur: "",
    motorisation: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

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

    if (!formData.annee.trim()) {
      newErrors.annee = "L'année est requise"
    } else if (
      Number.parseInt(formData.annee) < 1900 ||
      Number.parseInt(formData.annee) > new Date().getFullYear() + 1
    ) {
      newErrors.annee = "Année invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!service || !canCreateCar) {
      toast({
        title: "Erreur",
        description: "Vous devez être un constructeur certifié pour créer une voiture.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccess(null)

    try {
      const result = await service.createCar(formData.vin, formData.marque, formData.modele)
      
      if (result.success && result.carId) {
        setSuccess(`Voiture créée avec succès ! ID: ${result.carId}`)
        
        // Réinitialiser le formulaire
        setFormData({
          vin: "",
          marque: "",
          modele: "",
          annee: "",
          couleur: "",
          motorisation: "",
          description: "",
        })

        // Rafraîchir les données utilisateur
        await refreshUserData()

        toast({
          title: "Succès",
          description: `Voiture créée avec l'ID ${result.carId}`,
        })

        // Rediriger vers le dashboard après un délai
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setErrors({ submit: result.error || "Erreur lors de la création" })
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      setErrors({ submit: errorMessage })
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }

    setIsSubmitting(true)

    try {
      // Ici, on appellerait la fonction createCar du smart contract
      console.log("Création du véhicule:", formData)

      // Simulation d'un appel au contrat
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Véhicule créé avec succès !")

      // Réinitialiser le formulaire
      setFormData({
        vin: "",
        marque: "",
        modele: "",
        annee: "",
        couleur: "",
        motorisation: "",
        description: "",
      })
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      alert("Erreur lors de la création du véhicule")
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

  // Vérification des permissions
  if (!isConnected || !canCreateCar) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Accès restreint</h1>
          <p className="text-muted-foreground mb-8">
            Cette page est réservée aux constructeurs certifiés. Connectez-vous avec un compte constructeur pour
            continuer.
          </p>
          {!isConnected ? (
            <Button onClick={connect} size="lg">
              Connecter MetaMask
            </Button>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                Votre compte n'a pas les permissions nécessaires pour créer des véhicules.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Retour au tableau de bord</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BlockchainStatus isConnected={isConnected} account={account} userRole={userRole} />

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

        {/* Alertes de succès et d'erreur */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du véhicule</CardTitle>
              <CardDescription>Renseignez les détails techniques du véhicule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="annee">Année *</Label>
                  <Input
                    id="annee"
                    type="number"
                    value={formData.annee}
                    onChange={(e) => handleInputChange("annee", e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={errors.annee ? "border-destructive" : ""}
                  />
                  {errors.annee && <p className="text-sm text-destructive">{errors.annee}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couleur">Couleur</Label>
                  <Input
                    id="couleur"
                    value={formData.couleur}
                    onChange={(e) => handleInputChange("couleur", e.target.value)}
                    placeholder="Noir métallisé"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motorisation">Motorisation</Label>
                  <Input
                    id="motorisation"
                    value={formData.motorisation}
                    onChange={(e) => handleInputChange("motorisation", e.target.value)}
                    placeholder="Électrique 100kWh"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Description détaillée du véhicule, équipements, options..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Annuler</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || !service} className="flex items-center space-x-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
