"use client"

import { useState, useEffect, useCallback } from "react"
import { connectWallet, setupContractListeners, switchToLocalNetwork, type Web3State } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"

export function useWeb3() {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    userRole: null,
    contract: null,
    web3: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialiser la connexion Web3
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (typeof window !== "undefined" && window.ethereum) {
        // Vérifier si déjà connecté
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const state = await connectWallet()
          setWeb3State(state)

          // Configurer les listeners d'événements
          if (state.contract) {
            setupContractListeners(state.contract, (event) => {
              console.log("[v0] Événement blockchain:", event)

              // Afficher des notifications pour les événements importants
              switch (event.type) {
                case "CarCreated":
                  toast({
                    title: "Véhicule créé",
                    description: `Nouveau véhicule créé avec l'ID ${event.carId}`,
                  })
                  break
                case "CarListed":
                  toast({
                    title: "Véhicule mis en vente",
                    description: `Le véhicule ${event.carId} est maintenant en vente`,
                  })
                  break
                case "CarSold":
                  toast({
                    title: "Véhicule vendu",
                    description: `Le véhicule ${event.carId} a été vendu`,
                  })
                  break
              }
            })
          }
        }
      }
    } catch (err) {
      console.error("[v0] Erreur d'initialisation Web3:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Connecter le portefeuille
  const connect = useCallback(async () => {
    try {
      setError(null)

      // Essayer de basculer vers le réseau local Ganache
      try {
        await switchToLocalNetwork()
      } catch (networkError) {
        console.log("[v0] Réseau local non disponible, utilisation du réseau actuel")
      }

      const state = await connectWallet()
      setWeb3State(state)

      // Configurer les listeners d'événements
      if (state.contract) {
        setupContractListeners(state.contract, (event) => {
          console.log("[v0] Événement blockchain:", event)

          // Afficher des notifications pour les événements importants
          switch (event.type) {
            case "CarCreated":
              toast({
                title: "Véhicule créé",
                description: `Nouveau véhicule créé avec l'ID ${event.carId}`,
              })
              break
            case "CarListed":
              toast({
                title: "Véhicule mis en vente",
                description: `Le véhicule ${event.carId} est maintenant en vente`,
              })
              break
            case "CarSold":
              toast({
                title: "Véhicule vendu",
                description: `Le véhicule ${event.carId} a été vendu`,
              })
              break
          }
        })
      }

      toast({
        title: "Connexion réussie",
        description: `Connecté en tant que ${state.userRole === "constructor" ? "constructeur" : "utilisateur"}`,
      })

      return state
    } catch (err) {
      console.error("[v0] Erreur de connexion:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion"
      setError(errorMessage)
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [toast])

  // Déconnecter (réinitialiser l'état)
  const disconnect = useCallback(() => {
    setWeb3State({
      isConnected: false,
      account: null,
      userRole: null,
      contract: null,
      web3: null,
    })
    setError(null)
    toast({
      title: "Déconnecté",
      description: "Portefeuille déconnecté avec succès",
    })
  }, [toast])

  // Écouter les changements de compte MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("[v0] Comptes changés:", accounts)
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== web3State.account) {
          // Reconnecter avec le nouveau compte
          initialize()
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("[v0] Réseau changé:", chainId)
        // Recharger la page lors du changement de réseau
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [web3State.account, disconnect, initialize])

  // Initialiser au montage du composant
  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    ...web3State,
    isLoading,
    error,
    connect,
    disconnect,
    initialize,
  }
}
