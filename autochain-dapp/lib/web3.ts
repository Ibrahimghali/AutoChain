"use client"

import { ethers } from "ethers"

export interface Car {
  id: number
  vin: string
  marque: string
  modele: string
  enVente: boolean
  prix: string
  proprietaires: string[]
}

export interface Web3State {
  isConnected: boolean
  account: string | null
  userRole: "constructor" | "user" | null
  contract: ethers.Contract | null
  web3: ethers.BrowserProvider | null
}

// Contract ABI complet basé sur le smart contract AutoChain
export const CONTRACT_ABI = [
  // Events
  "event ConstructorAdded(address indexed ctor)",
  "event ConstructorRemoved(address indexed ctor)",
  "event CarCreated(uint indexed carId, address indexed creator, string vin)",
  "event CarListed(uint indexed carId, address indexed seller, uint price)",
  "event CarSold(uint indexed carId, address indexed seller, address indexed buyer, uint price)",

  // Admin functions
  "function admin() view returns (address)",
  "function addConstructor(address ctor)",
  "function removeConstructor(address ctor)",

  // Constructor functions
  "function isConstructor(address) view returns (bool)",
  "function createCar(string vin, string marque, string modele) returns (uint)",

  // Car management
  "function putCarForSale(uint carId, uint prix)",
  "function cancelSale(uint carId)",
  "function buyCar(uint carId) payable",

  // View functions
  "function getCar(uint carId) view returns (uint id, string vin, string marque, string modele, bool enVente, uint prix)",
  "function getCarHistory(uint carId) view returns (address[])",
  "function ownerOf(uint carId) view returns (address)",
  "function getCarsForSale() view returns (uint[])",
  "function nextCarId() view returns (uint)",
]

export const NETWORKS = {
  ganache: {
    chainId: 5777,
    name: "Ganache Local",
    rpcUrl: "http://127.0.0.1:7545",
    contractAddress: "0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    contractAddress: "", // À remplacer lors du déploiement
  },
}

export const getContractAddress = (chainId: number): string => {
  switch (chainId) {
    case 5777:
      return NETWORKS.ganache.contractAddress
    case 1337:
      return NETWORKS.ganache.contractAddress
    case 11155111:
      return NETWORKS.sepolia.contractAddress
    default:
      return NETWORKS.ganache.contractAddress // Par défaut, Ganache local
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export async function connectWallet(): Promise<Web3State> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask non détecté. Veuillez installer MetaMask.")
  }

  try {
    // Demander la connexion à MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (accounts.length === 0) {
      throw new Error("Aucun compte sélectionné")
    }

    const account = accounts[0]

    // Créer le provider et le signer
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const network = await provider.getNetwork()
    const chainId = Number(network.chainId)

    // Vérifier si le réseau est supporté
    const contractAddress = getContractAddress(chainId)
    if (!contractAddress) {
      throw new Error(`Réseau non supporté (Chain ID: ${chainId}). Veuillez vous connecter à Ganache local ou Sepolia.`)
    }

    // Créer l'instance du contrat
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

    // Détecter le rôle de l'utilisateur
    const userRole = await detectUserRole(account, contract)

    return {
      isConnected: true,
      account,
      userRole,
      contract,
      web3: provider,
    }
  } catch (error) {
    console.error("Erreur de connexion:", error)
    throw error
  }
}

async function detectUserRole(account: string, contract: ethers.Contract): Promise<"constructor" | "user"> {
  try {
    // Vérifier si l'utilisateur est un constructeur certifié
    const isConstructor = await contract.isConstructor(account)
    if (isConstructor) {
      return "constructor"
    }

    // Tous les autres utilisateurs sont des utilisateurs normaux
    return "user"
  } catch (error) {
    console.error("Erreur de détection du rôle:", error)
    // Par défaut, considérer comme utilisateur normal
    return "user"
  }
}

export async function createCar(
  contract: ethers.Contract,
  vin: string,
  marque: string,
  modele: string,
): Promise<number> {
  try {
    const tx = await contract.createCar(vin, marque, modele)
    const receipt = await tx.wait()

    // Extraire l'ID du véhicule depuis les événements
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log)
        return parsed?.name === "CarCreated"
      } catch {
        return false
      }
    })

    if (event) {
      const parsed = contract.interface.parseLog(event)
      return Number(parsed?.args[0])
    }

    throw new Error("Impossible de récupérer l'ID du véhicule créé")
  } catch (error) {
    console.error("Erreur lors de la création:", error)
    throw error
  }
}

