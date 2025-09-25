# Hooks Directory Documentation

The `hooks/` directory contains custom React hooks that manage Web3 integration, blockchain interactions, and application state.

## Directory Structure

```
hooks/
├── use-web3.ts                    # Web3 wallet connection and management
├── use-autochain.ts               # AutoChain smart contract interactions
├── use-contract-events.ts         # Real-time blockchain event listening
├── use-mobile.ts                  # Mobile device detection
└── use-toast.ts                   # Toast notification management
```

## Core Hooks

### useWeb3 (`use-web3.ts`)

**Purpose**: Manages Web3 wallet connection, user authentication, and blockchain state.

**Features**:
- MetaMask wallet connection
- User role detection (constructor/user/admin)
- Account management
- Smart contract instance management
- Connection state persistence
- Automatic reconnection

**State Interface**:
```typescript
interface Web3State {
  isConnected: boolean
  account: string | null
  userRole: 'constructor' | 'user' | 'admin' | null
  contract: Contract | null
  web3: Web3 | null
}
```

**Hook API**:
```typescript
const {
  isConnected,      // boolean - wallet connection status
  account,          // string | null - user's wallet address
  userRole,         // 'constructor' | 'user' | 'admin' | null
  contract,         // Contract | null - smart contract instance
  web3,            // Web3 | null - Web3 instance
  connect,         // () => Promise<Web3State> - connect wallet
  disconnect,      // () => void - disconnect wallet
  isLoading,       // boolean - connection loading state
  error            // string | null - connection error
} = useWeb3()
```

**Usage Example**:
```typescript
export function MyComponent() {
  const { isConnected, account, connect, userRole } = useWeb3()
  
  const handleConnect = async () => {
    try {
      await connect()
      console.log('Connected successfully!')
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }
  
  if (!isConnected) {
    return <button onClick={handleConnect}>Connect Wallet</button>
  }
  
  return (
    <div>
      <p>Connected as: {userRole}</p>
      <p>Address: {account}</p>
    </div>
  )
}
```

**Key Functions**:

1. **initialize()**: Auto-connects if wallet was previously connected
2. **connect()**: Prompts user to connect MetaMask wallet
3. **disconnect()**: Resets connection state
4. **setupContractListeners()**: Configures blockchain event listeners

**Error Handling**:
- MetaMask not installed
- User rejection of connection
- Network errors
- Contract deployment issues

### useAutoChain (`use-autochain.ts`)

**Purpose**: Manages interactions with the AutoChain smart contract and application state.

**Features**:
- Vehicle data management
- User role validation
- Contract statistics
- Transaction handling
- Real-time data updates

**State Interface**:
```typescript
interface AutoChainState {
  service: AutoChainService | null
  isConstructor: boolean
  isAdmin: boolean
  userCars: Car[]
  carsForSale: Car[]
  contractStats: {
    totalCars: number
    carsForSale: number
    totalTransactions: number
  }
}
```

**Hook API**:
```typescript
const {
  service,           // AutoChainService | null - contract service instance
  isConstructor,     // boolean - user has constructor role
  isAdmin,          // boolean - user has admin role
  userCars,         // Car[] - user's owned vehicles
  carsForSale,      // Car[] - vehicles available for purchase
  contractStats,    // object - contract statistics
  canCreateCar,     // boolean - user can create vehicles
  canSellCar,       // boolean - user can sell vehicles
  canBuyCar,        // boolean - user can buy vehicles
  isLoading,        // boolean - data loading state
  error,            // string | null - operation error
  refreshUserData,  // () => Promise<void> - refresh user data
  createCar,        // (carData) => Promise<void> - create new vehicle
  buyCar,           // (carId) => Promise<void> - purchase vehicle
  sellCar           // (carId, price) => Promise<void> - list vehicle for sale
} = useAutoChain()
```

**Usage Example**:
```typescript
export function Dashboard() {
  const { userCars, carsForSale, canCreateCar, createCar, isLoading } = useAutoChain()
  
  const handleCreateCar = async (carData) => {
    try {
      await createCar(carData)
      console.log('Car created successfully!')
    } catch (error) {
      console.error('Failed to create car:', error)
    }
  }
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <div>
      <h2>My Cars ({userCars.length})</h2>
      {userCars.map(car => <CarCard key={car.id} car={car} />)}
      
      {canCreateCar && (
        <button onClick={() => handleCreateCar(newCarData)}>
          Create New Car
        </button>
      )}
    </div>
  )
}
```

**Key Functions**:

1. **loadUserData()**: Loads user-specific data from smart contract
2. **createCar()**: Creates new vehicle on blockchain
3. **buyCar()**: Purchases vehicle from marketplace
4. **sellCar()**: Lists vehicle for sale
5. **refreshUserData()**: Refreshes all user data

**Permissions**:
- **canCreateCar**: User is authorized constructor
- **canSellCar**: User owns vehicles that can be sold
- **canBuyCar**: User has sufficient funds and cars are available

### useContractEvents (`use-contract-events.ts`)

**Purpose**: Listens to real-time blockchain events from the AutoChain smart contract.

**Features**:
- Real-time event streaming
- Event filtering and categorization
- Event history management
- Automatic reconnection
- Event-driven UI updates

**Hook API**:
```typescript
const {
  events,           // Event[] - array of blockchain events
  isListening,      // boolean - event listener status
  latestEvent,      // Event | null - most recent event
  eventCount,       // number - total events received
  startListening,   // () => void - start event listener
  stopListening,    // () => void - stop event listener
  clearEvents       // () => void - clear event history
} = useContractEvents()
```

