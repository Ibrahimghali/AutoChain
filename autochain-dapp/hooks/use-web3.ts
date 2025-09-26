"use client"

import { useState, useEffect, useCallback } from "react"
import { web3Service } from "@/lib/web3"

export interface Web3State {
  account: string | null
  isConstructor: boolean
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    isConstructor: false,
    isConnected: false,
    isLoading: false,
    error: null,
  })

  const connectWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const account = await web3Service.connectWallet()
      const isConstructor = await web3Service.isConstructor(account)

      setState({
        account,
        isConstructor,
        isConnected: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de connexion",
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      account: null,
      isConstructor: false,
      isConnected: false,
      isLoading: false,
      error: null,
    })
  }, [])

  // Écouter les changements de compte MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          connectWallet()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [connectWallet, disconnect])

  return {
    ...state,
    connectWallet,
    disconnect,
  }
}
