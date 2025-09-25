# Services and Utilities Documentation

The `lib/` directory contains utility functions, services, and business logic that power the AutoChain dApp.

## Directory Structure

```
lib/
├── autochain-service.ts           # Business logic for AutoChain operations
├── utils.ts                       # General utility functions
└── web3.ts                        # Web3 utilities and blockchain interactions
```

## Core Services

### AutoChain Service (`autochain-service.ts`)

**Purpose**: Provides a high-level interface for interacting with the AutoChain smart contract.

**Class Structure**:
```typescript
export class AutoChainService {
  constructor(contract: Contract, web3: Web3)
  
  // User role management
  async isConstructor(address: string): Promise<boolean>
  async isAdmin(address: string): Promise<boolean>
  
  // Vehicle management
  async createCar(carData: CarData): Promise<TransactionResult>
  async getCar(carId: number): Promise<Car>
  async getUserCars(userAddress: string): Promise<Car[]>
  async getCarsForSale(): Promise<Car[]>
  
  // Transaction operations
  async buyCar(carId: number, value: string): Promise<TransactionResult>
  async sellCar(carId: number, price: string): Promise<TransactionResult>
  
  // Statistics and data
  async getContractStats(): Promise<ContractStats>
  async getCarHistory(carId: number): Promise<Transaction[]>
}
```

**Key Methods**:

#### User Role Methods
```typescript
// Check if address is authorized constructor
async isConstructor(address: string): Promise<boolean> {
  return await this.contract.methods.isConstructor(address).call()
}

// Check if address is contract admin
async isAdmin(address: string): Promise<boolean> {
  const admin = await this.contract.methods.admin().call()
  return admin.toLowerCase() === address.toLowerCase()
}
```

#### Vehicle Management
```typescript
// Create new vehicle (constructor only)
async createCar(carData: CarData): Promise<TransactionResult> {
  const { vin, marque, modele } = carData
  
  const gasEstimate = await this.contract.methods
    .creerVoiture(vin, marque, modele)
    .estimateGas({ from: this.web3.eth.defaultAccount })
  
  return await this.contract.methods
    .creerVoiture(vin, marque, modele)
    .send({ 
      from: this.web3.eth.defaultAccount,
      gas: gasEstimate * 1.2 // Add 20% buffer
    })
}

// Get vehicles owned by user
async getUserCars(userAddress: string): Promise<Car[]> {
  const totalCars = await this.contract.methods.nextCarId().call()
  const userCars: Car[] = []
  
  for (let i = 1; i < totalCars; i++) {
    const car = await this.getCar(i)
    if (car.proprietaires.includes(userAddress.toLowerCase())) {
      userCars.push(car)
    }
  }
  
  return userCars
}
```

#### Transaction Operations
```typescript
// Purchase vehicle
async buyCar(carId: number, value: string): Promise<TransactionResult> {
  const gasEstimate = await this.contract.methods
    .acheterVoiture(carId)
    .estimateGas({ 
      from: this.web3.eth.defaultAccount,
      value: this.web3.utils.toWei(value, 'ether')
    })
  
  return await this.contract.methods
    .acheterVoiture(carId)
    .send({
      from: this.web3.eth.defaultAccount,
      value: this.web3.utils.toWei(value, 'ether'),
      gas: gasEstimate * 1.2
    })
}

// List vehicle for sale
async sellCar(carId: number, price: string): Promise<TransactionResult> {
  const priceInWei = this.web3.utils.toWei(price, 'ether')
  
  return await this.contract.methods
    .mettreEnVente(carId, priceInWei)
    .send({ from: this.web3.eth.defaultAccount })
}
```

**Error Handling**:
```typescript
try {
  const result = await this.createCar(carData)
  return { success: true, transactionHash: result.transactionHash }
} catch (error) {
  if (error.code === 4001) {
    throw new Error('User rejected transaction')
  } else if (error.message.includes('revert')) {
    throw new Error('Smart contract validation failed')
  } else {
    throw new Error(`Transaction failed: ${error.message}`)
  }
}
```

### Web3 Utilities (`web3.ts`)

**Purpose**: Provides low-level Web3 functionality and blockchain utilities.

**Key Interfaces**:
```typescript
export interface Web3State {
  isConnected: boolean
  account: string | null
  userRole: 'constructor' | 'user' | 'admin' | null
  contract: Contract | null
  web3: Web3 | null
}

export interface Car {
  id: number
  vin: string
  marque: string
  modele: string
  proprietaires: string[]
  enVente: boolean
  prix: string
}

export interface TransactionResult {
  transactionHash: string
  blockNumber: number
  gasUsed: number
  status: boolean
}
```

**Core Functions**:

