# Components Directory Documentation

The `components/` directory contains all reusable React components for the AutoChain dApp.

## Directory Structure

```
components/
├── blockchain-status.tsx          # Blockchain connection status indicator
├── car-card.tsx                   # Vehicle display card component
├── error-boundary.tsx             # Error boundary wrapper
├── events-feed.tsx                # Real-time blockchain events feed
├── loading-spinner.tsx            # Loading indicator component
├── navigation.tsx                 # Main navigation bar
├── stats-overview.tsx             # Statistics dashboard component
├── theme-provider.tsx             # Theme context provider
├── toast-provider.tsx             # Toast notification provider
└── ui/                           # Base UI components (Radix-based)
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── badge.tsx
    └── ... (35+ UI components)
```

## Core Components

### Navigation (`navigation.tsx`)

**Purpose**: Main navigation bar with wallet connection and menu items.

**Key Features**:
- Responsive design with mobile hamburger menu
- Wallet connection status and user info display
- Dynamic navigation items based on user role
- Current page highlight
- MetaMask connection button

**Props**: None (uses hooks internally)

**State Management**:
```typescript
const { isConnected, account, userRole, connect } = useWeb3()
const { canCreateCar } = useAutoChain()
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
```

**Navigation Items**:
- Home (/) - Always visible
- Dashboard (/dashboard) - Always visible
- Create Car (/create-car) - Constructor role only
- Buy Car (/buy-car) - Always visible
- History (/history) - Always visible

**Wallet Display**:
- Connection status indicator
- User role badge (Constructor/User)
- Shortened wallet address
- Connect button when disconnected

### Car Card (`car-card.tsx`)

**Purpose**: Displays individual vehicle information in a card format.

**Props**:
```typescript
interface CarCardProps {
  car: Car
  showActions?: boolean
  onBuy?: (carId: number) => void
  onSell?: (carId: number) => void
  className?: string
}
```

**Key Features**:
- Vehicle image placeholder
- Make, model, and VIN display
- Price in ETH with USD conversion
- Sale status badge
- Owner information
- Action buttons (buy/sell)
- Responsive grid layout

**Usage Examples**:
```typescript
// Display only
<CarCard car={carData} />

// With buy action
<CarCard car={carData} showActions onBuy={handleBuy} />

// With custom styling
<CarCard car={carData} className="custom-styles" />
```

### Blockchain Status (`blockchain-status.tsx`)

**Purpose**: Shows current blockchain connection and network status.

**Key Features**:
- Connection status indicator
- Network name display
- Block height (optional)
- Transaction pending count
- Real-time updates

**Status States**:
- Connected (green indicator)
- Connecting (yellow indicator)
- Disconnected (red indicator)
- Error (red with error message)

### Events Feed (`events-feed.tsx`)

**Purpose**: Real-time display of blockchain events and activities.

**Key Features**:
- Live event streaming from smart contract
- Event type categorization (CarCreated, CarSold, etc.)
- Timestamp display
- User-friendly event descriptions
- Auto-scroll to new events
- Event filtering options

**Event Types Displayed**:
- CarCreated - New vehicle registered
- CarListed - Vehicle put up for sale
- CarSold - Vehicle purchase completed
- ConstructorAdded/Removed - Constructor role changes

### Stats Overview (`stats-overview.tsx`)

**Purpose**: Dashboard widget showing key statistics and metrics.

**Props**:
```typescript
interface StatsOverviewProps {
  stats: {
    totalCars: number
    carsForSale: number
    totalTransactions: number
    userCars?: number
  }
  loading?: boolean
}
```

**Key Features**:
- Animated counters
- Icon representations
- Percentage changes (optional)
- Loading skeleton states
- Responsive grid layout

**Displayed Metrics**:
- Total registered vehicles
- Vehicles currently for sale
- Completed transactions
- User's vehicle count (when applicable)

### Loading Spinner (`loading-spinner.tsx`)