export async function putCarForSale(contract: ethers.Contract, carId: number, priceInEth: string): Promise<void> {
  try {
    const priceInWei = ethers.parseEther(priceInEth)
    const tx = await contract.putCarForSale(carId, priceInWei)
    await tx.wait()
  } catch (error) {
    console.error("Erreur lors de la mise en vente:", error)
    throw error
  }
}

export async function buyCar(contract: ethers.Contract, carId: number, priceInWei: string): Promise<void> {
  try {
    const tx = await contract.buyCar(carId, { value: priceInWei })
    await tx.wait()
  } catch (error) {
    console.error("Erreur lors de l'achat:", error)
    throw error
  }
}

export async function getCar(contract: ethers.Contract, carId: number): Promise<Car> {
  try {
    const result = await contract.getCar(carId)
    const history = await contract.getCarHistory(carId)

    return {
      id: Number(result[0]),
      vin: result[1],
      marque: result[2],
      modele: result[3],
      enVente: result[4],
      prix: result[5].toString(),
      proprietaires: history,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du véhicule:", error)
    throw error
  }
}

export async function getCarsForSale(contract: ethers.Contract): Promise<Car[]> {
  try {
    const carIds = await contract.getCarsForSale()
    const cars: Car[] = []

    for (const carId of carIds) {
      try {
        const car = await getCar(contract, Number(carId))
        cars.push(car)
      } catch (error) {
        console.error(`Erreur lors de la récupération du véhicule ${carId}:`, error)
      }
    }

    return cars
  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules en vente:", error)
    throw error
  }
}

export async function getUserCars(contract: ethers.Contract, userAccount: string): Promise<Car[]> {
  try {
    const nextCarId = await contract.nextCarId()
    const userCars: Car[] = []

    for (let i = 1; i < nextCarId; i++) {
      try {
        const owner = await contract.ownerOf(i)
        if (owner.toLowerCase() === userAccount.toLowerCase()) {
          const car = await getCar(contract, i)
          userCars.push(car)
        }
      } catch (error) {
        // Véhicule peut ne pas exister, continuer
        continue
      }
    }

    return userCars
  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules de l'utilisateur:", error)
    throw error
  }
}

export async function cancelSale(contract: ethers.Contract, carId: number): Promise<void> {
  try {
    const tx = await contract.cancelSale(carId)
    await tx.wait()
  } catch (error) {
    console.error("Erreur lors de l'annulation de la vente:", error)
    throw error
  }
}

export async function getAllCars(contract: ethers.Contract): Promise<Car[]> {
  try {
    const nextCarId = await contract.nextCarId()
    const allCars: Car[] = []

    for (let i = 1; i < nextCarId; i++) {
      try {
        const car = await getCar(contract, i)
        allCars.push(car)
      } catch (error) {
        // Véhicule peut ne pas exister, continuer
        continue
      }
    }

    return allCars
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les véhicules:", error)
    throw error
  }
}

export async function isAdmin(contract: ethers.Contract, userAccount: string): Promise<boolean> {
  try {
    const adminAddress = await contract.admin()
    return adminAddress.toLowerCase() === userAccount.toLowerCase()
  } catch (error) {
    console.error("Erreur lors de la vérification admin:", error)
    return false
  }
}

export function formatEther(wei: string): string {
  try {
    return ethers.formatEther(wei)
  } catch (error) {
    console.error("Erreur de formatage:", error)
    return "0"
  }
}

export function parseEther(ether: string): string {
  try {
    return ethers.parseEther(ether).toString()
  } catch (error) {
    console.error("Erreur de parsing:", error)
    return "0"
  }
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Hook pour écouter les événements du contrat
export function setupContractListeners(contract: ethers.Contract, callback: (event: any) => void) {
  // Écouter les événements de création de véhicule
  contract.on("CarCreated", (carId, creator, vin, event) => {
    callback({
      type: "CarCreated",
      carId: Number(carId),
      creator,
      vin,
      event,
    })
  })

  // Écouter les événements de mise en vente
  contract.on("CarListed", (carId, seller, price, event) => {
    callback({
      type: "CarListed",
      carId: Number(carId),
      seller,
      price: price.toString(),
      event,
    })
  })

  // Écouter les événements de vente
  contract.on("CarSold", (carId, seller, buyer, price, event) => {
    callback({
      type: "CarSold",
      carId: Number(carId),
      seller,
      buyer,
      price: price.toString(),
      event,
    })
  })

  // Écouter les événements d'ajout de constructeur
  contract.on("ConstructorAdded", (ctor, event) => {
    callback({
      type: "ConstructorAdded",
      constructor: ctor,
      event,
    })
  })

  // Écouter les événements de suppression de constructeur
  contract.on("ConstructorRemoved", (ctor, event) => {
    callback({
      type: "ConstructorRemoved",
      constructor: ctor,
      event,
    })
  })

  // Fonction de nettoyage
  return () => {
    contract.removeAllListeners()
  }
}

// Vérifier si MetaMask est installé
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// Demander à l'utilisateur d'ajouter le réseau Ethereum (si nécessaire)
export async function switchToLocalNetwork(): Promise<void> {
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x539" }], // Ganache default chain ID (1337)
    })
  } catch (error: any) {
    // Si le réseau n'est pas ajouté, le proposer
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x539",
            chainName: "Ganache Local",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:7545"],
            blockExplorerUrls: null,
          },
        ],
      })
    }
  }
}

