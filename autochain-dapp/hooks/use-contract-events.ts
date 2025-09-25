"use client"

import { useEffect, useCallback, useState } from "react"
import { useWeb3 } from "./use-web3"
import { useToast } from "./use-toast"

export interface ContractEvent {
  type: 'CarCreated' | 'CarListed' | 'CarSold' | 'ConstructorAdded' | 'ConstructorRemoved'
  carId?: number
  creator?: string
  seller?: string
  buyer?: string
  price?: string
  vin?: string
  ctor?: string
  timestamp: number
  transactionHash: string
}

export function useContractEvents() {
  const { contract, isConnected } = useWeb3()
  const { toast } = useToast()
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [isListening, setIsListening] = useState(false)

  const addEvent = useCallback((event: ContractEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)) // Garder seulement les 50 derniers événements
  }, [])

  const showEventNotification = useCallback((event: ContractEvent) => {
    switch (event.type) {
      case 'CarCreated':
        toast({
          title: "Nouveau véhicule créé",
          description: `Véhicule ${event.carId} créé par ${event.creator?.slice(0, 6)}...`,
        })
        break
      case 'CarListed':
        toast({
          title: "Véhicule mis en vente",
          description: `Véhicule ${event.carId} mis en vente pour ${event.price} ETH`,
        })
        break
      case 'CarSold':
        toast({
          title: "Véhicule vendu",
          description: `Véhicule ${event.carId} vendu pour ${event.price} ETH`,
        })
        break
      case 'ConstructorAdded':
        toast({
          title: "Nouveau constructeur",
          description: `Constructeur ${event.ctor?.slice(0, 6)}... ajouté`,
        })
        break
      case 'ConstructorRemoved':
        toast({
          title: "Constructeur retiré",
          description: `Constructeur ${event.ctor?.slice(0, 6)}... retiré`,
        })
        break
    }
  }, [toast])

  const startListening = useCallback(() => {
    if (!contract || isListening) return

    setIsListening(true)

    const handleCarCreated = (carId: any, creator: string, vin: string, event: any) => {
      const contractEvent: ContractEvent = {
        type: 'CarCreated',
        carId: Number(carId),
        creator,
        vin,
        timestamp: Date.now(),
        transactionHash: event.transactionHash,
      }
      addEvent(contractEvent)
      showEventNotification(contractEvent)
    }

    const handleCarListed = (carId: any, seller: string, price: any, event: any) => {
      const contractEvent: ContractEvent = {
        type: 'CarListed',
        carId: Number(carId),
        seller,
        price: price.toString(),
        timestamp: Date.now(),
        transactionHash: event.transactionHash,
      }
      addEvent(contractEvent)
      showEventNotification(contractEvent)
    }

    const handleCarSold = (carId: any, seller: string, buyer: string, price: any, event: any) => {
      const contractEvent: ContractEvent = {
        type: 'CarSold',
        carId: Number(carId),
        seller,
        buyer,
        price: price.toString(),
        timestamp: Date.now(),
        transactionHash: event.transactionHash,
      }
      addEvent(contractEvent)
      showEventNotification(contractEvent)
    }

    const handleConstructorAdded = (ctor: string, event: any) => {
      const contractEvent: ContractEvent = {
        type: 'ConstructorAdded',
        ctor,
        timestamp: Date.now(),
        transactionHash: event.transactionHash,
      }
      addEvent(contractEvent)
      showEventNotification(contractEvent)
    }

    const handleConstructorRemoved = (ctor: string, event: any) => {
      const contractEvent: ContractEvent = {
        type: 'ConstructorRemoved',
        ctor,
        timestamp: Date.now(),
        transactionHash: event.transactionHash,
      }
      addEvent(contractEvent)
      showEventNotification(contractEvent)
    }

    // Écouter les événements
    contract.on("CarCreated", handleCarCreated)
    contract.on("CarListed", handleCarListed)
    contract.on("CarSold", handleCarSold)
    contract.on("ConstructorAdded", handleConstructorAdded)
    contract.on("ConstructorRemoved", handleConstructorRemoved)

    console.log("Écoute des événements du contrat démarrée")

    // Fonction de nettoyage
    return () => {
      contract.off("CarCreated", handleCarCreated)
      contract.off("CarListed", handleCarListed)
      contract.off("CarSold", handleCarSold)
      contract.off("ConstructorAdded", handleConstructorAdded)
      contract.off("ConstructorRemoved", handleConstructorRemoved)
      setIsListening(false)
      console.log("Écoute des événements du contrat arrêtée")
    }
  }, [contract, isListening, addEvent, showEventNotification])

  const stopListening = useCallback(() => {
    if (!contract || !isListening) return

    contract.removeAllListeners()
    setIsListening(false)
  }, [contract, isListening])

  // Démarrer/arrêter l'écoute selon l'état de connexion
  useEffect(() => {
    if (isConnected && contract) {
      const cleanup = startListening()
      return cleanup
    } else {
      stopListening()
    }
  }, [isConnected, contract, startListening, stopListening])

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  const getEventsByType = useCallback((type: ContractEvent['type']) => {
    return events.filter(event => event.type === type)
  }, [events])

  const getRecentEvents = useCallback((count: number = 10) => {
    return events.slice(0, count)
  }, [events])

  return {
    events,
    isListening,
    clearEvents,
    getEventsByType,
    getRecentEvents,
    startListening,
    stopListening,
  }
}