#### Wallet Connection
```typescript
export async function connectWallet(): Promise<Web3State> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed')
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    
    if (accounts.length === 0) {
      throw new Error('No accounts available')
    }
    
    const web3 = new Web3(window.ethereum)
    const account = accounts[0]
    
    // Load contract
    const contract = await loadContract(web3)
    
    // Determine user role
    const userRole = await determineUserRole(contract, account)
    
    return {
      isConnected: true,
      account,
      userRole,
      contract,
      web3
    }
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`)
  }
}
```

#### Contract Loading
```typescript
async function loadContract(web3: Web3): Promise<Contract> {
  try {
    // Load contract ABI and address
    const contractData = await fetch('/build/contracts/AutoChain.json')
    const contractJson = await contractData.json()
    
    // Get network ID
    const networkId = await web3.eth.net.getId()
    const deployedNetwork = contractJson.networks[networkId]
    
    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`)
    }
    
    return new web3.eth.Contract(
      contractJson.abi,
      deployedNetwork.address
    )
  } catch (error) {
    throw new Error(`Failed to load contract: ${error.message}`)
  }
}
```

#### Event Listening
```typescript
export function setupContractListeners(
  contract: Contract,
  onEvent: (event: ContractEvent) => void
): void {
  // Listen for CarCreated events
  contract.events.CarCreated({}, (error, event) => {
    if (error) {
      console.error('CarCreated event error:', error)
      return
    }
    
    onEvent({
      type: 'CarCreated',
      data: event.returnValues,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    })
  })
  
  // Listen for CarSold events
  contract.events.CarSold({}, (error, event) => {
    if (error) {
      console.error('CarSold event error:', error)
      return
    }
    
    onEvent({
      type: 'CarSold',
      data: event.returnValues,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    })
  })
  
  // Additional event listeners...
}
```

#### Utility Functions
```typescript
// Format ETH amounts for display
export function formatEther(wei: string | number): string {
  const eth = Web3.utils.fromWei(wei.toString(), 'ether')
  return parseFloat(eth).toFixed(4)
}

// Shorten Ethereum addresses
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Convert ETH to USD (mock implementation)
export async function ethToUsd(ethAmount: string): Promise<number> {
  // In real implementation, fetch from price API
  const ethPrice = 2000 // Mock price
  return parseFloat(ethAmount) * ethPrice
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return Web3.utils.isAddress(address)
}

// Get transaction receipt
export async function getTransactionReceipt(
  web3: Web3,
  txHash: string
): Promise<TransactionReceipt> {
  let receipt = null
  let attempts = 0
  const maxAttempts = 30
  
  while (!receipt && attempts < maxAttempts) {
    receipt = await web3.eth.getTransactionReceipt(txHash)
    if (!receipt) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
  }
  
  if (!receipt) {
    throw new Error('Transaction receipt not found')
  }
  
  return receipt
}
```

### General Utilities (`utils.ts`)

**Purpose**: Common utility functions used throughout the application.

**Key Functions**:

#### Class Name Utilities
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes intelligently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Date Utilities
```typescript
// Format date for display
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInMs = now.getTime() - then.getTime()
  
  const minutes = Math.floor(diffInMs / 60000)
  const hours = Math.floor(diffInMs / 3600000)
  const days = Math.floor(diffInMs / 86400000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`
}
```

#### String Utilities
```typescript
// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Generate random ID
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}
```

#### Number Utilities
```typescript
// Format numbers with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Format currency
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency
  }).format(amount)
}

// Parse percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}
```

#### Validation Utilities
```typescript
// Validate VIN number
export function isValidVIN(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate Ethereum amount
export function isValidEthAmount(amount: string): boolean {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0 && num <= 1000000
}
```

#### Storage Utilities
```typescript
// Local storage with error handling
export const storage = {
  get(key: string): any {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set(key: string, value: any): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
    }
  },
  
  remove(key: string): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage error:', error)
    }
  }
}
```

## Service Integration Patterns

### Service Layer Architecture
```typescript
// High-level component
export function CarManagement() {
  const { contract, web3, account } = useWeb3()
  const [service, setService] = useState<AutoChainService | null>(null)
  
  useEffect(() => {
    if (contract && web3) {
      setService(new AutoChainService(contract, web3))
    }
  }, [contract, web3])
  
  const handleCreateCar = async (carData: CarData) => {
    if (!service) return
    
    const result = await service.createCar(carData)
    // Handle result...
  }
  
  return (
    // Component JSX...
  )
}
```

### Error Handling Strategy
```typescript
// Service method with comprehensive error handling
async function performContractOperation() {
  try {
    const result = await service.operationMethod()
    
    toast.success('Operation completed successfully!')
    return result
    
  } catch (error) {
    let message = 'Unknown error occurred'
    
    if (error.code === 4001) {
      message = 'Transaction was cancelled by user'
    } else if (error.message.includes('insufficient funds')) {
      message = 'Insufficient funds for transaction'
    } else if (error.message.includes('revert')) {
      message = 'Smart contract validation failed'
    }
    
    toast.error('Operation failed', message)
    throw new Error(message)
  }
}
```

### Data Transformation
```typescript
// Transform contract data to frontend format
function transformCarData(rawCarData: any): Car {
  return {
    id: parseInt(rawCarData.id),
    vin: rawCarData.vin,
    marque: capitalize(rawCarData.marque),
    modele: capitalize(rawCarData.modele),
    proprietaires: rawCarData.proprietaires.map((addr: string) => addr.toLowerCase()),
    enVente: rawCarData.enVente,
    prix: formatEther(rawCarData.prix),
    formattedPrice: `${formatEther(rawCarData.prix)} ETH`,
    shortAddress: shortenAddress(rawCarData.proprietaires[rawCarData.proprietaires.length - 1])
  }
}
```

## Contributing to Services

### Creating New Services

1. **Define clear interface**
2. **Implement error handling**
3. **Add TypeScript types**
4. **Write comprehensive tests**
5. **Document public methods**
6. **Follow existing patterns**

### Service Guidelines

- Keep services focused on specific domains
- Implement proper error handling and logging
- Use TypeScript interfaces for all data structures
- Add JSDoc comments for public methods
- Handle edge cases and network errors
- Follow async/await patterns
- Implement proper resource cleanup

### Utility Guidelines

- Keep functions pure when possible
- Add proper TypeScript types
- Handle edge cases
- Add JSDoc documentation
- Test with various inputs
- Follow functional programming principles

### Testing Services

- Test all public methods
- Test error scenarios
- Mock external dependencies
- Test with different network conditions
- Verify transaction handling
- Test data transformations