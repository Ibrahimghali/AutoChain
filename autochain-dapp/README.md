# AutoChain - Configuration et Déploiement des Constructeurs# AutoChain - Configuration et Déploiement des Constructeurs



## 🚀 Vue d'ensemble## 🚀 Vue d'ensemble



AutoChain est une application décentralisée (DApp) de gestion de véhicules sur blockchain. Ce README explique comment configurer et certifier les constructeurs automobiles dans le système.AutoChain est une application décentralisée (DApp) de gestion de véhicules sur blockchain. Ce README explique comment configurer et certifier les constructeurs automobiles dans le système.



## 📋 Prérequis## 🚀 Fonctionnalités



- Node.js v16 ou supérieur### 🔐 Authentification MetaMask

- npm ou yarn- Connexion sécurisée via MetaMask

- Ganache ou un autre réseau Ethereum- Détection automatique du rôle utilisateur (Constructeur, Vendeur, Acheteur)

- Contrat AutoChain déployé- Gestion des permissions basée sur les rôles

- Clé privée de l'administrateur du contrat

### 🏗️ Pour les Constructeurs

## ⚙️ Configuration- Création et certification de nouveaux véhicules

- Enregistrement des données techniques sur la blockchain

### 1. Installation- Gestion des véhicules certifiés



```bash### 💰 Pour les Vendeurs/Propriétaires

# Cloner le projet et installer les dépendances- Mise en vente de véhicules possédés

npm install- Définition des prix en ETH

- Gestion du portefeuille de véhicules

# Installer dotenv pour les scripts

npm install dotenv### 🛒 Pour les Acheteurs

```- Navigation et recherche de véhicules disponibles

- Achat sécurisé via smart contracts

### 2. Configuration des variables d'environnement- Vérification de l'historique complet



Copiez le fichier d'exemple et configurez vos variables :### 📊 Traçabilité Complète

- Historique transparent de tous les propriétaires

```bash- Certification constructeur vérifiable

cp .env.example .env- Transactions immuables sur la blockchain

```

## 🛠️ Technologies Utilisées

Éditez le fichier `.env` avec vos valeurs :

- **Frontend**: Next.js 14, React 19, TypeScript

```env- **Styling**: Tailwind CSS v4, Radix UI

# ================================- **Blockchain**: Ethereum, Ethers.js v6

# BLOCKCHAIN NETWORK CONFIGURATION  - **Wallet**: MetaMask Integration

# ================================- **UI/UX**: Shadcn/ui, Lucide Icons

NEXT_PUBLIC_NETWORK_NAME=Ganache Local

NEXT_PUBLIC_RPC_URL=http://127.0.0.1:7545## 🎨 Design

NEXT_PUBLIC_CHAIN_ID=1337

Interface moderne avec thème sombre professionnel inspiré des plateformes blockchain :

# ================================- Palette de couleurs : Bleu/Violet primaire, Vert accent

# SMART CONTRACT CONFIGURATION- Animations fluides et effets de survol

# ================================- Design responsive et accessible

NEXT_PUBLIC_CONTRACT_ADDRESS=0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A- Grille blockchain animée en arrière-plan



# ================================## 🏗️ Architecture

# ADMIN CONFIGURATION

# ================================\`\`\`

ADMIN_PRIVATE_KEY=0x882f783cfe5181d8174aed29d7803499b5200f3cd867f848c91e26f4c112d328app/

├── page.tsx                 # Page d'accueil avec connexion MetaMask

# ================================├── dashboard/               # Tableau de bord principal

# CONSTRUCTORS CONFIGURATION├── create-car/             # Création de véhicule (Constructeurs)

# ================================├── sell-car/               # Mise en vente (Propriétaires)

# Server-side (pour les scripts)├── buy-car/                # Achat de véhicules (Acheteurs)

CONSTRUCTOR_ADDRESSES=0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998,0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa├── car/[id]/               # Détails d'un véhicule

CONSTRUCTOR_NAMES=Tesla,BMW├── history/                # Historique global des transactions

CONSTRUCTOR_DESCRIPTIONS=Constructeur Tesla officiel,Constructeur BMW officiel└── layout.tsx              # Layout principal avec providers



# Client-side (pour l'interface)components/

NEXT_PUBLIC_CONSTRUCTOR_ADDRESSES=0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998,0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa├── navigation.tsx          # Navigation responsive avec rôles

NEXT_PUBLIC_CONSTRUCTOR_NAMES=Tesla,BMW├── car-card.tsx           # Carte de véhicule avec actions

NEXT_PUBLIC_CONSTRUCTOR_DESCRIPTIONS=Constructeur Tesla officiel,Constructeur BMW officiel├── stats-overview.tsx     # Statistiques du tableau de bord

```├── blockchain-status.tsx  # Statut de connexion blockchain

