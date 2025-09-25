"use client"

import { useState, useEffect, useCallback } from "react"
import { useWeb3 } from "./use-web3"
import { useBlockchainError } from "./use-blockchain-error"
import {
  createCar,
  putCarForSale,
  buyCar,
  getCarsForSale,
  getUserCars,
  getAllCars,
  cancelSale,
  getCar,
  formatEther,
  parseEther,
  type Car,
} from "@/lib/web3"

export function useCars() {
  const { contract, account, isConnected, userRole } = useWeb3()
  const { handleError, showTransactionPending, showTransactionSuccess } = useBlockchainError()
  const [cars, setCars] = useState<Car[]>([])
  const [userCars, setUserCars] = useState<Car[]>([])
  const [carsForSale, setCarsForSale] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)

  // Charger toutes les voitures
  const loadAllCars = useCallback(async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)
      const allCars = await getAllCars(contract)
      setCars(allCars)
    } catch (err) {
      console.error("Erreur lors du chargement des voitures:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // Charger les voitures de l'utilisateur
  const loadUserCars = useCallback(async () => {
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setError(null)
      const cars = await getUserCars(contract, account)
      setUserCars(cars)
    } catch (err) {
      console.error("Erreur lors du chargement des voitures utilisateur:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [contract, account])

  // Charger les voitures en vente
  const loadCarsForSale = useCallback(async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)
      const cars = await getCarsForSale(contract)
      setCarsForSale(cars)
    } catch (err) {
      console.error("Erreur lors du chargement des voitures en vente:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // Récupérer une voiture spécifique
  const getCarById = useCallback(
    async (carId: number): Promise<Car | null> => {
      if (!contract) return null

      try {
        setError(null)
        const car = await getCar(contract, carId)
        setSelectedCar(car)
        return car
      } catch (err) {
        console.error("Erreur lors de la récupération de la voiture:", err)
        handleError(err, "Erreur lors de la récupération de la voiture")
        return null
      }
    },
    [contract, handleError]
  )

  // Créer une nouvelle voiture (constructeur uniquement)
  const createNewCar = useCallback(
    async (data: { vin: string; marque: string; modele: string }) => {
      if (!contract) throw new Error("Contrat non disponible")
      if (userRole !== "constructor") {
        throw new Error("Seuls les constructeurs peuvent créer des voitures")
      }

      try {
        setError(null)
        setIsLoading(true)

        const { vin, marque, modele } = data

        // Validation des données
        if (!vin.trim() || !marque.trim() || !modele.trim()) {
          throw new Error("Tous les champs sont obligatoires")
        }

        showTransactionPending()
        const carId = await createCar(contract, vin.trim(), marque.trim(), modele.trim())

        showTransactionSuccess(`Voiture créée avec l'ID ${carId}`)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars()])

        return carId
      } catch (err) {
        console.error("Erreur lors de la création:", err)
        handleError(err, "Erreur lors de la création de la voiture")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contract, userRole, loadAllCars, loadUserCars, handleError, showTransactionPending, showTransactionSuccess]
  )

  // Mettre en vente une voiture (propriétaire uniquement)
  const sellCar = useCallback(
    async (carId: number, priceInEth: string) => {
      if (!contract || !account) throw new Error("Contrat ou compte non disponible")

      try {
        setError(null)
        setIsLoading(true)

        // Validation du prix
        const price = parseFloat(priceInEth)
        if (isNaN(price) || price <= 0) {
          throw new Error("Le prix doit être un nombre positif")
        }

        showTransactionPending()
        await putCarForSale(contract, carId, priceInEth)

        showTransactionSuccess(`Voiture ${carId} mise en vente pour ${priceInEth} ETH`)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de la mise en vente:", err)
        handleError(err, "Erreur lors de la mise en vente")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contract, account, loadAllCars, loadUserCars, loadCarsForSale, handleError, showTransactionPending, showTransactionSuccess]
  )

  // Acheter une voiture
  const purchaseCar = useCallback(
    async (carId: number, priceInWei: string) => {
      if (!contract || !account) throw new Error("Contrat ou compte non disponible")

      try {
        setError(null)
        setIsLoading(true)

        // Vérifier que la voiture existe et est en vente
        const car = await getCar(contract, carId)
        if (!car.enVente) {
          throw new Error("Cette voiture n'est pas en vente")
        }

        // Vérifier que l'utilisateur n'achète pas sa propre voiture
        const currentOwner = car.proprietaires[car.proprietaires.length - 1]
        if (currentOwner.toLowerCase() === account.toLowerCase()) {
          throw new Error("Vous ne pouvez pas acheter votre propre voiture")
        }

        const priceInEth = formatEther(priceInWei)
        showTransactionPending()
        await buyCar(contract, carId, priceInWei)

        showTransactionSuccess(`Voiture ${carId} achetée pour ${priceInEth} ETH`)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de l'achat:", err)
        handleError(err, "Erreur lors de l'achat")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contract, account, loadAllCars, loadUserCars, loadCarsForSale, handleError, showTransactionPending, showTransactionSuccess]
  )

  // Annuler la vente d'une voiture (propriétaire uniquement)
  const cancelCarSale = useCallback(
    async (carId: number) => {
      if (!contract || !account) throw new Error("Contrat ou compte non disponible")

      try {
        setError(null)
        setIsLoading(true)

        showTransactionPending()
        await cancelSale(contract, carId)

        showTransactionSuccess(`Vente de la voiture ${carId} annulée`)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de l'annulation:", err)
        handleError(err, "Erreur lors de l'annulation de la vente")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contract, account, loadAllCars, loadUserCars, loadCarsForSale, handleError, showTransactionPending, showTransactionSuccess]
  )

  // Fonctions utilitaires
  const isOwner = useCallback(
    (car: Car): boolean => {
      if (!account || !car.proprietaires.length) return false
      const currentOwner = car.proprietaires[car.proprietaires.length - 1]
      return currentOwner.toLowerCase() === account.toLowerCase()
    },
    [account]
  )

  const canCreateCar = useCallback((): boolean => {
    return userRole === "constructor"
  }, [userRole])

  const canSellCar = useCallback(
    (car: Car): boolean => {
      return isConnected && isOwner(car) && !car.enVente
    },
    [isConnected, isOwner]
  )

  const canBuyCar = useCallback(
    (car: Car): boolean => {
      return isConnected && car.enVente && !isOwner(car)
    },
    [isConnected, isOwner]
  )

  const canCancelSale = useCallback(
    (car: Car): boolean => {
      return isConnected && isOwner(car) && car.enVente
    },
    [isConnected, isOwner]
  )

  // Obtenir les statistiques
  const getStats = useCallback(() => {
    return {
      totalCars: cars.length,
      carsForSale: carsForSale.length,
      userOwnedCars: userCars.length,
      userCarsForSale: userCars.filter(car => car.enVente).length,
    }
  }, [cars.length, carsForSale.length, userCars])

  // Recherche et filtres
  const searchCars = useCallback(
    (query: string): Car[] => {
      if (!query.trim()) return cars

      const lowercaseQuery = query.toLowerCase()
      return cars.filter(
        car =>
          car.marque.toLowerCase().includes(lowercaseQuery) ||
          car.modele.toLowerCase().includes(lowercaseQuery) ||
          car.vin.toLowerCase().includes(lowercaseQuery) ||
          car.id.toString().includes(lowercaseQuery)
      )
    },
    [cars]
  )

  // Actualiser toutes les données
  const refreshAllData = useCallback(async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      await Promise.all([
        loadAllCars(),
        loadCarsForSale(),
        account ? loadUserCars() : Promise.resolve(),
      ])
    } catch (err) {
      console.error("Erreur lors du rafraîchissement:", err)
      handleError(err, "Erreur lors du rafraîchissement des données")
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, loadAllCars, loadCarsForSale, loadUserCars, handleError])

  // Charger les données au montage et quand le contrat change
  useEffect(() => {
    if (contract && isConnected) {
      loadAllCars()
      loadCarsForSale()
      if (account) {
        loadUserCars()
      }
    }
  }, [contract, isConnected, account, loadAllCars, loadCarsForSale, loadUserCars])

  return {
    // Data
    cars,
    userCars,
    carsForSale,
    selectedCar,
    isLoading,
    error,

    // Actions
    createNewCar,
    sellCar,
    purchaseCar,
    cancelCarSale,
    getCarById,

    // Data loading
    loadAllCars,
    loadUserCars,
    loadCarsForSale,
    refreshAllData,

    // Utilities
    isOwner,
    canCreateCar,
    canSellCar,
    canBuyCar,
    canCancelSale,
    getStats,
    searchCars,

    // Clear selection
    clearSelectedCar: () => setSelectedCar(null),
  }
}
