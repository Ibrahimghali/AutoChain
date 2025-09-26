"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tag } from "lucide-react"
import { web3Service } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"

interface SellCarDialogProps {
  carId: number
  carInfo: string
  onCarSold?: () => void
}

export function SellCarDialog({ carId, carInfo, onCarSold }: SellCarDialogProps) {
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSell = async () => {
    if (!price || Number.parseFloat(price) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un prix valide",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const tx = await web3Service.putCarForSale(carId, price)
      await tx.wait()

      toast({
        title: "Véhicule mis en vente",
        description: `Votre véhicule est maintenant en vente pour ${price} ETH`,
      })

      setPrice("")
      setOpen(false)
      onCarSold?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise en vente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1">
          <Tag className="h-4 w-4 mr-1" />
          Mettre en vente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mettre en vente</DialogTitle>
          <DialogDescription>{carInfo}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.5"
              required
            />
          </div>
          <Button onClick={handleSell} disabled={isLoading} className="w-full">
            {isLoading ? "Mise en vente..." : "Confirmer la vente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