├── error-boundary.tsx     # Gestion d'erreurs

### 3. Variables d'environnement expliquées└── ui/                    # Composants UI réutilisables



| Variable | Description | Exemple |lib/

|----------|-------------|---------|├── web3.ts               # Utilitaires Web3 et types

| `NEXT_PUBLIC_NETWORK_NAME` | Nom du réseau blockchain | `Ganache Local` |└── utils.ts              # Utilitaires généraux

| `NEXT_PUBLIC_RPC_URL` | URL du noeud RPC | `http://127.0.0.1:7545` |

| `NEXT_PUBLIC_CHAIN_ID` | ID de la chaîne blockchain | `1337` |hooks/

| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Adresse du contrat AutoChain | `0x8E30...` |└── use-web3.ts           # Hook personnalisé Web3

| `ADMIN_PRIVATE_KEY` | Clé privée de l'admin du contrat | `0x882f...` |\`\`\`

| `CONSTRUCTOR_ADDRESSES` | Adresses des constructeurs (serveur) | `0x2f60...,0x3909...` |

| `CONSTRUCTOR_NAMES` | Noms des constructeurs | `Tesla,BMW` |## 🚀 Démarrage Rapide

| `CONSTRUCTOR_DESCRIPTIONS` | Descriptions des constructeurs | `Constructeur Tesla officiel,Constructeur BMW officiel` |

| `NEXT_PUBLIC_CONSTRUCTOR_*` | Versions client des variables constructeurs | Mêmes valeurs que les versions serveur |1. **Installation des dépendances**

   \`\`\`bash

## 🏗️ Certification des Constructeurs   npm install

   \`\`\`

### Méthode Automatique (Recommandée)

2. **Configuration MetaMask**

Utilisez le script de configuration automatique :   - Installer l'extension MetaMask

   - Se connecter à un réseau Ethereum (Mainnet, Sepolia, etc.)

```bash   - Avoir des ETH pour les transactions

node scripts/setup-constructors.js

```3. **Déploiement du Smart Contract**

   - Déployer le contrat `AutoChain.sol` sur le réseau choisi

Ce script va :   - Mettre à jour l'adresse du contrat dans `lib/web3.ts`

1. ✅ Valider la configuration depuis `.env`

2. 🔗 Se connecter au réseau blockchain4. **Lancement de l'application**

3. 📋 Initialiser le contrat AutoChain   \`\`\`bash

4. 🏗️ Certifier tous les constructeurs listés   npm run dev

5. 📊 Afficher un résumé des certifications   \`\`\`



### Exemple de sortie5. **Accès à l'application**

   - Ouvrir http://localhost:3000

```   - Connecter MetaMask

🚀 AutoChain Constructor Setup   - Commencer à utiliser AutoChain !

==============================

## 🔧 Configuration

🔍 Validation de la configuration...

✅ Configuration valide### Variables d'environnement

