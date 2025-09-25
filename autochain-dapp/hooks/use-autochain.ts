"use client"

import { useState, useEffect, useCallback } from "react"
import { useWeb3 } from "./use-web3"
import { useContractEvents } from "./use-contract-events"
import { AutoChainService } from "@/lib/autochain-service"
import type { Car } from "@/lib/web3"

export interface AutoChainState {
  service: AutoChainService | null
  isConstructor: boolean
  isAdmin: boolean
  userCars: Car[]
  carsForSale: Car[]
  contractStats: {
    totalCars: number
    carsForSale: number
    totalTransactions: number
  }
}

export function useAutoChain() {
  const { contract, web3, account, isConnected, userRole } = useWeb3()
  const { events, isListening } = useContractEvents()
  
  const [autoChainState, setAutoChainState] = useState<AutoChainState>({
    service: null,
    isConstructor: false,
    isAdmin: false,
    userCars: [],
    carsForSale: [],
    contractStats: {
      totalCars: 0,
      carsForSale: 0,
      totalTransactions: 0
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialiser le service AutoChain
  useEffect(() => {
    if (contract && web3) {
      const service = new AutoChainService(contract, web3)
      setAutoChainState(prev => ({ ...prev, service }))
    } else {
      setAutoChainState(prev => ({ ...prev, service: null }))
    }
  }, [contract, web3])

  // Charger les données utilisateur
  const loadUserData = useCallback(async () => {
    if (!autoChainState.service || !account || !isConnected) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [isConstructor, isAdmin, userCars, carsForSale, contractStats] = await Promise.all([
        autoChainState.service.isConstructor(account),
        autoChainState.service.isAdmin(account),
        autoChainState.service.getUserCars(account),
        autoChainState.service.getCarsForSale(),
        autoChainState.service.getContractStats()
      ])

      setAutoChainState(prev => ({
        ...prev,
        isConstructor,
        isAdmin,
        userCars,
        carsForSale,
        contractStats
      }))
    } catch (err) {
      console.error("Erreur lors du chargement des données utilisateur:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [autoChainState.service, account, isConnected])

  // Recharger les données utilisateur
  const refreshUserData = useCallback(async () => {
    await loadUserData()
  }, [loadUserData])

  // Recharger uniquement les voitures en vente
  const refreshCarsForSale = useCallback(async () => {
    if (!autoChainState.service) return

    try {
      const carsForSale = await autoChainState.service.getCarsForSale()
      setAutoChainState(prev => ({ ...prev, carsForSale }))
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des voitures en vente:", err)
    }
  }, [autoChainState.service])

  // Recharger uniquement les voitures de l'utilisateur
  const refreshUserCars = useCallback(async () => {
    if (!autoChainState.service || !account) return

    try {
      const userCars = await autoChainState.service.getUserCars(account)
      setAutoChainState(prev => ({ ...prev, userCars }))
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des voitures utilisateur:", err)
    }
  }, [autoChainState.service, account])

  // Obtenir une voiture spécifique
  const getCar = useCallback(async (carId: number): Promise<Car | null> => {
    if (!autoChainState.service) return null
    
    try {
      return await autoChainState.service.getCar(carId)
    } catch (err) {
      console.error("Erreur lors de la récupération de la voiture:", err)
      return null
    }
  }, [autoChainState.service])

  // Obtenir l'historique d'une voiture
  const getCarHistory = useCallback(async (carId: number): Promise<string[]> => {
    if (!autoChainState.service) return []
    
    try {
      return await autoChainState.service.getCarHistory(carId)
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err)
      return []
    }
  }, [autoChainState.service])

  // Vérifier si l'utilisateur peut effectuer certaines actions
  const canCreateCar = autoChainState.isConstructor
  const canManageConstructors = autoChainState.isAdmin
  
  const canSellCar = useCallback((car: Car): boolean => {
    if (!account) return false
    const currentOwner = car.proprietaires[car.proprietaires.length - 1]
    return currentOwner.toLowerCase() === account.toLowerCase() && !car.enVente
  }, [account])

  const canBuyCar = useCallback((car: Car): boolean => {
    if (!account) return false
    const currentOwner = car.proprietaires[car.proprietaires.length - 1]
    return car.enVente && currentOwner.toLowerCase() !== account.toLowerCase()
  }, [account])

  const canCancelSale = useCallback((car: Car): boolean => {
    if (!account) return false
    const currentOwner = car.proprietaires[car.proprietaires.length - 1]
    return car.enVente && currentOwner.toLowerCase() === account.toLowerCase()
  }, [account])

  // Charger les données au montage et quand la connexion change
  useEffect(() => {
    if (isConnected && autoChainState.service) {
      loadUserData()
    }
  }, [isConnected, autoChainState.service, loadUserData])

  // Rafraîchir les données quand des événements sont reçus
  useEffect(() => {
    const refreshOnEvents = async () => {
      if (!autoChainState.service || events.length === 0) return

      const latestEvent = events[0]
      
      // Rafraîchir selon le type d'événement
      switch (latestEvent.type) {
        case 'CarCreated':
        case 'CarListed':
        case 'CarSold':
          // Rafraîchir les voitures en vente et les voitures utilisateur
          await refreshCarsForSale()
          if (account) {
            await refreshUserCars()
          }
          break
        case 'ConstructorAdded':
        case 'ConstructorRemoved':
          // Recharger toutes les données utilisateur
          await loadUserData()
          break
      }
    }

    refreshOnEvents()
  }, [events, autoChainState.service, account, refreshCarsForSale, refreshUserCars, loadUserData])

  return {
    // État
    ...autoChainState,
    isLoading,
    error,
    userRole,
    
    // Actions
    refreshUserData,
    refreshCarsForSale,
    refreshUserCars,
    getCar,
    getCarHistory,
    
    // Permissions
    canCreateCar,
    canManageConstructors,
    canSellCar,
    canBuyCar,
    canCancelSale,
    
    // Événements
    recentEvents: events.slice(0, 10),
    isEventListening: isListening,
  }
}