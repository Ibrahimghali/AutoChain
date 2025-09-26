#!/usr/bin/env node

/**
 * Script d'initialisation pour ajouter les constructeurs certifiés au contrat AutoChain
 * Usage: node scripts/init-constructors.js
 * À exécuter depuis le dossier autochain-dapp
 */

const { ethers } = require('ethers');

// Configuration du réseau (Ganache par défaut)
const NETWORK_CONFIG = {
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A',
  chainId: 5777
};

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

async function initializeConstructors() {
  try {
    console.log('🚀 Initialisation des constructeurs certifiés...\n');

    // Se connecter au réseau
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    console.log(`📡 Connexion au réseau: ${NETWORK_CONFIG.rpcUrl}`);

    // Vérifier la connexion
    try {
      await provider.getNetwork();
      console.log('✅ Connexion au réseau réussie');
    } catch (error) {
      throw new Error(`Impossible de se connecter au réseau: ${error.message}`);
    }

    // Obtenir les comptes disponibles (pour Ganache)
    let adminSigner;
    try {
      // Méthode pour Ganache - utiliser une clé privée connue
      // Remplacez par la clé privée du premier compte Ganache
      const ADMIN_PRIVATE_KEY = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; // Clé par défaut Ganache
      adminSigner = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      console.log(`👤 Compte admin: ${adminSigner.address}`);
    } catch (error) {
      throw new Error(`Impossible de créer le signer: ${error.message}`);
    }

    // Se connecter au contrat
    const contract = new ethers.Contract(
      NETWORK_CONFIG.contractAddress,
      CONTRACT_ABI,
      adminSigner
    );

    // Vérifier que le contrat existe
    try {
      const adminAddress = await contract.admin();
      console.log(`📋 Admin du contrat: ${adminAddress}`);
      
      if (adminAddress.toLowerCase() !== adminSigner.address.toLowerCase()) {
        console.log(`⚠️  Attention: Le signer utilisé (${adminSigner.address}) n'est pas l'admin du contrat (${adminAddress})`);
        console.log('Le script continuera mais les transactions échoueront probablement.\n');
      } else {
        console.log(`✅ Compte admin vérifié\n`);
      }
    } catch (error) {
      throw new Error(`Impossible de vérifier l'admin du contrat: ${error.message}`);
    }

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
        const tx = await contract.addConstructor(constructorAddress);
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

    console.log('\n🎉 Initialisation terminée!');

  } catch (error) {
    console.error('\n💥 ERREUR FATALE:', error.message);
    console.error('\n📋 VÉRIFICATIONS À FAIRE:');
    console.error('1. Ganache est-il démarré sur http://127.0.0.1:7545 ?');
    console.error('2. L\'adresse du contrat est-elle correcte ?');
    console.error('3. Le contrat est-il déployé ?');
    console.error('4. La clé privée de l\'admin est-elle correcte ?');
    process.exit(1);
  }
}

// Afficher les informations de configuration au démarrage
console.log('🔧 CONFIGURATION:');
console.log(`   RPC URL: ${NETWORK_CONFIG.rpcUrl}`);
console.log(`   Contract: ${NETWORK_CONFIG.contractAddress}`);
console.log(`   Constructeurs à ajouter: ${CERTIFIED_CONSTRUCTORS.length}`);
console.log('');

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeConstructors().catch(console.error);
}

module.exports = {
  initializeConstructors,
  CERTIFIED_CONSTRUCTORS,
  NETWORK_CONFIG
};