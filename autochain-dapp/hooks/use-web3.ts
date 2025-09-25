"use client"

import { useState, useEffect, useCallback } from "react"
import { connectWallet, setupContractListeners, type Web3State } from "@/lib/web3"

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
              console.log("Événement blockchain:", event)
              // Ici, on pourrait mettre à jour l'état local ou déclencher des notifications
            })
          }
        }
      }
    } catch (err) {
      console.error("Erreur d'initialisation Web3:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Connecter le portefeuille
  const connect = useCallback(async () => {
    try {
      setError(null)
      const state = await connectWallet()
      setWeb3State(state)

      // Configurer les listeners d'événements
      if (state.contract) {
        setupContractListeners(state.contract, (event) => {
          console.log("Événement blockchain:", event)
        })
      }

      return state
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError(err instanceof Error ? err.message : "Erreur de connexion")
      throw err
    }
  }, [])

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
  }, [])

  // Écouter les changements de compte MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== web3State.account) {
          // Reconnecter avec le nouveau compte
          initialize()
        }
      }

      const handleChainChanged = () => {
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
