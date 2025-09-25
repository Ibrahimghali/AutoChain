"use client"

import { useState, useEffect, useCallback } from "react"
import { useWeb3 } from "./use-web3"
import {
  createCar,
  putCarForSale,
  buyCar,
  getCarsForSale,
  getUserCars,
  getAllCars,
  cancelSale,
  type Car,
} from "@/lib/web3"

export function useCars() {
  const { contract, account, isConnected } = useWeb3()
  const [cars, setCars] = useState<Car[]>([])
  const [userCars, setUserCars] = useState<Car[]>([])
  const [carsForSale, setCarsForSale] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Créer une nouvelle voiture
  const createNewCar = useCallback(
    async (vin: string, marque: string, modele: string) => {
      if (!contract) throw new Error("Contrat non disponible")

      try {
        setError(null)
        const carId = await createCar(contract, vin, marque, modele)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars()])

        return carId
      } catch (err) {
        console.error("Erreur lors de la création:", err)
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [contract, loadAllCars, loadUserCars],
  )

  // Mettre en vente une voiture
  const sellCar = useCallback(
    async (carId: number, priceInEth: string) => {
      if (!contract) throw new Error("Contrat non disponible")

      try {
        setError(null)
        await putCarForSale(contract, carId, priceInEth)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de la mise en vente:", err)
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [contract, loadAllCars, loadUserCars, loadCarsForSale],
  )

  // Acheter une voiture
  const purchaseCar = useCallback(
    async (carId: number, priceInWei: string) => {
      if (!contract) throw new Error("Contrat non disponible")

      try {
        setError(null)
        await buyCar(contract, carId, priceInWei)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de l'achat:", err)
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [contract, loadAllCars, loadUserCars, loadCarsForSale],
  )

  // Annuler la vente d'une voiture
  const cancelCarSale = useCallback(
    async (carId: number) => {
      if (!contract) throw new Error("Contrat non disponible")

      try {
        setError(null)
        await cancelSale(contract, carId)

        // Recharger les données
        await Promise.all([loadAllCars(), loadUserCars(), loadCarsForSale()])
      } catch (err) {
        console.error("Erreur lors de l'annulation:", err)
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [contract, loadAllCars, loadUserCars, loadCarsForSale],
  )

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
    cars,
    userCars,
    carsForSale,
    isLoading,
    error,
    createNewCar,
    sellCar,
    purchaseCar,
    cancelCarSale,
    loadAllCars,
    loadUserCars,
    loadCarsForSale,
  }
}
