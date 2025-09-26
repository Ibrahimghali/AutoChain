#!/usr/bin/env node

/**
 * Script de certification des constructeurs avec la clé privée admin
 * Usage: node scripts/certify-constructors.js
 */

const { ethers } = require('ethers');

// Configuration du réseau
const NETWORK_CONFIG = {
  rpcUrl: 'http://127.0.0.1:7545',
  contractAddress: '0x8E30414c9E14FAAC56303BAE6a045Aa20Ad65b3A',
  chainId: 1337
};

// Clé privée de l'admin du contrat
const ADMIN_PRIVATE_KEY = '0x882f783cfe5181d8174aed29d7803499b5200f3cd867f848c91e26f4c112d328';

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

async function certifyConstructors() {
  try {
    console.log('🎯 CERTIFICATION DES CONSTRUCTEURS AUTOCHAIN');
    console.log('===========================================\n');

    // Se connecter au réseau
    const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    console.log(`📡 Connexion au réseau: ${NETWORK_CONFIG.rpcUrl}`);

    // Vérifier la connexion
    const network = await provider.getNetwork();
    console.log(`✅ Réseau connecté (Chain ID: ${network.chainId})`);

    // Créer le signer avec la clé privée admin
    const adminSigner = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    console.log(`🔑 Admin connecté: ${adminSigner.address}`);

    // Se connecter au contrat
    const contract = new ethers.Contract(
      NETWORK_CONFIG.contractAddress,
      CONTRACT_ABI,
      adminSigner
    );

    // Vérifier que c'est bien l'admin
    const contractAdmin = await contract.admin();
    if (contractAdmin.toLowerCase() !== adminSigner.address.toLowerCase()) {
      throw new Error(`Erreur: Ce compte n'est pas l'admin du contrat!\nAdmin attendu: ${contractAdmin}\nCompte utilisé: ${adminSigner.address}`);
    }
    console.log(`✅ Permissions admin vérifiées\n`);

    // Processus de certification
    const results = [];
    console.log(`🏭 Certification de ${CERTIFIED_CONSTRUCTORS.length} constructeurs...\n`);

    for (let i = 0; i < CERTIFIED_CONSTRUCTORS.length; i++) {
      const constructorAddress = CERTIFIED_CONSTRUCTORS[i];
      const constructorNum = i + 1;
      
      console.log(`🔧 CONSTRUCTEUR ${constructorNum}/${CERTIFIED_CONSTRUCTORS.length}`);
      console.log(`   📍 Adresse: ${constructorAddress}`);

      try {
        // Vérifier le statut actuel
        const isAlreadyConstructor = await contract.isConstructor(constructorAddress);
        
        if (isAlreadyConstructor) {
          console.log(`   ✅ Déjà certifié comme constructeur`);
          results.push({
            address: constructorAddress,
            success: true,
            status: 'already_certified',
            message: 'Déjà certifié'
          });
        } else {
          console.log(`   📝 Certification en cours...`);
          
          // Estimer le gaz
          const gasEstimate = await contract.addConstructor.estimateGas(constructorAddress);
          console.log(`   ⛽ Gaz estimé: ${gasEstimate.toString()}`);

          // Envoyer la transaction
          const tx = await contract.addConstructor(constructorAddress, {
            gasLimit: gasEstimate * 2n // Double de l'estimation pour être sûr
          });
          
          console.log(`   ⏳ Transaction envoyée: ${tx.hash}`);
          console.log(`   ⏳ Attente de confirmation...`);
          
          const receipt = await tx.wait();
          
          console.log(`   🎉 CONSTRUCTEUR CERTIFIÉ AVEC SUCCÈS!`);
          console.log(`   📊 Block: ${receipt.blockNumber}`);
          console.log(`   ⛽ Gaz utilisé: ${receipt.gasUsed.toString()}`);
          
          results.push({
            address: constructorAddress,
            success: true,
            status: 'newly_certified',
            message: 'Nouvellement certifié',
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
          });
        }

      } catch (error) {
        console.log(`   ❌ ERREUR: ${error.message}`);
        results.push({
          address: constructorAddress,
          success: false,
          status: 'error',
          message: error.message
        });
      }

      // Délai entre les traitements
      if (i < CERTIFIED_CONSTRUCTORS.length - 1) {
        console.log(`   ⏳ Pause de 2 secondes...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('');
      }
    }

    // RAPPORT FINAL
    console.log('📊 RAPPORT DE CERTIFICATION');
    console.log('==========================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const newlyCertified = results.filter(r => r.success && r.status === 'newly_certified');
    const alreadyCertified = results.filter(r => r.success && r.status === 'already_certified');

    console.log(`✅ Succès total: ${successful.length}/${CERTIFIED_CONSTRUCTORS.length}`);
    console.log(`🆕 Nouveaux certifiés: ${newlyCertified.length}`);
    console.log(`📋 Déjà certifiés: ${alreadyCertified.length}`);
    console.log(`❌ Échecs: ${failed.length}`);

    if (newlyCertified.length > 0) {
      console.log('\n🎯 NOUVEAUX CONSTRUCTEURS CERTIFIÉS:');
      newlyCertified.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.address}`);
        console.log(`      TX: ${result.txHash}`);
        console.log(`      Block: ${result.blockNumber}`);
        console.log(`      Gaz: ${result.gasUsed}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n⚠️  ÉCHECS DE CERTIFICATION:');
      failed.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.address}`);
        console.log(`      Erreur: ${result.message}`);
      });
    }

    // Vérification finale complète
    console.log('\n🔍 VÉRIFICATION FINALE');
    console.log('=====================');
    
    let allCertified = true;
    for (const address of CERTIFIED_CONSTRUCTORS) {
      try {
        const isConstructor = await contract.isConstructor(address);
        const status = isConstructor ? '✅ CERTIFIÉ' : '❌ NON CERTIFIÉ';
        console.log(`${address}: ${status}`);
        if (!isConstructor) allCertified = false;
      } catch (error) {
        console.log(`${address}: ❓ ERREUR DE VÉRIFICATION`);
        allCertified = false;
      }
    }

    // Résultat final
    console.log('\n🏁 RÉSULTAT FINAL:');
    console.log('==================');
    
    if (allCertified) {
      console.log('🎉 MISSION ACCOMPLIE!');
      console.log('✅ Tous les constructeurs sont maintenant certifiés');
      console.log('🚗 Ils peuvent créer des véhicules dans AutoChain');
      console.log('🌐 L\'interface utilisateur les reconnaîtra comme constructeurs');
    } else {
      console.log('⚠️  CERTIFICATION INCOMPLÈTE');
      console.log('❌ Certains constructeurs ne sont pas certifiés');
      console.log('🔄 Relancez le script pour réessayer');
    }

    // Instructions pour la suite
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. 🔗 Connectez-vous à l\'interface avec un compte constructeur');
    console.log('2. 🚗 Testez la création de véhicules');
    console.log('3. 🏪 Mettez des véhicules en vente');
    console.log('4. 👥 Testez l\'achat avec des comptes utilisateurs');

  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE:', error.message);
    console.error('\n🔧 VÉRIFICATIONS:');
    console.error('1. Ganache est-il démarré sur le bon port ?');
    console.error('2. L\'adresse du contrat est-elle correcte ?');
    console.error('3. Le contrat est-il bien déployé ?');
    console.error('4. La clé privée admin est-elle correcte ?');
    process.exit(1);
  }
}

// Informations de démarrage
console.log('⚙️  CONFIGURATION DE CERTIFICATION');
console.log('==================================');
console.log(`🌐 Réseau: ${NETWORK_CONFIG.rpcUrl}`);
console.log(`📄 Contrat: ${NETWORK_CONFIG.contractAddress}`);
console.log(`👷 Constructeurs à certifier: ${CERTIFIED_CONSTRUCTORS.length}`);
console.log(`🔑 Admin: 0x${ADMIN_PRIVATE_KEY.slice(2, 10)}...${ADMIN_PRIVATE_KEY.slice(-8)}`);
console.log('');

// Exécution
if (require.main === module) {
  certifyConstructors().catch(console.error);
}

module.exports = { 
  certifyConstructors, 
  NETWORK_CONFIG, 
  CERTIFIED_CONSTRUCTORS,
  ADMIN_PRIVATE_KEY 
};