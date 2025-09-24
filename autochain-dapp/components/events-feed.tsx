"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatEther, shortenAddress } from "@/lib/web3"
import { useContractEvents, type ContractEvent } from "@/hooks/use-contract-events"
import { Car, Plus, DollarSign, UserPlus, UserMinus, Clock, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface EventsFeedProps {
  maxEvents?: number
  showTitle?: boolean
  className?: string
}

export function EventsFeed({ maxEvents = 10, showTitle = true, className }: EventsFeedProps) {
  const { events, isListening, clearEvents } = useContractEvents()

  const getEventIcon = (type: ContractEvent['type']) => {
    switch (type) {
      case 'CarCreated':
        return <Plus className="w-4 h-4" />
      case 'CarListed':
        return <DollarSign className="w-4 h-4" />
      case 'CarSold':
        return <Car className="w-4 h-4" />
      case 'ConstructorAdded':
        return <UserPlus className="w-4 h-4" />
      case 'ConstructorRemoved':
        return <UserMinus className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEventColor = (type: ContractEvent['type']) => {
    switch (type) {
      case 'CarCreated':
        return 'text-green-600 bg-green-100'
      case 'CarListed':
        return 'text-blue-600 bg-blue-100'
      case 'CarSold':
        return 'text-purple-600 bg-purple-100'
      case 'ConstructorAdded':
        return 'text-orange-600 bg-orange-100'
      case 'ConstructorRemoved':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getEventDescription = (event: ContractEvent) => {
    switch (event.type) {
      case 'CarCreated':
        return (
          <div>
            <p className="text-sm">
              Nouveau véhicule <strong>#{event.carId}</strong> créé
            </p>
            <p className="text-xs text-muted-foreground">
              VIN: {event.vin} • Par {shortenAddress(event.creator || '')}
            </p>
          </div>
        )
      case 'CarListed':
        return (
          <div>
            <p className="text-sm">
              Véhicule <strong>#{event.carId}</strong> mis en vente
            </p>
            <p className="text-xs text-muted-foreground">
              Prix: {formatEther(event.price || '0')} ETH • Par {shortenAddress(event.seller || '')}
            </p>
          </div>
        )
      case 'CarSold':
        return (
          <div>
            <p className="text-sm">
              Véhicule <strong>#{event.carId}</strong> vendu
            </p>
            <p className="text-xs text-muted-foreground">
              Prix: {formatEther(event.price || '0')} ETH • 
              De {shortenAddress(event.seller || '')} à {shortenAddress(event.buyer || '')}
            </p>
          </div>
        )
      case 'ConstructorAdded':
        return (
          <div>
            <p className="text-sm">Nouveau constructeur ajouté</p>
            <p className="text-xs text-muted-foreground">
              Adresse: {shortenAddress(event.ctor || '')}
            </p>
          </div>
        )
      case 'ConstructorRemoved':
        return (
          <div>
            <p className="text-sm">Constructeur retiré</p>
            <p className="text-xs text-muted-foreground">
              Adresse: {shortenAddress(event.ctor || '')}
            </p>
          </div>
        )
      default:
        return <p className="text-sm">Événement inconnu</p>
    }
  }

  const displayedEvents = events.slice(0, maxEvents)

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activité en temps réel</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isListening ? 'En ligne' : 'Hors ligne'}
              </span>
              {events.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearEvents}>
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {displayedEvents.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune activité récente</p>
            <p className="text-xs">Les nouveaux événements apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {displayedEvents.map((event, index) => (
                <div
                  key={`${event.transactionHash}-${index}`}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {getEventDescription(event)}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Ouvrir l'explorateur de bloc pour voir la transaction
                          window.open(`https://etherscan.io/tx/${event.transactionHash}`, '_blank')
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {events.length > maxEvents && (
          <div className="p-4 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              {events.length - maxEvents} événements supplémentaires
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}