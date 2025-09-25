"use client"

import { useConstructor } from "@/hooks/use-constructor"
import { useWeb3 } from "@/hooks/use-web3"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ExternalLink, Building2 } from "lucide-react"

export function ConstructorHeader() {
  const { isConnected, userRole } = useWeb3()
  const {
    isConstructor,
    constructorInfo,
    constructorName,
    constructorBrand,
    constructorLogo,
    constructorDescription,
    constructorWebsite,
    primaryColor,
    secondaryColor,
  } = useConstructor()

  if (!isConnected || userRole !== "constructor") {
    return null
  }

  return (
    <Card className="mb-6 p-6" style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}>
      <div className="flex items-center gap-4">
        {constructorLogo && (
          <img
            src={constructorLogo || "/placeholder.svg"}
            alt={`${constructorBrand} logo`}
            className="w-16 h-16 rounded-lg object-contain bg-white p-2"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
              {constructorName}
            </h2>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Constructeur Certifié
            </Badge>
          </div>

          {constructorDescription && <p className="text-muted-foreground mb-2">{constructorDescription}</p>}

          {constructorWebsite && (
            <a
              href={constructorWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm hover:underline"
              style={{ color: primaryColor }}
            >
              <ExternalLink className="w-3 h-3" />
              Site web officiel
            </a>
          )}
        </div>

        {!constructorInfo && (
          <div className="text-right">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Constructeur Non Référencé
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Contactez l'administrateur pour être référencé</p>
          </div>
        )}
      </div>
    </Card>
  )
}