export async function switchToGanacheNetwork(): Promise<void> {
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x539" }], // 1337 en hexadécimal
    })
  } catch (error: any) {
    // Si le réseau n'est pas ajouté, le proposer
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x539",
            chainName: "Ganache Local",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:7545"],
            blockExplorerUrls: [],
          },
        ],
      })
    }
  }
}

export async function switchToSepoliaNetwork(): Promise<void> {
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // 11155111 en hexadécimal
    })
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia Testnet",
            nativeCurrency: {
              name: "Sepolia Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_KEY"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      })
    }
  }
}

export async function getCurrentNetwork(): Promise<{ chainId: number; name: string; isSupported: boolean }> {
  if (!window.ethereum) {
    throw new Error("MetaMask non détecté")
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const network = await provider.getNetwork()
  const chainId = Number(network.chainId)

  let name = "Réseau inconnu"
  let isSupported = false

  switch (chainId) {
    case 1337:
      name = "Ganache Local"
      isSupported = true
      break
    case 11155111:
      name = "Sepolia Testnet"
      isSupported = true
      break
    default:
      name = `Réseau personnalisé (${chainId})`
      isSupported = false
  }

  return { chainId, name, isSupported }
}

export async function getBalance(provider: ethers.BrowserProvider, address: string): Promise<string> {
  try {
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error)
    return "0"
  }
}

export function handleBlockchainError(error: any): string {
  if (error.code === 4001) {
    return "Transaction rejetée par l'utilisateur"
  }

  if (error.code === -32603) {
    return "Erreur interne de la blockchain"
  }

  if (error.message?.includes("insufficient funds")) {
    return "Fonds insuffisants pour cette transaction"
  }

  if (error.message?.includes("execution reverted")) {
    // Extraire le message d'erreur du smart contract
    const revertReason = error.message.match(/reverted with reason string '(.*)'/)?.[1]
    if (revertReason) {
      return revertReason
    }
    return "Transaction échouée : vérifiez les conditions du smart contract"
  }

  if (error.message?.includes("user rejected")) {
    return "Transaction annulée par l'utilisateur"
  }

  return error.message || "Erreur inconnue lors de la transaction"
}

// Adresses des constructeurs certifiés
export const CERTIFIED_CONSTRUCTORS = [
  "0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998",
  "0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa"
]

/**
 * Ajoute un constructeur au contrat (seul l'admin peut le faire)
 */