**Purpose**: Consistent loading indicator throughout the application.

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}
```

**Features**:
- Multiple size variants
- Optional loading text
- Accessible with proper ARIA labels
- Customizable styling
- Smooth animation

### Error Boundary (`error-boundary.tsx`)

**Purpose**: Catches and handles React component errors gracefully.

**Key Features**:
- Component error catching
- User-friendly error display
- Error reporting (optional)
- Retry functionality
- Fallback UI

**Implementation**:
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
}
```

### Theme Provider (`theme-provider.tsx`)

**Purpose**: Manages application theme state and transitions.

**Features**:
- Dark/light theme switching
- System theme detection
- Smooth transitions
- Local storage persistence
- Context-based theme access

### Toast Provider (`toast-provider.tsx`)

**Purpose**: Global toast notification system.

**Features**:
- Success/error/info/warning toast types
- Auto-dismiss timers
- Action buttons on toasts
- Queue management
- Accessible notifications

## UI Components Directory (`ui/`)

The `ui/` directory contains base components built on Radix UI primitives. These provide the foundation for the entire design system.

### Key UI Components

#### Button (`ui/button.tsx`)
**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon

#### Card (`ui/card.tsx`)
**Components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

#### Input (`ui/input.tsx`)
**Features**: Standard form input with consistent styling

#### Badge (`ui/badge.tsx`)
**Variants**: default, secondary, destructive, outline

#### Alert (`ui/alert.tsx`)
**Components**: Alert, AlertDescription
**Variants**: default, destructive

### Form Components
- `form.tsx` - Form wrapper with validation
- `input.tsx` - Text input fields
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown selection
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio button groups
- `switch.tsx` - Toggle switch

### Navigation Components
- `navigation-menu.tsx` - Complex navigation menus
- `menubar.tsx` - Menu bar component
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Page navigation

### Overlay Components  
- `dialog.tsx` - Modal dialogs
- `alert-dialog.tsx` - Confirmation dialogs
- `popover.tsx` - Floating content
- `tooltip.tsx` - Hover information
- `hover-card.tsx` - Rich hover content

### Layout Components
- `accordion.tsx` - Expandable content sections
- `collapsible.tsx` - Show/hide content
- `tabs.tsx` - Tabbed interfaces
- `separator.tsx` - Visual dividers
- `scroll-area.tsx` - Custom scrollbars

## Component Architecture Patterns

### Composition Pattern
Most components use a composition pattern:
```typescript
// Card example
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Hook Integration
Components integrate with custom hooks:
```typescript
export function ComponentName() {
  const { isConnected, account } = useWeb3()
  const { userCars, isLoading } = useAutoChain()
  
  // Component logic
}
```

### Error Handling
Components implement proper error states:
```typescript
if (error) {
  return <Alert variant="destructive">{error}</Alert>
}

if (isLoading) {
  return <LoadingSpinner />
}
```

### Responsive Design
All components use responsive classes:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

## Styling System

### Tailwind Classes
- Consistent spacing scale
- Color system with CSS variables
- Typography scale
- Responsive breakpoints

### CSS Variables
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

### Dark Theme Support
All components support dark/light themes through CSS variables and Tailwind's dark mode.

## Contributing to Components

### Creating New Components

1. **Create the component file**:
```typescript
// components/my-component.tsx
"use client"

interface MyComponentProps {
  // Define props
}

export function MyComponent({ ...props }: MyComponentProps) {
  // Implementation
}
```

2. **Add proper TypeScript types**
3. **Implement responsive design**
4. **Add error handling**
5. **Test with different states**
6. **Document props and usage**

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow naming conventions (PascalCase for components)
- Add JSDoc comments for complex components
- Test with different data states
- Ensure accessibility compliance
- Follow responsive design patterns

### UI Component Guidelines

- Extend Radix UI primitives when possible
- Use consistent variant and size patterns
- Implement proper ARIA attributes
- Support keyboard navigation
- Test with screen readers
- Maintain theme compatibility

### Testing Components

- Test all props and variants
- Test loading and error states
- Test responsive behavior
- Test accessibility features
- Test theme switching
- Test with real data