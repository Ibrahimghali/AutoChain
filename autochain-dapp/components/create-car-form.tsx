"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { web3Service } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"

interface CreateCarFormProps {
  onCarCreated?: () => void
}

export function CreateCarForm({ onCarCreated }: CreateCarFormProps) {
  const [formData, setFormData] = useState({
    vin: "",
    marque: "",
    modele: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const tx = await web3Service.createCar(formData.vin, formData.marque, formData.modele)
      await tx.wait()

      toast({
        title: "Véhicule créé",
        description: "Le véhicule a été certifié avec succès sur la blockchain",
      })

      setFormData({ vin: "", marque: "", modele: "" })
      onCarCreated?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer un véhicule certifié
        </CardTitle>
        <CardDescription>En tant que constructeur, vous pouvez certifier de nouveaux véhicules</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vin">Numéro VIN</Label>
            <Input
              id="vin"
              value={formData.vin}
              onChange={(e) => setFormData((prev) => ({ ...prev, vin: e.target.value }))}
              placeholder="1HGBH41JXMN109186"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marque">Marque</Label>
            <Input
              id="marque"
              value={formData.marque}
              onChange={(e) => setFormData((prev) => ({ ...prev, marque: e.target.value }))}
              placeholder="Toyota"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modele">Modèle</Label>
            <Input
              id="modele"
              value={formData.modele}
              onChange={(e) => setFormData((prev) => ({ ...prev, modele: e.target.value }))}
              placeholder="Camry"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Création..." : "Créer le véhicule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
