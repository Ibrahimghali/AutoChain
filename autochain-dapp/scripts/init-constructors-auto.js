#!/usr/bin/env node

/**
 * Script d'initialisation amélioré pour ajouter les constructeurs certifiés au contrat AutoChain
 * Ce script détecte automatiquement le compte admin et utilise les bonnes clés privées
 * Usage: node scripts/init-constructors-auto.js
 */

const { ethers } = require('ethers');

// Configuration du réseau (Ganache par défaut)
const NETWORK_CONFIG = {
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A',
  chainId: 5777
};

// Clés privées par défaut de Ganache (les 10 premiers comptes)
const DEFAULT_GANACHE_KEYS = [
  "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
  "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
  "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
  "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
  "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743",
  "0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd",
  "0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52",
  "0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3",
  "0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4",
  "0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773"
];

// ABI minimal pour les fonctions nécessaires
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function addConstructor(address ctor)",
  "function isConstructor(address) view returns (bool)",
  "event ConstructorAdded(address indexed ctor)"
];

// Adresses des constructeurs certifiés (depuis le fichier constructeurs.txt)
const CERTIFIED_CONSTRUCTORS = [
  "0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998",
  "0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa"
];

async function findAdminSigner(provider, contractAddress) {
  console.log('🔍 Recherche du compte admin...');
  
  // Créer une instance temporaire du contrat pour lire l'admin
  const tempContract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
  const adminAddress = await tempContract.admin();
  console.log(`📋 Admin du contrat: ${adminAddress}`);

  // Essayer de trouver la clé privée correspondante
  for (let i = 0; i < DEFAULT_GANACHE_KEYS.length; i++) {
    const wallet = new ethers.Wallet(DEFAULT_GANACHE_KEYS[i], provider);
    if (wallet.address.toLowerCase() === adminAddress.toLowerCase()) {
      console.log(`✅ Clé privée admin trouvée (compte ${i}): ${wallet.address}`);
      return wallet;
    }
  }

  throw new Error(`Impossible de trouver la clé privée pour l'admin ${adminAddress}`);
}

async function initializeConstructors() {
  try {
    console.log('🚀 Initialisation automatique des constructeurs certifiés...\n');

    // Se connecter au réseau
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    console.log(`📡 Connexion au réseau: ${NETWORK_CONFIG.rpcUrl}`);

    // Vérifier la connexion
    try {
      const network = await provider.getNetwork();
      console.log(`✅ Connexion au réseau réussie (Chain ID: ${network.chainId})`);
    } catch (error) {
      throw new Error(`Impossible de se connecter au réseau: ${error.message}`);
    }

    // Trouver et utiliser le bon compte admin
    const adminSigner = await findAdminSigner(provider, NETWORK_CONFIG.contractAddress);

    // Se connecter au contrat avec le bon signer
    const contract = new ethers.Contract(
      NETWORK_CONFIG.contractAddress,
      CONTRACT_ABI,
      adminSigner
    );

    console.log('✅ Contrat connecté avec le compte admin\n');

    // Ajouter chaque constructeur
    const results = [];
    for (let i = 0; i < CERTIFIED_CONSTRUCTORS.length; i++) {
      const constructorAddress = CERTIFIED_CONSTRUCTORS[i];
      console.log(`🔧 Traitement du constructeur ${i + 1}/${CERTIFIED_CONSTRUCTORS.length}: ${constructorAddress}`);

      try {
        // Vérifier si déjà constructeur
        const isAlreadyConstructor = await contract.isConstructor(constructorAddress);
        if (isAlreadyConstructor) {
          console.log(`   ⚠️  Déjà constructeur certifié`);
          results.push({
            address: constructorAddress,
            success: true,
            message: 'Déjà constructeur certifié',
            alreadyAdded: true
          });
          continue;
        }

        // Ajouter le constructeur
        console.log(`   📝 Ajout en cours...`);
        const tx = await contract.addConstructor(constructorAddress, {
          gasLimit: 100000 // Limite de gaz explicite pour éviter les erreurs d'estimation
        });
        console.log(`   ⏳ Transaction envoyée: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   ✅ Constructeur ajouté avec succès (Block: ${receipt.blockNumber})`);
        
        results.push({
          address: constructorAddress,
          success: true,
          message: 'Ajouté avec succès',
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber
        });

      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        results.push({
          address: constructorAddress,
          success: false,
          message: error.message
        });
      }

      // Petit délai entre les transactions
      if (i < CERTIFIED_CONSTRUCTORS.length - 1) {
        console.log(`   ⏸️  Attente de 2 secondes...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Résumé final
    console.log('\n📊 RÉSUMÉ DE L\'INITIALISATION:');
    console.log('=====================================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const alreadyAdded = results.filter(r => r.alreadyAdded);

    console.log(`✅ Succès: ${successful.length}`);
    console.log(`❌ Échecs: ${failed.length}`);
    console.log(`⚠️  Déjà ajoutés: ${alreadyAdded.length}`);

    if (failed.length > 0) {
      console.log('\n❌ ÉCHECS DÉTAILLÉS:');
      failed.forEach(result => {
        console.log(`   ${result.address}: ${result.message}`);
      });
    }

    if (successful.filter(r => !r.alreadyAdded).length > 0) {
      console.log('\n✅ NOUVEAUX CONSTRUCTEURS AJOUTÉS:');
      successful.filter(r => !r.alreadyAdded).forEach(result => {
        console.log(`   ${result.address} (TX: ${result.txHash})`);
      });
    }

    // Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE:');
    for (const address of CERTIFIED_CONSTRUCTORS) {
      const isConstructor = await contract.isConstructor(address);
      console.log(`   ${address}: ${isConstructor ? '✅ Constructeur' : '❌ Non constructeur'}`);
    }

    console.log('\n🎉 Initialisation terminée avec succès!');

    // Statistiques finales
    const totalSuccess = results.filter(r => r.success).length;
    if (totalSuccess === CERTIFIED_CONSTRUCTORS.length) {
      console.log('\n🏆 Tous les constructeurs sont maintenant certifiés!');
    } else {
      console.log(`\n⚠️  ${totalSuccess}/${CERTIFIED_CONSTRUCTORS.length} constructeurs certifiés`);
    }

  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    console.error('\n📋 VÉRIFICATIONS À FAIRE:');
    console.error('1. Ganache est-il démarré sur http://127.0.0.1:7545 ?');
    console.error('2. L\'adresse du contrat est-elle correcte ?');
    console.error('3. Le contrat est-il déployé ?');
    console.error('4. Utilisez-vous les clés privées par défaut de Ganache ?');
    process.exit(1);
  }
}

// Afficher les informations de configuration au démarrage
console.log('🔧 CONFIGURATION AUTO:');
console.log(`   RPC URL: ${NETWORK_CONFIG.rpcUrl}`);
console.log(`   Contract: ${NETWORK_CONFIG.contractAddress}`);
console.log(`   Constructeurs à ajouter: ${CERTIFIED_CONSTRUCTORS.length}`);
console.log(`   Clés privées disponibles: ${DEFAULT_GANACHE_KEYS.length}`);
console.log('');

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeConstructors().catch(console.error);
}

module.exports = {
  initializeConstructors,
  findAdminSigner,
  CERTIFIED_CONSTRUCTORS,
  NETWORK_CONFIG,
  DEFAULT_GANACHE_KEYS
};