#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier les comptes Ganache et l'admin du contrat
 * Usage: node scripts/diagnose-accounts.js
 */

const { ethers } = require('ethers');

// Configuration du réseau
const NETWORK_CONFIG = {
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A',
};

// ABI minimal
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function isConstructor(address) view returns (bool)"
];

// Adresses des constructeurs à vérifier
const CERTIFIED_CONSTRUCTORS = [
  "0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998",
  "0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa"
];

async function diagnoseAccounts() {
  try {
    console.log('🔍 DIAGNOSTIC DES COMPTES GANACHE');
    console.log('==================================\n');

    // Se connecter au réseau
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    console.log(`📡 Connexion au réseau: ${NETWORK_CONFIG.rpcUrl}`);

    // Vérifier la connexion
    const network = await provider.getNetwork();
    console.log(`✅ Réseau connecté (Chain ID: ${network.chainId})\n`);

    // Récupérer l'admin du contrat
    const contract = new ethers.Contract(NETWORK_CONFIG.contractAddress, CONTRACT_ABI, provider);
    const adminAddress = await contract.admin();
    console.log(`👑 Admin du contrat: ${adminAddress}`);

    // Essayer d'obtenir les comptes via eth_accounts (pour les réseaux de développement)
    try {
      const accounts = await provider.send("eth_accounts", []);
      console.log(`\n📋 Comptes disponibles sur Ganache (${accounts.length}):`);
      
      let adminFound = false;
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const balance = await provider.getBalance(account);
        const balanceEth = ethers.formatEther(balance);
        const isAdmin = account.toLowerCase() === adminAddress.toLowerCase();
        
        console.log(`   ${i}: ${account}`);
        console.log(`       Balance: ${balanceEth} ETH`);
        if (isAdmin) {
          console.log(`       🎯 C'EST L'ADMIN DU CONTRAT!`);
          adminFound = true;
        }
        console.log('');
      }

      if (!adminFound) {
        console.log(`⚠️  L'admin ${adminAddress} ne se trouve pas dans les comptes disponibles!`);
      }

    } catch (error) {
      console.log('⚠️  Impossible de récupérer les comptes via eth_accounts');
      console.log('   Cela peut être normal selon la configuration de Ganache');
      console.log(`   Erreur: ${error.message}\n`);
    }

    // Vérifier le statut des constructeurs
    console.log('🔧 STATUT DES CONSTRUCTEURS CERTIFIÉS:');
    console.log('=====================================');
    for (const constructorAddress of CERTIFIED_CONSTRUCTORS) {
      try {
        const isConstructor = await contract.isConstructor(constructorAddress);
        console.log(`${constructorAddress}: ${isConstructor ? '✅ Certifié' : '❌ Non certifié'}`);
      } catch (error) {
        console.log(`${constructorAddress}: ❓ Erreur lors de la vérification`);
      }
    }

    console.log('\n📋 INFORMATIONS UTILES:');
    console.log('=======================');
    console.log('Pour utiliser un compte Ganache comme admin:');
    console.log('1. Copiez la clé privée du compte admin depuis l\'interface Ganache');
    console.log('2. Modifiez le script init-constructors.js avec cette clé privée');
    console.log('3. Ou utilisez Metamask connecté au compte admin');
    console.log('');
    console.log('Alternative: Redéployez le contrat avec le premier compte Ganache');

  } catch (error) {
    console.error('💥 ERREUR:', error.message);
    console.error('\nVérifiez que:');
    console.error('- Ganache est démarré');
    console.error('- L\'adresse du contrat est correcte');
    console.error('- Le contrat est bien déployé');
  }
}

// Exécution
diagnoseAccounts();