# App Directory Documentation

The `app/` directory contains all the pages and layouts for the AutoChain dApp using Next.js App Router architecture.

## Directory Structure

```
app/
├── globals.css              # Global styles and Tailwind imports
├── layout.tsx              # Root layout component
├── not-found.tsx           # 404 error page
├── page.tsx                # Home page (/)
├── buy-car/                # Buy car section
│   ├── loading.tsx         # Loading UI for buy car page
│   └── page.tsx            # Buy car page (/buy-car)
├── car/                    # Individual car details
│   └── [id]/               # Dynamic route for car ID
│       └── page.tsx        # Car details page (/car/[id])
├── create-car/             # Create car functionality
│   └── page.tsx            # Create car page (/create-car)
├── dashboard/              # User dashboard
│   ├── loading.tsx         # Loading UI for dashboard
│   └── page.tsx            # Dashboard page (/dashboard)
├── history/                # Transaction history
│   ├── loading.tsx         # Loading UI for history page
│   └── page.tsx            # History page (/history)
└── sell-car/               # Sell car functionality
    └── page.tsx            # Sell car page (/sell-car)
```

## File Descriptions

### Root Layout (`layout.tsx`)

**Purpose**: Defines the root HTML structure and global providers for the entire application.

**Key Features**:
- Sets up HTML document structure with proper metadata
- Configures Google Fonts (Inter and JetBrains Mono)
- Implements error boundary for global error handling
- Provides toast notifications system
- Includes Vercel Analytics
- Sets French locale and dark theme as default

**Dependencies**:
- `ErrorBoundary` - Global error handling
- `ToastProvider` - Toast notification system
- `@vercel/analytics` - Analytics tracking

**Metadata Configuration**:
```typescript
export const metadata: Metadata = {
  title: "AutoChain - Blockchain Car Trading Platform",
  description: "Révolutionnez la vente de véhicules avec la blockchain...",
  keywords: ["blockchain", "voiture", "automobile", "NFT", "Ethereum", "MetaMask"],
  // ... OpenGraph and Twitter card configuration
}
```

### Home Page (`page.tsx`)

**Purpose**: Landing page showcasing AutoChain features and statistics.

**Key Features**:
- Hero section with platform introduction
- Real-time blockchain statistics display
- Feature highlights with icons and descriptions
- Call-to-action buttons for main functionalities
- Cars for sale showcase
- Responsive design with mobile optimization

**State Management**:
- Uses `useWeb3()` hook for wallet connection
- Uses `useAutoChain()` hook for contract data
- Handles loading and error states

**Main Sections**:
1. **Hero Section**: Introduction and wallet connection
2. **Statistics**: Live data from smart contract
3. **Features**: Platform capabilities showcase
4. **Cars for Sale**: Current marketplace listings
5. **Benefits**: Platform advantages

### Dashboard Page (`dashboard/page.tsx`)

**Purpose**: User's personal dashboard for managing owned vehicles and viewing account information.

**Key Features**:
- Wallet connection requirement check
- User's car collection display
- Filtering and search functionality
- Quick action buttons (create, buy, sell)
- Real-time statistics overview
- Event feed for blockchain activities

**Authentication Flow**:
```typescript
if (!isConnected) {
  return (
    // Wallet connection prompt
  )
}
```

**Search and Filter**:
- Text search across make, model, and VIN
- Filter by status: all, for-sale, owned
- Real-time filtering with useState

**Components Used**:
- `StatsOverview` - User statistics
- `BlockchainStatus` - Network status
- `EventsFeed` - Recent blockchain events
- `LoadingSpinner` - Loading states

### Buy Car Page (`buy-car/page.tsx`)

**Purpose**: Marketplace for browsing and purchasing available vehicles.

**Key Features**:
- Grid display of cars for sale
- Detailed car information cards
- Purchase functionality with Web3 integration
- Price display in ETH
- Ownership history viewing

**Components Used**:
- `CarCard` - Individual car display component
- Transaction handling with smart contract

### Create Car Page (`create-car/page.tsx`)

**Purpose**: Form for authorized constructors to register new vehicles on the blockchain.

**Key Features**:
- Constructor authorization check
- Vehicle information form (VIN, make, model, etc.)
- Form validation and error handling
- Blockchain transaction processing
- Success/failure feedback

**Access Control**:
- Requires constructor role
- Validates user permissions before allowing access

### Car Details Page (`car/[id]/page.tsx`)

**Purpose**: Detailed view of a specific vehicle with full information and history.

**Key Features**:
- Complete vehicle information display
- Ownership history timeline
- Current status (for sale, sold, etc.)
- Purchase option if available
- Transaction history

**Dynamic Routing**:
- Uses Next.js dynamic routes with `[id]` parameter
- Fetches car data based on URL parameter

### History Page (`history/page.tsx`)

**Purpose**: Complete transaction history and activity log for the user.

**Key Features**:
- Chronological transaction list
- Filter by transaction type
- Detailed transaction information
- Blockchain confirmation status

### Sell Car Page (`sell-car/page.tsx`)

**Purpose**: Interface for users to list their vehicles for sale.

**Key Features**:
- User's car selection dropdown
- Price setting interface
- Listing confirmation
- Transaction processing

### Loading Components

**Purpose**: Provide consistent loading states throughout the application.

**Files**:
- `buy-car/loading.tsx`
- `dashboard/loading.tsx`
- `history/loading.tsx`

**Implementation**:
- Uses `LoadingSpinner` component
- Maintains layout structure during loading
- Accessible loading indicators

### Global Styles (`globals.css`)

**Purpose**: Application-wide styling and Tailwind CSS configuration.

**Includes**:
- Tailwind CSS imports
- CSS custom properties for theming
- Global typography settings
- Animation definitions

## Navigation Flow

```
Home (/) 
├── Dashboard (/dashboard) → User's personal area
├── Buy Car (/buy-car) → Marketplace
├── Create Car (/create-car) → Vehicle registration
├── Sell Car (/sell-car) → List vehicles for sale
├── History (/history) → Transaction history
└── Car Details (/car/[id]) → Individual car view
```

## Common Patterns

### Page Structure
Most pages follow this pattern:
```typescript
"use client"

import { /* components and hooks */ } from "@/..."

export default function PageName() {
  const { /* Web3 state */ } = useWeb3()
  const { /* AutoChain state */ } = useAutoChain()
  
  // Handle wallet connection check
  if (!isConnected) {
    return <ConnectWalletPrompt />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Error Handling
- Global error boundary in layout
- Page-level error states
- Loading states for all async operations
- User-friendly error messages

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Responsive navigation
- Touch-friendly interactions

## Contributing to App Directory

### Adding New Pages
1. Create new directory under `app/`
2. Add `page.tsx` for the main component
3. Add `loading.tsx` for loading state
4. Update navigation if needed
5. Test responsive design
6. Add proper error handling

### Best Practices
- Use TypeScript interfaces for props
- Implement proper loading states
- Handle wallet connection requirements
- Follow existing styling patterns
- Add proper metadata for SEO
- Test with different wallet states