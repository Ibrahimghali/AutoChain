# AutoChain - Technical Documentation for Contributors

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture Overview](#architecture-overview)
6. [Detailed Component Documentation](#detailed-component-documentation)
7. [Contributing Guidelines](#contributing-guidelines)

## Project Overview

AutoChain is a decentralized application (dApp) that revolutionizes vehicle trading using blockchain technology. It provides:

- **Blockchain-based vehicle registration and certification**
- **Transparent ownership history tracking**
- **Secure peer-to-peer vehicle transactions**
- **Constructor certification system**
- **Complete transaction audit trail**

### Key Features
- ✅ Vehicle creation and certification by authorized constructors
- ✅ Secure buying and selling of vehicles
- ✅ Complete ownership history and transaction tracking
- ✅ MetaMask wallet integration
- ✅ Real-time blockchain event monitoring
- ✅ Responsive web interface with dark/light theme support

## Technology Stack

### Frontend
- **Next.js 14.2.16** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.1.9** - Styling framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Blockchain
- **Ethereum** - Blockchain platform
- **Solidity ^0.8.0** - Smart contract language
- **Ethers.js** - Ethereum JavaScript library
- **MetaMask** - Wallet integration

### Development Tools
- **Truffle** - Smart contract development framework
- **PNPM** - Package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Project Structure

```
AutoChain/
├── autochain-dapp/                 # Next.js frontend application
│   ├── app/                        # Next.js App Router pages
│   ├── components/                 # React components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility libraries and services
│   ├── public/                     # Static assets
│   └── styles/                     # Global styles
├── contracts/                      # Solidity smart contracts
├── migrations/                     # Truffle deployment scripts
├── test/                          # Smart contract tests
└── build/                         # Compiled contract artifacts
```

## Getting Started

### Prerequisites
- Node.js 18+
- PNPM package manager
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ibrahimghali/AutoChain.git
   cd AutoChain
   ```

2. **Install dependencies**
   ```bash
   cd autochain-dapp
   pnpm install
   ```

3. **Environment Setup**
   - Install MetaMask browser extension
   - Configure local blockchain (Ganache) or use testnets
   - Deploy smart contracts using Truffle

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open http://localhost:3000 in your browser
   - Connect your MetaMask wallet

## Architecture Overview

### Smart Contract Layer
The AutoChain smart contract (`contracts/AutoChain.sol`) handles:
- Vehicle registration and certification
- Ownership management
- Sale listings and transactions
- Constructor authorization
- Event emission for frontend updates

### Frontend Architecture
The Next.js application follows a modular architecture:

```
Frontend Components
├── Pages (App Router)
├── Reusable Components
├── Custom Hooks (Web3, AutoChain, Events)
├── Services (AutoChain Service, Web3 utilities)
└── UI Components (Radix-based)
```

### Data Flow
1. **User Actions** → UI Components
2. **UI Components** → Custom Hooks
3. **Custom Hooks** → Services
4. **Services** → Smart Contract
5. **Smart Contract** → Events
6. **Events** → Frontend Updates

## Detailed Component Documentation

For detailed documentation of each component, hook, and service, please refer to the following files:

- [App Directory Documentation](./docs/APP_DIRECTORY.md) - Next.js pages and routing
- [Components Documentation](./docs/COMPONENTS.md) - React components
- [Hooks Documentation](./docs/HOOKS.md) - Custom React hooks
- [Services Documentation](./docs/SERVICES.md) - Business logic and utilities

## Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Component Guidelines
- Keep components small and focused
- Use proper TypeScript interfaces
- Implement loading and error states
- Follow accessibility best practices

### Blockchain Integration
- Always handle Web3 connection states
- Implement proper transaction error handling
- Use events for real-time updates
- Test with different network conditions

### Testing
- Write unit tests for utility functions
- Test components with different states
- Test smart contract interactions
- Verify responsive design

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`feature/your-feature-name`)
3. Make your changes with proper documentation
4. Test thoroughly
5. Submit a pull request with detailed description

### Need Help?
- Review the detailed documentation files in the `docs/` folder
- Check existing components for patterns and examples
- Test your changes locally before submitting
- Ask questions in issues or discussions

---

**Next Steps**: Read the detailed documentation files to understand specific components and their implementations.