export async function addConstructor(
  contract: ethers.Contract,
  constructorAddress: string,
  signer: ethers.Signer
): Promise<{ success: boolean; message: string; txHash?: string }> {
  try {
    console.log(`Ajout du constructeur: ${constructorAddress}`)
    
    // Vérifier que l'adresse est valide
    if (!ethers.isAddress(constructorAddress)) {
      return { success: false, message: "Adresse invalide" }
    }

    // Vérifier si le constructeur n'est pas déjà ajouté
    const isAlreadyConstructor = await contract.isConstructor(constructorAddress)
    if (isAlreadyConstructor) {
      return { success: false, message: "Cette adresse est déjà un constructeur certifié" }
    }

    // Ajouter le constructeur - cast vers any pour éviter les erreurs TypeScript
    const contractWithMethods = contract as any
    const tx = await contractWithMethods.connect(signer).addConstructor(constructorAddress)
    const receipt = await tx.wait()

    console.log(`Constructeur ajouté avec succès. Hash: ${receipt.hash}`)
    return { 
      success: true, 
      message: "Constructeur ajouté avec succès", 
      txHash: receipt.hash 
    }
  } catch (error: any) {
    console.error("Erreur lors de l'ajout du constructeur:", error)
    return { 
      success: false, 
      message: handleBlockchainError(error) 
    }
  }
}

/**
 * Supprime un constructeur du contrat (seul l'admin peut le faire)
 */
export async function removeConstructor(
  contract: ethers.Contract,
  constructorAddress: string,
  signer: ethers.Signer
): Promise<{ success: boolean; message: string; txHash?: string }> {
  try {
    console.log(`Suppression du constructeur: ${constructorAddress}`)
    
    // Vérifier que l'adresse est valide
    if (!ethers.isAddress(constructorAddress)) {
      return { success: false, message: "Adresse invalide" }
    }

    // Vérifier que le constructeur existe
    const isConstructor = await contract.isConstructor(constructorAddress)
    if (!isConstructor) {
      return { success: false, message: "Cette adresse n'est pas un constructeur certifié" }
    }

    // Supprimer le constructeur - cast vers any pour éviter les erreurs TypeScript
    const contractWithMethods = contract as any
    const tx = await contractWithMethods.connect(signer).removeConstructor(constructorAddress)
    const receipt = await tx.wait()

    console.log(`Constructeur supprimé avec succès. Hash: ${receipt.hash}`)
    return { 
      success: true, 
      message: "Constructeur supprimé avec succès", 
      txHash: receipt.hash 
    }
  } catch (error: any) {
    console.error("Erreur lors de la suppression du constructeur:", error)
    return { 
      success: false, 
      message: handleBlockchainError(error) 
    }
  }
}

/**
 * Vérifie si une adresse est un constructeur certifié
 */
export async function checkConstructorStatus(
  contract: ethers.Contract,
  address: string
): Promise<{ isConstructor: boolean; address: string }> {
  try {
    const isConstructor = await contract.isConstructor(address)
    return { isConstructor, address }
  } catch (error: any) {
    console.error("Erreur lors de la vérification du statut constructeur:", error)
    return { isConstructor: false, address }
  }
}

/**
 * Ajoute tous les constructeurs certifiés au contrat
 */
export async function initializeCertifiedConstructors(
  contract: ethers.Contract,
  signer: ethers.Signer
): Promise<{ success: boolean; results: Array<{ address: string; success: boolean; message: string }> }> {
  console.log("Initialisation des constructeurs certifiés...")
  
  const results = []
  let overallSuccess = true

  for (const constructorAddress of CERTIFIED_CONSTRUCTORS) {
    const result = await addConstructor(contract, constructorAddress, signer)
    results.push({
      address: constructorAddress,
      success: result.success,
      message: result.message
    })
    
    if (!result.success) {
      overallSuccess = false
    }
    
    // Petit délai entre les transactions pour éviter les problèmes de nonce
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return { success: overallSuccess, results }
}

/**
 * Vérifie le statut de tous les constructeurs certifiés
 */
export async function checkAllConstructorsStatus(
  contract: ethers.Contract
): Promise<Array<{ address: string; isConstructor: boolean }>> {
  const results = []
  
  for (const address of CERTIFIED_CONSTRUCTORS) {
    const status = await checkConstructorStatus(contract, address)
    results.push(status)
  }
  
  return results
}