📡 Réseau: Ganache Local (http://127.0.0.1:7545)\`\`\`env

📋 Contrat: 0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3ANEXT_PUBLIC_CONTRACT_ADDRESS=0x...

👤 Constructeurs à certifier: 2NEXT_PUBLIC_NETWORK_ID=1

\`\`\`

🔗 Connexion au réseau...

✅ Connecté au réseau Chain ID: 1337### Smart Contract

Le contrat `AutoChain.sol` doit être déployé avec les fonctionnalités :

📋 Initialisation du contrat...- Gestion des constructeurs certifiés

👤 Admin du contrat: 0x742d35Cc6634C0532925a3b8D4C9db96590b5- Création de véhicules avec métadonnées

🔑 Adresse du wallet: 0x742d35Cc6634C0532925a3b8D4C9db96590b5- Système de vente/achat sécurisé

✅ Wallet admin vérifié- Historique des propriétaires



🏗️ Certification des constructeurs...## 🎯 Roadmap



📝 Traitement: Tesla (0x2f609e0c31ad4f3ee42ebef47cf347d198dee998)- [ ] Intégration IPFS pour les images de véhicules

🔄 Certification de Tesla...- [ ] Support multi-chaînes (Polygon, BSC)

📤 Transaction envoyée: 0xabc123...- [ ] Système de réputation des vendeurs

✅ Tesla certifié avec succès! Block: 15432- [ ] API pour intégrations tierces

✅ Vérification: Tesla est maintenant certifié- [ ] Application mobile React Native



📝 Traitement: BMW (0x390953dfbd34bc86c6fb9acfd137606ffa0c4baa)## 🤝 Contribution

🔄 Certification de BMW...

📤 Transaction envoyée: 0xdef456...Les contributions sont les bienvenues ! Veuillez :

✅ BMW certifié avec succès! Block: 154331. Fork le projet

✅ Vérification: BMW est maintenant certifié2. Créer une branche feature

3. Commit vos changements

📊 RÉSUMÉ FINAL4. Push vers la branche

================5. Ouvrir une Pull Request

Tesla           0x2f609e0c31ad4f3ee42ebef47cf347d198dee998 ✅ CERTIFIÉ

BMW             0x390953dfbd34bc86c6fb9acfd137606ffa0c4baa ✅ CERTIFIÉ## 📄 Licence



🎉 Script terminé!Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

```

## 🆘 Support

## 🔧 Ajout de Nouveaux Constructeurs

Pour toute question ou problème :

### 1. Modifier le fichier .env- Ouvrir une issue sur GitHub

- Contacter l'équipe AutoChain

Ajoutez les nouvelles adresses, noms et descriptions (séparés par des virgules) :- Consulter la documentation technique



```env---

# Exemple avec 3 constructeurs

CONSTRUCTOR_ADDRESSES=0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998,0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa,0x1234567890123456789012345678901234567890**AutoChain** - Révolutionnez la vente automobile avec la blockchain ! 🚗⛓️

CONSTRUCTOR_NAMES=Tesla,BMW,Mercedes
CONSTRUCTOR_DESCRIPTIONS=Constructeur Tesla officiel,Constructeur BMW officiel,Constructeur Mercedes officiel

# N'oubliez pas les versions NEXT_PUBLIC_ pour le frontend
NEXT_PUBLIC_CONSTRUCTOR_ADDRESSES=0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998,0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa,0x1234567890123456789012345678901234567890
NEXT_PUBLIC_CONSTRUCTOR_NAMES=Tesla,BMW,Mercedes
NEXT_PUBLIC_CONSTRUCTOR_DESCRIPTIONS=Constructeur Tesla officiel,Constructeur BMW officiel,Constructeur Mercedes officiel
```

### 2. Relancer la certification

```bash
node scripts/setup-constructors.js
```

### 3. Redémarrer l'application

```bash
npm run dev
```

## 🎨 Personnalisation de l'Interface

L'interface utilise des couleurs automatiques pour chaque constructeur. L'ordre des couleurs :

1. 🔴 Rouge (Tesla par défaut)
2. 🔵 Bleu (BMW par défaut)  
3. 🟢 Vert (Mercedes)
4. 🟣 Violet
5. 🟠 Orange
6. 🩵 Cyan

Les logos doivent être placés dans `/public/` avec le format : `{nom-constructeur}-logo.png`

Exemple :
- `tesla-logo.png`
- `bmw-logo.png`
- `mercedes-logo.png`

## 🛠️ Résolution des Problèmes

### Erreur "Wallet n'est pas l'admin"

```
❌ Ce wallet n'est pas l'admin du contrat
```

**Solution :** Vérifiez que `ADMIN_PRIVATE_KEY` correspond bien à l'admin du contrat.

### Erreur de connexion réseau

```
❌ Impossible de se connecter au réseau
```

**Solutions :**
1. Vérifiez que Ganache est démarré
2. Vérifiez l'URL RPC dans `NEXT_PUBLIC_RPC_URL`
3. Vérifiez le Chain ID dans `NEXT_PUBLIC_CHAIN_ID`

### Erreur "Configuration invalide"

```
❌ Erreurs de configuration:
   - CONSTRUCTOR_NAMES doit avoir le même nombre d'éléments que CONSTRUCTOR_ADDRESSES
```

**Solution :** Assurez-vous que tous les tableaux (addresses, names, descriptions) ont le même nombre d'éléments.

### Les constructeurs n'apparaissent pas dans l'interface

**Solutions :**
1. Vérifiez les variables `NEXT_PUBLIC_CONSTRUCTOR_*`
2. Redémarrez l'application après modification du `.env`
3. Vérifiez que les constructeurs sont bien certifiés avec le script

## 📚 Structure des Fichiers

```
autochain-dapp/
├── .env                    # Configuration principale
├── .env.example           # Modèle de configuration
├── scripts/
│   └── setup-constructors.js  # Script de certification
├── lib/
│   ├── web3.ts            # Utilitaires blockchain
│   └── constructors.ts    # Configuration constructeurs
└── public/
    ├── tesla-logo.png     # Logos des constructeurs
    └── bmw-logo.png
```

## 🚀 Démarrage de l'Application

Une fois la configuration terminée :

```bash
# Démarrer l'application
npm run dev

# Ouvrir dans le navigateur
# http://localhost:3000
```

## 👥 Support Multi-Client

Pour que différents clients puissent tester avec leurs propres données :

1. **Chaque client** doit avoir son propre fichier `.env`
2. **Chaque client** doit déployer son propre contrat AutoChain ou utiliser le même avec des constructeurs différents
3. **Chaque client** doit avoir la clé privée admin du contrat qu'il utilise

### Exemple pour un nouveau client

```bash
# 1. Copier la configuration d'exemple
cp .env.example .env

# 2. Modifier avec ses valeurs
# NEXT_PUBLIC_CONTRACT_ADDRESS=0xSON_ADRESSE_CONTRAT
# ADMIN_PRIVATE_KEY=0xSA_CLE_PRIVEE_ADMIN
# CONSTRUCTOR_ADDRESSES=0xSES_CONSTRUCTEURS

# 3. Certifier ses constructeurs  
node scripts/setup-constructors.js

# 4. Démarrer l'application
npm run dev
```

## 📝 Notes Importantes

- ⚠️ **Ne jamais commiter le fichier `.env`** (il contient des clés privées)
- ✅ **Toujours utiliser `.env.example`** comme modèle
- 🔒 **Garder les clés privées sécurisées**
- 🔄 **Redémarrer l'app après modification du `.env`**
- 📱 **Les variables `NEXT_PUBLIC_*` sont visibles côté client**

## 🎯 Résumé Rapide

1. `cp .env.example .env`
2. Modifier `.env` avec vos valeurs
3. `node scripts/setup-constructors.js`
4. `npm run dev`
5. Ouvrir http://localhost:3000

**C'est tout ! Votre AutoChain est prêt ! 🎉**