#!/usr/bin/env node

/**
 * Script final d'initialisation des constructeurs
 * Ce script utilise les comptes détectés automatiquement par Ganache
 * Usage: node scripts/init-constructors-final.js
 */

const { ethers } = require('ethers');

// Configuration du réseau
const NETWORK_CONFIG = {
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A',
  chainId: 1337
};

// ABI minimal pour les fonctions nécessaires
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function addConstructor(address ctor)",
  "function isConstructor(address) view returns (bool)",
  "event ConstructorAdded(address indexed ctor)"
];

// Adresses des constructeurs certifiés
const CERTIFIED_CONSTRUCTORS = [
  "0x2f609E0C31aD4f3eE42ebEF47cF347D198deE998",
  "0x390953dfBD34bC86C6Fb9Acfd137606FfA0c4bAa"
];

async function getAdminSigner(provider) {
  console.log('🔍 Identification du compte admin...');
  
  // Récupérer l'admin du contrat
  const tempContract = new ethers.Contract(NETWORK_CONFIG.contractAddress, CONTRACT_ABI, provider);
  const adminAddress = await tempContract.admin();
  console.log(`👑 Admin du contrat: ${adminAddress}`);

  // Récupérer la liste des comptes
  const accounts = await provider.send("eth_accounts", []);
  console.log(`📋 ${accounts.length} comptes disponibles sur Ganache`);

  // Trouver l'index du compte admin
  let adminIndex = -1;
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].toLowerCase() === adminAddress.toLowerCase()) {
      adminIndex = i;
      break;
    }
  }

  if (adminIndex === -1) {
    throw new Error(`Compte admin ${adminAddress} non trouvé dans les comptes disponibles`);
  }

  console.log(`✅ Compte admin trouvé à l'index ${adminIndex}`);

  // Créer un signer avec ce compte (Ganache permet cela directement)
  const signer = await provider.getSigner(adminIndex);
  console.log(`🔑 Signer créé pour: ${await signer.getAddress()}`);

  return signer;
}

async function initializeConstructors() {
  try {
    console.log('🚀 INITIALISATION FINALE DES CONSTRUCTEURS');
    console.log('==========================================\n');

    // Se connecter au réseau
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    console.log(`📡 Connexion au réseau: ${NETWORK_CONFIG.rpcUrl}`);

    // Vérifier la connexion
    const network = await provider.getNetwork();
    console.log(`✅ Réseau connecté (Chain ID: ${network.chainId})\n`);

    // Obtenir le signer admin
    const adminSigner = await getAdminSigner(provider);

    // Se connecter au contrat avec le signer admin
    const contract = new ethers.Contract(
      NETWORK_CONFIG.contractAddress,
      CONTRACT_ABI,
      adminSigner
    );

    console.log('✅ Contrat connecté avec le compte admin\n');

    // Traiter chaque constructeur
    const results = [];
    for (let i = 0; i < CERTIFIED_CONSTRUCTORS.length; i++) {
      const constructorAddress = CERTIFIED_CONSTRUCTORS[i];
      console.log(`🔧 Constructeur ${i + 1}/${CERTIFIED_CONSTRUCTORS.length}: ${constructorAddress}`);

      try {
        // Vérifier le statut actuel
        const isAlreadyConstructor = await contract.isConstructor(constructorAddress);
        if (isAlreadyConstructor) {
          console.log(`   ✅ Déjà constructeur certifié`);
          results.push({
            address: constructorAddress,
            success: true,
            message: 'Déjà constructeur certifié',
            alreadyAdded: true
          });
          continue;
        }

        // Ajouter le constructeur
        console.log(`   📝 Certification en cours...`);
        const tx = await contract.addConstructor(constructorAddress, {
          gasLimit: 100000
        });
        console.log(`   ⏳ Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`   🎉 Constructeur certifié! (Block ${receipt.blockNumber})`);
        
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

      // Délai entre les transactions
      if (i < CERTIFIED_CONSTRUCTORS.length - 1) {
        console.log(`   ⏳ Attente...\n`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Rapport final
    console.log('\n📊 RAPPORT FINAL');
    console.log('===============');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const newlyAdded = results.filter(r => r.success && !r.alreadyAdded);

    console.log(`✅ Succès total: ${successful.length}/${CERTIFIED_CONSTRUCTORS.length}`);
    console.log(`🆕 Nouveaux constructeurs: ${newlyAdded.length}`);
    console.log(`❌ Échecs: ${failed.length}`);

    if (newlyAdded.length > 0) {
      console.log('\n🎯 NOUVEAUX CONSTRUCTEURS CERTIFIÉS:');
      newlyAdded.forEach(result => {
        console.log(`   📍 ${result.address}`);
        console.log(`      TX: ${result.txHash}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n⚠️  ÉCHECS:');
      failed.forEach(result => {
        console.log(`   📍 ${result.address}: ${result.message}`);
      });
    }

    // Vérification finale de tous les constructeurs
    console.log('\n🔍 VÉRIFICATION FINALE:');
    console.log('======================');
    let allCertified = true;
    for (const address of CERTIFIED_CONSTRUCTORS) {
      const isConstructor = await contract.isConstructor(address);
      console.log(`${address}: ${isConstructor ? '✅ Certifié' : '❌ Non certifié'}`);
      if (!isConstructor) allCertified = false;
    }

    console.log('\n🏁 RÉSULTAT FINAL:');
    if (allCertified) {
      console.log('🎉 SUCCÈS COMPLET! Tous les constructeurs sont maintenant certifiés.');
      console.log('🚗 Ils peuvent maintenant créer des véhicules dans AutoChain.');
    } else {
      console.log('⚠️  Certification incomplète. Certains constructeurs ne sont pas certifiés.');
    }

    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Les constructeurs certifiés peuvent maintenant se connecter à l\'interface');
    console.log('2. Ils auront accès à la fonction "Créer un véhicule"');
    console.log('3. Les utilisateurs pourront acheter les véhicules mis en vente');

  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message);
    console.error('\n🔧 ACTIONS CORRECTIVES:');
    console.error('1. Vérifiez que Ganache est démarré');
    console.error('2. Confirmez l\'adresse du contrat');
    console.error('3. Assurez-vous que le contrat est déployé');
    console.error('4. Vérifiez la configuration réseau');
    process.exit(1);
  }
}

// Configuration d'affichage
console.log('⚙️  CONFIGURATION:');
console.log(`   🌐 Réseau: ${NETWORK_CONFIG.rpcUrl}`);
console.log(`   📄 Contrat: ${NETWORK_CONFIG.contractAddress}`);
console.log(`   👷 Constructeurs: ${CERTIFIED_CONSTRUCTORS.length}`);
console.log('');

// Exécution
if (require.main === module) {
  initializeConstructors().catch(console.error);
}

module.exports = { initializeConstructors, NETWORK_CONFIG, CERTIFIED_CONSTRUCTORS };