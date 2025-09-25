"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "./use-web3"
import { getConstructorInfo, type ConstructorInfo } from "@/lib/constructors"

export function useConstructor() {
  const { account, userRole, isConnected } = useWeb3()
  const [constructorInfo, setConstructorInfo] = useState<ConstructorInfo | null>(null)
  const [isConstructor, setIsConstructor] = useState(false)

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

  return {
    constructorInfo,
    isConstructor,
    constructorName: constructorInfo?.name || "Constructeur Inconnu",
    constructorBrand: constructorInfo?.brand || "Marque Inconnue",
    constructorLogo: constructorInfo?.logo,
    constructorDescription: constructorInfo?.description || "",
    constructorWebsite: constructorInfo?.website,
    primaryColor: constructorInfo?.primaryColor || "#6b7280",
    secondaryColor: constructorInfo?.secondaryColor || "#f9fafb",
  }
}
