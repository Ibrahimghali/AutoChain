"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEther, type Car } from "@/lib/web3"
import { CarIcon, Eye, ShoppingCart, DollarSign, History, Users } from "lucide-react"

interface CarCardProps {
  car: Car
  userRole: "constructor" | "user" | null
  userAccount: string | null
  onAction: (action: "view" | "buy" | "sell" | "history", carId: number) => void
}

export function CarCard({ car, userRole, userAccount, onAction }: CarCardProps) {
  const isOwner =
    userAccount && car.proprietaires[car.proprietaires.length - 1]?.toLowerCase() === userAccount.toLowerCase()
  const canBuy = car.enVente && !isOwner && userRole === "user"
  const canSell = isOwner && !car.enVente && (userRole === "user" || userRole === "constructor")

  return (
    <Card className="car-card-hover border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {car.marque} {car.modele}
              </CardTitle>
              <CardDescription className="font-mono text-xs">VIN: {car.vin.slice(0, 8)}...</CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {car.enVente ? (
              <Badge variant="default" className="bg-accent text-accent-foreground">
                En vente
              </Badge>
            ) : (
              <Badge variant="secondary">Privé</Badge>
            )}
            {isOwner && (
              <Badge variant="outline" className="text-xs">
                Vôtre
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prix */}
        {car.enVente && (
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Prix</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{formatEther(car.prix)} ETH</div>
              <div className="text-xs text-muted-foreground">
                ≈ ${(Number.parseFloat(formatEther(car.prix)) * 2500).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Propriétaires */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Propriétaires</span>
          </div>
          <span className="font-medium">{car.proprietaires.length}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 pt-2">
          <div className="flex space-x-2">
            <Link href={`/car/${car.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full flex items-center space-x-2 bg-transparent">
                <Eye className="w-4 h-4" />
                <span>Détails</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction("history", car.id)}
              className="flex-1 flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>Historique</span>
            </Button>
          </div>

          {canBuy && (
            <Button onClick={() => onAction("buy", car.id)} className="w-full flex items-center space-x-2 glow-effect">
              <ShoppingCart className="w-4 h-4" />
              <span>Acheter</span>
            </Button>
          )}

          {canSell && (
            <Button
              variant="secondary"
              onClick={() => onAction("sell", car.id)}
              className="w-full flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Mettre en vente</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
