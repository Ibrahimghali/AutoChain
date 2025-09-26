"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { History, User } from "lucide-react"
import { web3Service } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"

interface CarHistoryDialogProps {
  carId: number
  carInfo: string
}

export function CarHistoryDialog({ carId, carInfo }: CarHistoryDialogProps) {
  const [history, setHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const owners = await web3Service.getCarHistory(carId)
      setHistory(owners)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadHistory()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <History className="h-4 w-4 mr-1" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historique du véhicule</DialogTitle>
          <DialogDescription>{carInfo}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Chargement...</p>
          ) : (
            <div className="space-y-3">
              {history.map((owner, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-mono text-sm">
                      {owner.slice(0, 6)}...{owner.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && <Badge variant="secondary">Constructeur</Badge>}
                    {index === history.length - 1 && <Badge>Propriétaire actuel</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
