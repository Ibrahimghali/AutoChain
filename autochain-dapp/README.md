# AutoChain - Blockchain Car Trading Platform

AutoChain est une application décentralisée (DApp) révolutionnaire qui transforme la vente de véhicules en offrant une traçabilité complète et une certification constructeur via la blockchain Ethereum.

## 🚀 Fonctionnalités

### 🔐 Authentification MetaMask
- Connexion sécurisée via MetaMask
- Détection automatique du rôle utilisateur (Constructeur, Vendeur, Acheteur)
- Gestion des permissions basée sur les rôles

### 🏗️ Pour les Constructeurs
- Création et certification de nouveaux véhicules
- Enregistrement des données techniques sur la blockchain
- Gestion des véhicules certifiés

### 💰 Pour les Vendeurs/Propriétaires
- Mise en vente de véhicules possédés
- Définition des prix en ETH
- Gestion du portefeuille de véhicules

### 🛒 Pour les Acheteurs
- Navigation et recherche de véhicules disponibles
- Achat sécurisé via smart contracts
- Vérification de l'historique complet

### 📊 Traçabilité Complète
- Historique transparent de tous les propriétaires
- Certification constructeur vérifiable
- Transactions immuables sur la blockchain

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI
- **Blockchain**: Ethereum, Ethers.js v6
- **Wallet**: MetaMask Integration
- **UI/UX**: Shadcn/ui, Lucide Icons

## 🎨 Design

Interface moderne avec thème sombre professionnel inspiré des plateformes blockchain :
- Palette de couleurs : Bleu/Violet primaire, Vert accent
- Animations fluides et effets de survol
- Design responsive et accessible
- Grille blockchain animée en arrière-plan

## 🏗️ Architecture

\`\`\`
app/
├── page.tsx                 # Page d'accueil avec connexion MetaMask
├── dashboard/               # Tableau de bord principal
├── create-car/             # Création de véhicule (Constructeurs)
├── sell-car/               # Mise en vente (Propriétaires)
├── buy-car/                # Achat de véhicules (Acheteurs)
├── car/[id]/               # Détails d'un véhicule
├── history/                # Historique global des transactions
└── layout.tsx              # Layout principal avec providers

components/
├── navigation.tsx          # Navigation responsive avec rôles
├── car-card.tsx           # Carte de véhicule avec actions
├── stats-overview.tsx     # Statistiques du tableau de bord
├── blockchain-status.tsx  # Statut de connexion blockchain
├── error-boundary.tsx     # Gestion d'erreurs
└── ui/                    # Composants UI réutilisables

lib/
├── web3.ts               # Utilitaires Web3 et types
└── utils.ts              # Utilitaires généraux

hooks/
└── use-web3.ts           # Hook personnalisé Web3
\`\`\`

## 🚀 Démarrage Rapide

1. **Installation des dépendances**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configuration MetaMask**
   - Installer l'extension MetaMask
   - Se connecter à un réseau Ethereum (Mainnet, Sepolia, etc.)
   - Avoir des ETH pour les transactions

3. **Déploiement du Smart Contract**
   - Déployer le contrat `AutoChain.sol` sur le réseau choisi
   - Mettre à jour l'adresse du contrat dans `lib/web3.ts`

4. **Lancement de l'application**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Accès à l'application**
   - Ouvrir http://localhost:3000
   - Connecter MetaMask
   - Commencer à utiliser AutoChain !

## 🔧 Configuration

### Variables d'environnement
\`\`\`env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=1
\`\`\`

### Smart Contract
Le contrat `AutoChain.sol` doit être déployé avec les fonctionnalités :
- Gestion des constructeurs certifiés
- Création de véhicules avec métadonnées
- Système de vente/achat sécurisé
- Historique des propriétaires

## 🎯 Roadmap

- [ ] Intégration IPFS pour les images de véhicules
- [ ] Support multi-chaînes (Polygon, BSC)
- [ ] Système de réputation des vendeurs
- [ ] API pour intégrations tierces
- [ ] Application mobile React Native

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe AutoChain
- Consulter la documentation technique

---

**AutoChain** - Révolutionnez la vente automobile avec la blockchain ! 🚗⛓️
