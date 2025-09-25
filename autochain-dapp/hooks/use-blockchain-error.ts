"use client"

import { useToast } from "@/hooks/use-toast"

export interface BlockchainError {
  code?: string | number
  message: string
  reason?: string
  transaction?: {
    hash?: string
    data?: string
  }
}

export function useBlockchainError() {
  const { toast } = useToast()

  const parseBlockchainError = (error: any): BlockchainError => {
    console.error("Erreur blockchain brute:", error)

    // Si c'est déjà un objet d'erreur structuré
    if (error.code && error.message) {
      return {
        code: error.code,
        message: error.message,
        reason: error.reason,
        transaction: error.transaction,
      }
    }

    // Erreurs communes de MetaMask/Ethereum
    if (error.code === 4001) {
      return {
        code: 4001,
        message: "Transaction rejetée par l'utilisateur",
        reason: "USER_REJECTED",
      }
    }

    if (error.code === -32603) {
      return {
        code: -32603,
        message: "Erreur interne du serveur RPC",
        reason: "INTERNAL_ERROR",
      }
    }

    // Erreurs de gas
    if (error.message?.includes("insufficient funds")) {
      return {
        code: "INSUFFICIENT_FUNDS",
        message: "Fonds insuffisants pour effectuer la transaction",
        reason: "INSUFFICIENT_FUNDS",
      }
    }

    if (error.message?.includes("gas required exceeds allowance")) {
      return {
        code: "GAS_LIMIT",
        message: "Limite de gas dépassée",
        reason: "GAS_LIMIT_EXCEEDED",
      }
    }

    // Erreurs du smart contract (require statements)
    if (error.message?.includes("execution reverted")) {
      const revertReason = extractRevertReason(error.message)
      return {
        code: "CONTRACT_REVERT",
        message: revertReason || "Transaction annulée par le smart contract",
        reason: "CONTRACT_REVERT",
      }
    }

    // Erreurs de réseau
    if (error.message?.includes("network")) {
      return {
        code: "NETWORK_ERROR",
        message: "Erreur de réseau. Vérifiez votre connexion à la blockchain",
        reason: "NETWORK_ERROR",
      }
    }

    // Erreur générique
    return {
      code: "UNKNOWN",
      message: error.message || "Erreur inconnue lors de la transaction",
      reason: "UNKNOWN",
    }
  }

  const extractRevertReason = (errorMessage: string): string | null => {
    // Patterns pour extraire le message d'erreur du contrat
    const patterns = [
      /execution reverted: (.+)/,
      /Error: (.+)/,
      /reverted with reason string '(.+)'/,
      /VM Exception while processing transaction: revert (.+)/,
    ]

    for (const pattern of patterns) {
      const match = errorMessage.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return null
  }

  const handleError = (error: any, defaultMessage?: string) => {
    const parsed = parseBlockchainError(error)
    
    const userFriendlyMessage = getUserFriendlyMessage(parsed.message)
    
    toast({
      title: "Erreur de transaction",
      description: userFriendlyMessage || defaultMessage || parsed.message,
      variant: "destructive",
    })

    return parsed
  }

  const getUserFriendlyMessage = (message: string): string => {
    // Traductions des messages du smart contract français vers des messages plus conviviaux
    const translations: Record<string, string> = {
      "Vous n'etes pas constructeur certifie": "Vous devez être un constructeur certifié pour effectuer cette action",
      "Voiture inexistante": "Cette voiture n'existe pas",
      "Vous n'etes pas le proprietaire actuel": "Vous n'êtes pas le propriétaire de cette voiture",
      "Prix doit etre > 0": "Le prix doit être supérieur à 0",
      "Voiture non en vente": "Cette voiture n'est pas en vente",
      "Impossible d'acheter votre propre voiture": "Vous ne pouvez pas acheter votre propre voiture",
      "Valeur envoyee insuffisante": "Le montant envoyé est insuffisant",
      "Echec du virement au vendeur": "Échec du transfert des fonds au vendeur",
      "Echec remboursement excedent": "Échec du remboursement de l'excédent",
      "Seul l'admin peut appeler": "Seul l'administrateur peut effectuer cette action",
      "Pas un constructeur": "Cette adresse n'est pas un constructeur certifié",
      "Adresse invalide": "Adresse invalide",
      "Aucun proprietaire": "Cette voiture n'a pas de propriétaire",
      "Voiture vide": "Cette voiture n'a pas d'historique",
      "Voiture pas en vente": "Cette voiture n'est pas en vente",
      "Reentrant call": "Appel réentrant détecté - transaction bloquée pour la sécurité",
    }

    // Chercher une traduction exacte
    if (translations[message]) {
      return translations[message]
    }

    // Chercher une traduction partielle
    for (const [original, friendly] of Object.entries(translations)) {
      if (message.includes(original)) {
        return friendly
      }
    }

    return message
  }

  const showTransactionPending = (txHash?: string) => {
    toast({
      title: "Transaction en cours",
      description: txHash 
        ? `Transaction soumise: ${txHash.slice(0, 10)}...`
        : "Transaction en attente de confirmation...",
    })
  }

  const showTransactionSuccess = (message: string, txHash?: string) => {
    toast({
      title: "Transaction réussie",
      description: txHash 
        ? `${message} - TX: ${txHash.slice(0, 10)}...`
        : message,
    })
  }

  return {
    handleError,
    parseBlockchainError,
    showTransactionPending,
    showTransactionSuccess,
  }
}