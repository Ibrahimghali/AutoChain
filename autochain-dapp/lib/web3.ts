import { ethers } from "ethers"

// Configuration du contrat AutoChain
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x..." // À remplacer par l'adresse déployée
export const CONTRACT_ABI = [
  // Events
  "event ConstructorAdded(address indexed ctor)",
  "event ConstructorRemoved(address indexed ctor)",
  "event CarCreated(uint indexed carId, address indexed creator, string vin)",
  "event CarListed(uint indexed carId, address indexed seller, uint price)",
  "event CarSold(uint indexed carId, address indexed seller, address indexed buyer, uint price)",

  // Admin functions
  "function addConstructor(address ctor) external",
  "function removeConstructor(address ctor) external",

  // Constructor functions
  "function createCar(string memory vin, string memory marque, string memory modele) external returns (uint)",

  // Owner functions
  "function putCarForSale(uint carId, uint prix) external",
  "function cancelSale(uint carId) external",

  // Public functions
  "function buyCar(uint carId) external payable",

  // View functions
  "function isConstructor(address) external view returns (bool)",
  "function getCar(uint carId) external view returns (uint id, string vin, string marque, string modele, bool enVente, uint prix)",
  "function getCarHistory(uint carId) external view returns (address[])",
  "function ownerOf(uint carId) external view returns (address)",
  "function getCarsForSale() external view returns (uint[])",
  "function nextCarId() external view returns (uint)",
]

export interface Car {
  id: number
  vin: string
  marque: string
  modele: string
  enVente: boolean
  prix: string
  owner?: string
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private contract: ethers.Contract | null = null

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé")
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      await this.provider.send("eth_requestAccounts", [])
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer)

      const address = await this.signer.getAddress()
      return address
    } catch (error) {
      console.error("Erreur de connexion:", error)
      throw error
    }
  }

  async isConstructor(address: string): Promise<boolean> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    return await this.contract.isConstructor(address)
  }

  async createCar(vin: string, marque: string, modele: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    return await this.contract.createCar(vin, marque, modele)
  }

  async putCarForSale(carId: number, prix: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    const priceInWei = ethers.parseEther(prix)
    return await this.contract.putCarForSale(carId, priceInWei)
  }

  async buyCar(carId: number, prix: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    const priceInWei = ethers.parseEther(prix)
    return await this.contract.buyCar(carId, { value: priceInWei })
  }

  async getCar(carId: number): Promise<Car> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    const result = await this.contract.getCar(carId)
    return {
      id: Number(result[0]),
      vin: result[1],
      marque: result[2],
      modele: result[3],
      enVente: result[4],
      prix: ethers.formatEther(result[5]),
    }
  }

  async getCarsForSale(): Promise<number[]> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    const result = await this.contract.getCarsForSale()
    return result.map((id: bigint) => Number(id))
  }

  async getCarHistory(carId: number): Promise<string[]> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    return await this.contract.getCarHistory(carId)
  }

  async ownerOf(carId: number): Promise<string> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    return await this.contract.ownerOf(carId)
  }

  async getNextCarId(): Promise<number> {
    if (!this.contract) throw new Error("Contrat non initialisé")
    const result = await this.contract.nextCarId()
    return Number(result)
  }
}

export const web3Service = new Web3Service()
