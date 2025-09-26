"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CarIcon, History, ShoppingCart, Tag } from "lucide-react"
import type { Car } from "@/lib/web3"

interface CarCardProps {
  car: Car
  isOwner?: boolean
  onSell?: (carId: number) => void
  onBuy?: (carId: number, price: string) => void
  onViewHistory?: (carId: number) => void
}

export function CarCard({ car, isOwner, onSell, onBuy, onViewHistory }: CarCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CarIcon className="h-5 w-5" />
            {car.marque} {car.modele}
          </div>
          {car.enVente && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              En vente
            </Badge>
          )}
        </CardTitle>
        <CardDescription>VIN: {car.vin}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {car.enVente && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Prix</p>
            <p className="text-lg font-semibold">{car.prix} ETH</p>
          </div>
        )}

        <div className="flex gap-2">
          {onViewHistory && (
            <Button variant="outline" size="sm" onClick={() => onViewHistory(car.id)} className="flex-1">
              <History className="h-4 w-4 mr-1" />
              Historique
            </Button>
          )}

          {isOwner && !car.enVente && onSell && (
            <Button size="sm" onClick={() => onSell(car.id)} className="flex-1">
              <Tag className="h-4 w-4 mr-1" />
              Mettre en vente
            </Button>
          )}

          {!isOwner && car.enVente && onBuy && (
            <Button size="sm" onClick={() => onBuy(car.id, car.prix)} className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Acheter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
