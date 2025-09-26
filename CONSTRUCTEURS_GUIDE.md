# Guide d'Utilisation des Constructeurs AutoChain

Ce guide explique comment utiliser les fonctionnalités d'administration des constructeurs dans AutoChain.

## 📋 Vue d'ensemble

Le système AutoChain permet à l'administrateur du contrat d'ajouter des constructeurs certifiés qui peuvent créer des véhicules. Les adresses des constructeurs sont définies dans le fichier `constructeurs.txt`.

## 🏗️ Constructeurs Prédéfinis

Les constructeurs suivants sont définis comme certifiés :

- **Constructeur 1** : `0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998`
- **Constructeur 2** : `0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa`

## 🚀 Méthodes d'Initialisation

### 1. Via le Script Node.js

Le script `scripts/init-constructors.js` permet d'ajouter automatiquement tous les constructeurs certifiés :

```bash
# Depuis le répertoire racine du projet
cd c:\Users\Ibrahim\Documents\WORK\Faculty-Projects\5eme\AutoChain
node scripts/init-constructors.js
```

**Fonctionnalités du script :**
- ✅ Connexion automatique au réseau Ganache
- ✅ Vérification des permissions administrateur
- ✅ Ajout séquentiel des constructeurs
- ✅ Gestion des erreurs et rapports détaillés
- ✅ Vérification finale des statuts

### 2. Via l'Interface Web

Le composant `ConstructorAdmin` fournit une interface graphique pour :

- **Initialiser tous les constructeurs** en un clic
- **Ajouter des constructeurs** individuellement
- **Supprimer des constructeurs** existants
- **Vérifier les statuts** en temps réel

**Accès :** Seuls les utilisateurs avec des permissions administrateur peuvent accéder à cette interface.

### 3. Via les Hooks React

Le hook `useConstructor` fournit des fonctions programmatiques :

```typescript
import { useConstructor } from "@/hooks/use-constructor"

function MyComponent() {
  const { 
    addConstructor,
    removeConstructor,
    checkConstructorStatus,
    initializeCertifiedConstructors 
  } = useConstructor()

  // Ajouter un constructeur
  const handleAdd = async () => {
    const result = await addConstructor("0x...")
    if (result.success) {
      console.log("Constructeur ajouté !")
    }
  }

  // Initialiser tous les constructeurs
  const handleInitAll = async () => {
    const result = await initializeCertifiedConstructors()
    console.log(`${result.results.length} constructeurs traités`)
  }
}
```

## 🔧 Fonctions Disponibles

### Dans `lib/web3.ts`

| Fonction | Description | Paramètres | Retour |
|----------|-------------|------------|---------|
| `addConstructor` | Ajoute un constructeur | `contract`, `address`, `signer` | `Promise<{success, message, txHash?}>` |
| `removeConstructor` | Supprime un constructeur | `contract`, `address`, `signer` | `Promise<{success, message, txHash?}>` |
| `checkConstructorStatus` | Vérifie le statut | `contract`, `address` | `Promise<{isConstructor, address}>` |
| `checkAllConstructorsStatus` | Vérifie tous les statuts | `contract` | `Promise<Array<{address, isConstructor}>>` |
| `initializeCertifiedConstructors` | Initialise tous | `contract`, `signer` | `Promise<{success, results}>` |

### Dans le Hook `useConstructor`

| Propriété/Méthode | Type | Description |
|-------------------|------|-------------|
| `certifiedConstructors` | `string[]` | Liste des adresses prédéfinies |
| `isLoading` | `boolean` | État de chargement |
| `addConstructor` | `function` | Ajouter un constructeur |
| `removeConstructor` | `function` | Supprimer un constructeur |
| `checkConstructorStatus` | `function` | Vérifier un statut |
| `checkAllConstructors` | `function` | Vérifier tous les statuts |
| `initializeCertifiedConstructors` | `function` | Initialiser tous |

## 🔐 Permissions et Sécurité

### Qui peut faire quoi ?

| Action | Permission Requise | Description |
|--------|-------------------|-------------|
| **Ajouter un constructeur** | Admin seulement | Seul l'administrateur du contrat peut certifier des constructeurs |
| **Supprimer un constructeur** | Admin seulement | Seul l'administrateur peut révoquer la certification |
| **Vérifier le statut** | Tout le monde | Lecture publique des statuts |
| **Créer un véhicule** | Constructeurs certifiés | Seuls les constructeurs peuvent créer des véhicules |

### Vérifications de Sécurité

Le système effectue automatiquement :
- ✅ Validation des adresses Ethereum
- ✅ Vérification des permissions administrateur
- ✅ Prévention des doublons
- ✅ Gestion des erreurs de transaction
- ✅ Protection contre la réentrance

## 🧪 Test et Vérification

### Vérifier qu'un constructeur peut créer un véhicule

```javascript
// Via Web3.js
const isConstructor = await contract.isConstructor("0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998")
console.log("Est constructeur:", isConstructor)

// Créer un véhicule (en tant que constructeur)
if (isConstructor) {
  const tx = await contract.createCar("VIN123456", "Tesla", "Model 3")
  console.log("Véhicule créé:", tx.hash)
}
```

### Via l'interface web

1. Connectez-vous avec un compte constructeur
2. Naviguez vers "Créer un véhicule"
3. Remplissez le formulaire
4. Soumettez pour créer le véhicule

## 🚨 Dépannage

### Erreurs Communes

| Erreur | Cause | Solution |
|--------|-------|---------|
| "Seul l'admin peut appeler" | Compte non-admin | Utilisez le compte déployeur/admin |
| "Vous n'etes pas constructeur certifie" | Constructeur non ajouté | Ajoutez d'abord le constructeur |
| "Adresse invalide" | Format d'adresse incorrect | Vérifiez le format 0x... |
| "Cette adresse est déjà un constructeur" | Doublon | Le constructeur existe déjà |

### Vérifications de Base

```bash
# Vérifier que Ganache fonctionne
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:7545

# Vérifier la connexion au contrat
node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
provider.getBlockNumber().then(block => console.log('Block:', block));
"
```

## 📱 Intégration dans l'Application

Pour intégrer la gestion des constructeurs dans une page :

```tsx
import { ConstructorAdmin } from "@/components/constructor-admin"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      <ConstructorAdmin />
    </div>
  )
}
```

## 🔄 Workflow Recommandé

1. **Déploiement initial**
   - Déployez le contrat AutoChain
   - Notez l'adresse du contrat et l'admin

2. **Configuration des constructeurs**
   - Exécutez le script d'initialisation : `node scripts/init-constructors.js`
   - Ou utilisez l'interface web pour les ajouter manuellement

3. **Vérification**
   - Vérifiez que tous les constructeurs sont ajoutés
   - Testez la création de véhicules

4. **Utilisation**
   - Les constructeurs peuvent maintenant créer des véhicules
   - L'admin peut gérer les constructeurs via l'interface

## 📞 Support

En cas de problème, vérifiez :
1. La connexion à Ganache
2. Les permissions du compte
3. L'adresse du contrat
4. Les logs de la console pour les erreurs détaillées