"use client"

import { ethers } from "ethers"
import { Car, handleBlockchainError } from "./web3"

export interface TransactionResult {
  success: boolean
  txHash?: string
  error?: string
}

export interface CarCreationResult extends TransactionResult {
  carId?: number
}

export class AutoChainService {
  private contract: ethers.Contract
  private provider: ethers.BrowserProvider

  constructor(contract: ethers.Contract, provider: ethers.BrowserProvider) {
    this.contract = contract
    this.provider = provider
  }

  // Créer une nouvelle voiture (constructeurs uniquement)
  async createCar(vin: string, marque: string, modele: string): Promise<CarCreationResult> {
    try {
      // Validation des entrées
      if (!vin || !marque || !modele) {
        return {
          success: false,
          error: "Tous les champs sont obligatoires"
        }
      }

      if (vin.length < 17) {
        return {
          success: false,
          error: "Le VIN doit contenir au moins 17 caractères"
        }
      }

      const tx = await this.contract.createCar(vin, marque, modele)
      const receipt = await tx.wait()

      // Extraire l'ID du véhicule depuis les événements
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log)
          return parsed?.name === "CarCreated"
        } catch {
          return false
        }
      })

      let carId: number | undefined
      if (event) {
        const parsed = this.contract.interface.parseLog(event)
        carId = Number(parsed?.args[0])
      }

      return {
        success: true,
        txHash: tx.hash,
        carId
      }
    } catch (error: any) {
      return {
        success: false,
        error: handleBlockchainError(error)
      }
    }
  }

  // Mettre une voiture en vente
  async putCarForSale(carId: number, priceInEth: string): Promise<TransactionResult> {
    try {
      // Validation du prix
      const price = parseFloat(priceInEth)
      if (isNaN(price) || price <= 0) {
        return {
          success: false,
          error: "Le prix doit être un nombre positif"
        }
      }

      const priceInWei = ethers.parseEther(priceInEth)
      const tx = await this.contract.putCarForSale(carId, priceInWei)
      await tx.wait()

      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        error: handleBlockchainError(error)
      }
    }
  }

  // Acheter une voiture
  async buyCar(carId: number, priceInWei: string): Promise<TransactionResult> {
    try {
      // Vérifier que l'utilisateur a suffisamment de fonds
      const signer = await this.provider.getSigner()
      const balance = await this.provider.getBalance(signer.address)
      
      if (balance < BigInt(priceInWei)) {
        return {
          success: false,
          error: "Fonds insuffisants pour acheter cette voiture"
        }
      }

      const tx = await this.contract.buyCar(carId, { value: priceInWei })
      await tx.wait()

      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        error: handleBlockchainError(error)
      }
    }
  }

  // Annuler la vente d'une voiture
  async cancelCarSale(carId: number): Promise<TransactionResult> {
    try {
      const tx = await this.contract.cancelSale(carId)
      await tx.wait()

      return {
        success: true,
        txHash: tx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        error: handleBlockchainError(error)
      }
    }
  }

  // Obtenir les détails d'une voiture
  async getCar(carId: number): Promise<Car | null> {
    try {
      const result = await this.contract.getCar(carId)
      const history = await this.contract.getCarHistory(carId)

      return {
        id: Number(result[0]),
        vin: result[1],
        marque: result[2],
        modele: result[3],
        enVente: result[4],
        prix: result[5].toString(),
        proprietaires: history,
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération du véhicule:", error)
      return null
    }
  }

  // Obtenir toutes les voitures en vente
  async getCarsForSale(): Promise<Car[]> {
    try {
      const carIds = await this.contract.getCarsForSale()
      const cars: Car[] = []

      for (const carId of carIds) {
        try {
          const car = await this.getCar(Number(carId))
          if (car) {
            cars.push(car)
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération du véhicule ${carId}:`, error)
        }
      }

      return cars
    } catch (error: any) {
      console.error("Erreur lors de la récupération des véhicules en vente:", error)
      return []
    }
  }

  // Obtenir les voitures d'un utilisateur
  async getUserCars(userAccount: string): Promise<Car[]> {
    try {
      const nextCarId = await this.contract.nextCarId()
      const userCars: Car[] = []

      for (let i = 1; i < nextCarId; i++) {
        try {
          const owner = await this.contract.ownerOf(i)
          if (owner.toLowerCase() === userAccount.toLowerCase()) {
            const car = await this.getCar(i)
            if (car) {
              userCars.push(car)
            }
          }
        } catch (error) {
          // Véhicule peut ne pas exister, continuer
          continue
        }
      }

      return userCars
    } catch (error: any) {
      console.error("Erreur lors de la récupération des véhicules de l'utilisateur:", error)
      return []
    }
  }

  // Obtenir l'historique d'une voiture
  async getCarHistory(carId: number): Promise<string[]> {
    try {
      return await this.contract.getCarHistory(carId)
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'historique:", error)
      return []
    }
  }

  // Vérifier si l'utilisateur est propriétaire d'une voiture
  async isCarOwner(carId: number, userAccount: string): Promise<boolean> {
    try {
      const owner = await this.contract.ownerOf(carId)
      return owner.toLowerCase() === userAccount.toLowerCase()
    } catch (error) {
      return false
    }
  }

  // Obtenir le propriétaire actuel d'une voiture
  async getCarOwner(carId: number): Promise<string | null> {
    try {
      return await this.contract.ownerOf(carId)
    } catch (error) {
      return null
    }
  }

  // Obtenir les statistiques du contrat
  async getContractStats(): Promise<{
    totalCars: number
    carsForSale: number
    totalTransactions: number
  }> {
    try {
      const nextCarId = await this.contract.nextCarId()
      const totalCars = Number(nextCarId) - 1
      
      const carsForSaleIds = await this.contract.getCarsForSale()
      const carsForSale = carsForSaleIds.length

      return {
        totalCars,
        carsForSale,
        totalTransactions: 0 // Cette valeur pourrait être calculée en écoutant les événements
      }
    } catch (error) {
      return {
        totalCars: 0,
        carsForSale: 0,
        totalTransactions: 0
      }
    }
  }

  // Vérifier si l'utilisateur est un constructeur
  async isConstructor(address: string): Promise<boolean> {
    try {
      return await this.contract.isConstructor(address)
    } catch (error) {
      return false
    }
  }

  // Obtenir l'adresse de l'admin
  async getAdmin(): Promise<string | null> {
    try {
      return await this.contract.admin()
    } catch (error) {
      return null
    }
  }

  // Vérifier si l'utilisateur est l'admin
  async isAdmin(address: string): Promise<boolean> {
    try {
      const admin = await this.getAdmin()
      return admin?.toLowerCase() === address.toLowerCase()
    } catch (error) {
      return false
    }
  }
}