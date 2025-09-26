"use client"

import { useState, useEffect, useCallback } from "react"
import { useWeb3 } from "./use-web3"
import { getConstructorInfo, type ConstructorInfo } from "@/lib/constructors"
import { 
  addConstructor, 
  removeConstructor, 
  checkConstructorStatus,
  checkAllConstructorsStatus,
  initializeCertifiedConstructors,
  CERTIFIED_CONSTRUCTORS
} from "@/lib/web3"

export function useConstructor() {
  const { account, userRole, isConnected, contract, web3 } = useWeb3()
  const [constructorInfo, setConstructorInfo] = useState<ConstructorInfo | null>(null)
  const [isConstructor, setIsConstructor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Créer un signer à partir du provider web3
  const getSigner = useCallback(async () => {
    if (!web3 || !account) {
      throw new Error("Web3 provider ou compte non disponible")
    }
    return await web3.getSigner(account)
  }, [web3, account])

  useEffect(() => {
    if (isConnected && account && userRole === "constructor") {
      const info = getConstructorInfo(account)
      setConstructorInfo(info)
      setIsConstructor(true)

      console.log("[v0] Constructeur détecté:", info?.name || "Inconnu")
    } else {
      setConstructorInfo(null)
      setIsConstructor(false)
    }
  }, [account, userRole, isConnected])

  // Fonction pour ajouter un constructeur (admin seulement)
  const handleAddConstructor = useCallback(async (constructorAddress: string) => {
    if (!contract) {
      throw new Error("Contrat non disponible")
    }

    setIsLoading(true)
    try {
      const signer = await getSigner()
      const result = await addConstructor(contract, constructorAddress, signer)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [contract, getSigner])

  // Fonction pour supprimer un constructeur (admin seulement)
  const handleRemoveConstructor = useCallback(async (constructorAddress: string) => {
    if (!contract) {
      throw new Error("Contrat non disponible")
    }

    setIsLoading(true)
    try {
      const signer = await getSigner()
      const result = await removeConstructor(contract, constructorAddress, signer)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [contract, getSigner])

  // Fonction pour vérifier le statut d'un constructeur
  const handleCheckConstructorStatus = useCallback(async (address: string) => {
    if (!contract) {
      throw new Error("Contrat non disponible")
    }

    return await checkConstructorStatus(contract, address)
  }, [contract])

  // Fonction pour vérifier tous les constructeurs certifiés
  const handleCheckAllConstructors = useCallback(async () => {
    if (!contract) {
      throw new Error("Contrat non disponible")
    }

    setIsLoading(true)
    try {
      return await checkAllConstructorsStatus(contract)
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // Fonction pour initialiser tous les constructeurs certifiés
  const handleInitializeCertifiedConstructors = useCallback(async () => {
    if (!contract) {
      throw new Error("Contrat non disponible")
    }

    setIsLoading(true)
    try {
      const signer = await getSigner()
      const result = await initializeCertifiedConstructors(contract, signer)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [contract, getSigner])

  return {
    // États existants
    constructorInfo,
    isConstructor,
    constructorName: constructorInfo?.name || "Constructeur Inconnu",
    constructorBrand: constructorInfo?.brand || "Marque Inconnue",
    constructorLogo: constructorInfo?.logo,
    constructorDescription: constructorInfo?.description || "",
    constructorWebsite: constructorInfo?.website,
    primaryColor: constructorInfo?.primaryColor || "#6b7280",
    secondaryColor: constructorInfo?.secondaryColor || "#f9fafb",
    
    // Nouveaux états et fonctions d'administration
    isLoading,
    certifiedConstructors: CERTIFIED_CONSTRUCTORS,
    
    // Fonctions d'administration
    addConstructor: handleAddConstructor,
    removeConstructor: handleRemoveConstructor,
    checkConstructorStatus: handleCheckConstructorStatus,
    checkAllConstructors: handleCheckAllConstructors,
    initializeCertifiedConstructors: handleInitializeCertifiedConstructors,
  }
}
