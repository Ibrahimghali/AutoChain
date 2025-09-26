"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatEther, type Car } from "@/lib/web3"
import { CarIcon, DollarSign, TrendingUp, Users } from "lucide-react"

interface StatsOverviewProps {
  userRole: "constructor" | "user" | null
  cars: Car[]
  userAccount: string | null
}

export function StatsOverview({ userRole, cars, userAccount }: StatsOverviewProps) {
  const userCars = cars.filter(
    (car) =>
      userAccount && car.proprietaires[car.proprietaires.length - 1]?.toLowerCase() === userAccount.toLowerCase(),
  )
  const carsForSale = cars.filter((car) => car.enVente)
  const userCarsForSale = userCars.filter((car) => car.enVente)

  const totalValue = userCarsForSale.reduce((sum, car) => sum + Number.parseFloat(formatEther(car.prix)), 0)

  const stats = [
    {
      title: userRole === "constructor" ? "Véhicules créés" : "Mes véhicules",
      value: userCars.length.toString(),
      description: userRole === "constructor" ? "Véhicules certifiés" : "Véhicules possédés",
      icon: CarIcon,
      color: "text-primary",
    },
    {
      title: "En vente",
      value: userCarsForSale.length.toString(),
      description: "Mes véhicules en vente",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Valeur totale",
      value: `${totalValue.toFixed(2)} ETH`,
      description: "Valeur de mes ventes",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      title: "Marché",
      value: carsForSale.length.toString(),
      description: "Véhicules disponibles",
      icon: Users,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
