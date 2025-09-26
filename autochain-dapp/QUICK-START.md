# 🚀 AutoChain - Démarrage Rapide

Ce guide vous permet de configurer AutoChain en 5 minutes !

## ⚡ Installation Express

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 3. Certifier les constructeurs
npm run setup-constructors

# 4. Démarrer l'application
npm run dev
```

## 📝 Configuration Minimale Requise

Dans votre fichier `.env`, vous devez au minimum renseigner :

```env
# Adresse de votre contrat AutoChain déployé
NEXT_PUBLIC_CONTRACT_ADDRESS=0xVOTRE_ADRESSE_CONTRAT

# Clé privée de l'admin du contrat (GARDEZ-LA SECRÈTE!)
ADMIN_PRIVATE_KEY=0xVOTRE_CLE_PRIVEE_ADMIN

# Adresses des constructeurs à certifier
CONSTRUCTOR_ADDRESSES=0xAdresse1,0xAdresse2
CONSTRUCTOR_NAMES=Nom1,Nom2
CONSTRUCTOR_DESCRIPTIONS=Description1,Description2

# Versions client (mêmes valeurs)
NEXT_PUBLIC_CONSTRUCTOR_ADDRESSES=0xAdresse1,0xAdresse2
NEXT_PUBLIC_CONSTRUCTOR_NAMES=Nom1,Nom2
NEXT_PUBLIC_CONSTRUCTOR_DESCRIPTIONS=Description1,Description2
```

## 🔧 Si vous utilisez un réseau différent

Modifiez aussi :

```env
NEXT_PUBLIC_NETWORK_NAME=Votre Réseau
NEXT_PUBLIC_RPC_URL=http://votre-rpc-url
NEXT_PUBLIC_CHAIN_ID=votre-chain-id
```

## ✅ Vérification

Une fois configuré, vous devriez voir :
- ✅ Configuration valide
- ✅ Connexion au réseau réussie
- ✅ Constructeurs certifiés
- ✅ Application démarrée sur http://localhost:3000

## 🆘 Problème ?

- **Erreur réseau** : Vérifiez RPC_URL et CHAIN_ID
- **Erreur admin** : Vérifiez ADMIN_PRIVATE_KEY
- **Constructeurs invisibles** : Vérifiez NEXT_PUBLIC_CONSTRUCTOR_*

📖 Pour plus de détails, consultez le [README complet](./README.md)