**Supported Events**:
- `CarCreated` - New vehicle registered
- `CarListed` - Vehicle listed for sale
- `CarSold` - Vehicle purchase completed
- `ConstructorAdded` - New constructor authorized
- `ConstructorRemoved` - Constructor authorization revoked

**Usage Example**:
```typescript
export function EventsFeed() {
  const { events, isListening, latestEvent } = useContractEvents()
  
  useEffect(() => {
    if (latestEvent) {
      // Show toast notification for new events
      toast.success(`New ${latestEvent.event}: ${latestEvent.description}`)
    }
  }, [latestEvent])
  
  return (
    <div>
      <h3>Recent Activity {isListening && <OnlineIndicator />}</h3>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

**Event Object Structure**:
```typescript
interface ContractEvent {
  id: string
  event: string
  blockNumber: number
  transactionHash: string
  timestamp: Date
  args: any[]
  description: string
}
```

### useMobile (`use-mobile.ts`)

**Purpose**: Detects mobile devices and manages responsive behavior.

**Features**:
- Device type detection
- Screen size monitoring
- Touch capability detection
- Responsive breakpoint management

**Hook API**:
```typescript
const {
  isMobile,         // boolean - is mobile device
  isTablet,         // boolean - is tablet device
  isDesktop,        // boolean - is desktop device
  screenSize,       // 'sm' | 'md' | 'lg' | 'xl' - current breakpoint
  isTouchDevice     // boolean - supports touch
} = useMobile()
```

**Usage Example**:
```typescript
export function ResponsiveComponent() {
  const { isMobile, screenSize } = useMobile()
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {screenSize === 'sm' ? <MobileMenu /> : <DesktopMenu />}
    </div>
  )
}
```

### useToast (`use-toast.ts`)

**Purpose**: Manages toast notifications throughout the application.

**Features**:
- Multiple toast types (success, error, info, warning)
- Auto-dismiss functionality
- Action buttons on toasts
- Toast queue management
- Accessibility support

**Hook API**:
```typescript
const {
  toast,            // (options) => void - show toast
  dismiss,          // (id) => void - dismiss specific toast
  dismissAll        // () => void - dismiss all toasts
} = useToast()
```

**Toast Options**:
```typescript
interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  action?: {
    altText: string
    onClick: () => void
  }
}
```

**Usage Example**:
```typescript
export function TransactionButton() {
  const { toast } = useToast()
  
  const handleTransaction = async () => {
    try {
      toast({
        title: "Transaction started",
        description: "Please wait for confirmation...",
        variant: "default"
      })
      
      await performTransaction()
      
      toast({
        title: "Success!",
        description: "Transaction completed successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }
  
  return <button onClick={handleTransaction}>Send Transaction</button>
}
```

## Hook Interaction Patterns

### Web3 + AutoChain Integration
```typescript
export function CarManagement() {
  const { isConnected, userRole } = useWeb3()
  const { userCars, createCar, canCreateCar } = useAutoChain()
  
  if (!isConnected) return <ConnectWallet />
  if (!canCreateCar) return <NoPermission />
  
  return <CarCreationForm onSubmit={createCar} />
}
```

### Events + Toast Integration
```typescript
export function NotificationHandler() {
  const { latestEvent } = useContractEvents()
  const { toast } = useToast()
  
  useEffect(() => {
    if (latestEvent) {
      toast({
        title: `${latestEvent.event}`,
        description: latestEvent.description,
        variant: 'success'
      })
    }
  }, [latestEvent, toast])
  
  return null // This is a notification handler component
}
```

### Mobile + Component Adaptation
```typescript
export function AdaptiveNavigation() {
  const { isMobile } = useMobile()
  const { isConnected } = useWeb3()
  
  return (
    <nav>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      {isConnected && <WalletStatus />}
    </nav>
  )
}
```

## Error Handling Patterns

### Async Error Handling
```typescript
const handleAsyncOperation = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    const result = await performOperation()
    
    // Success handling
    toast.success('Operation completed!')
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    setError(errorMessage)
    
    toast.error('Operation failed', errorMessage)
  } finally {
    setIsLoading(false)
  }
}
```

### Network Error Recovery
```typescript
useEffect(() => {
  const handleNetworkError = () => {
    if (error?.includes('network')) {
      // Attempt reconnection
      setTimeout(() => {
        initialize()
      }, 5000)
    }
  }
  
  handleNetworkError()
}, [error])
```

## Performance Optimizations

### Memoization
```typescript
const memoizedCarList = useMemo(() => {
  return userCars.filter(car => car.enVente)
}, [userCars])

const handleBuyCar = useCallback(async (carId) => {
  await buyCar(carId)
}, [buyCar])
```

### Debounced Updates
```typescript
const debouncedRefresh = useCallback(
  debounce(() => {
    refreshUserData()
  }, 1000),
  [refreshUserData]
)
```

## Contributing to Hooks

### Creating New Hooks

1. **Follow naming convention**: use-[feature-name].ts
2. **Implement proper TypeScript types**
3. **Add error handling**
4. **Include loading states**
5. **Document the API**
6. **Test with different scenarios**

### Hook Guidelines

- Keep hooks focused on single responsibility
- Use proper dependency arrays in useEffect
- Implement cleanup functions
- Handle edge cases and errors
- Provide loading and error states
- Use TypeScript interfaces for complex state
- Add JSDoc comments for complex logic

### Testing Hooks

- Test all return values
- Test error scenarios
- Test loading states
- Test cleanup functionality  
- Test with different prop combinations
- Test async operations
- Mock external dependencies