/**
 * AutoChain Constructor Setup Script
 * This script reads configuration from .env file and certifies constructors
 * 
 * Usage:
 * node scripts/setup-constructors.js
 */

require('dotenv').config()
const { ethers } = require('ethers')

// Configuration from environment variables
const CONFIG = {
  networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || 'Local Network',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:7545',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) || 1337,
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY,
  constructorAddresses: process.env.CONSTRUCTOR_ADDRESSES?.split(',').map(addr => addr.trim()) || [],
  constructorNames: process.env.CONSTRUCTOR_NAMES?.split(',').map(name => name.trim()) || [],
  constructorDescriptions: process.env.CONSTRUCTOR_DESCRIPTIONS?.split(',').map(desc => desc.trim()) || []
}

// Contract ABI (minimal for constructor management)
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function addConstructor(address ctor)",
  "function removeConstructor(address ctor)",
  "function isConstructor(address) view returns (bool)",
  "event ConstructorAdded(address indexed ctor)",
  "event ConstructorRemoved(address indexed ctor)"
]

async function validateConfiguration() {
  console.log('🔍 Validation de la configuration...')
  
  const errors = []
  
  if (!CONFIG.contractAddress) {
    errors.push('NEXT_PUBLIC_CONTRACT_ADDRESS manquant dans .env')
  }
  
  if (!CONFIG.adminPrivateKey) {
    errors.push('ADMIN_PRIVATE_KEY manquant dans .env')
  }
  
  if (CONFIG.constructorAddresses.length === 0) {
    errors.push('CONSTRUCTOR_ADDRESSES manquant dans .env')
  }
  
  if (CONFIG.constructorNames.length !== CONFIG.constructorAddresses.length) {
    errors.push('CONSTRUCTOR_NAMES doit avoir le même nombre d\'éléments que CONSTRUCTOR_ADDRESSES')
  }
  
  if (CONFIG.constructorDescriptions.length !== CONFIG.constructorAddresses.length) {
    errors.push('CONSTRUCTOR_DESCRIPTIONS doit avoir le même nombre d\'éléments que CONSTRUCTOR_ADDRESSES')
  }
  
  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration:')
    errors.forEach(error => console.error(`   - ${error}`))
    process.exit(1)
  }
  
  console.log('✅ Configuration valide')
  console.log(`📡 Réseau: ${CONFIG.networkName} (${CONFIG.rpcUrl})`)
  console.log(`📋 Contrat: ${CONFIG.contractAddress}`)
  console.log(`👤 Constructeurs à certifier: ${CONFIG.constructorAddresses.length}`)
}

async function setupProvider() {
  console.log('🔗 Connexion au réseau...')
  
  try {
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl)
    
    // Test de connexion
    const network = await provider.getNetwork()
    console.log(`✅ Connecté au réseau Chain ID: ${network.chainId}`)
    
    if (Number(network.chainId) !== CONFIG.chainId) {
      console.warn(`⚠️  Chain ID différent: attendu ${CONFIG.chainId}, reçu ${network.chainId}`)
    }
    
    return provider
  } catch (error) {
    console.error('❌ Impossible de se connecter au réseau:', error.message)
    process.exit(1)
  }
}

async function setupContract(provider) {
  console.log('📋 Initialisation du contrat...')
  
  try {
    const wallet = new ethers.Wallet(CONFIG.adminPrivateKey, provider)
    const contract = new ethers.Contract(CONFIG.contractAddress, CONTRACT_ABI, wallet)
    
    // Vérifier que le wallet est bien l'admin
    const adminAddress = await contract.admin()
    console.log(`👤 Admin du contrat: ${adminAddress}`)
    console.log(`🔑 Adresse du wallet: ${wallet.address}`)
    
    if (adminAddress.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('❌ Ce wallet n\'est pas l\'admin du contrat')
      process.exit(1)
    }
    
    console.log('✅ Wallet admin vérifié')
    return { contract, wallet }
  } catch (error) {
    console.error('❌ Erreur d\'initialisation du contrat:', error.message)
    process.exit(1)
  }
}

async function certifyConstructors(contract) {
  console.log('🏗️  Certification des constructeurs...')
  
  for (let i = 0; i < CONFIG.constructorAddresses.length; i++) {
    const address = CONFIG.constructorAddresses[i]
    const name = CONFIG.constructorNames[i]
    const description = CONFIG.constructorDescriptions[i]
    
    try {
      console.log(`\n📝 Traitement: ${name} (${address})`)
      
      // Vérifier si déjà certifié
      const isAlreadyCertified = await contract.isConstructor(address)
      
      if (isAlreadyCertified) {
        console.log(`✅ ${name} est déjà certifié`)
        continue
      }
      
      // Certifier le constructeur
      console.log(`🔄 Certification de ${name}...`)
      const tx = await contract.addConstructor(address)
      console.log(`📤 Transaction envoyée: ${tx.hash}`)
      
      const receipt = await tx.wait()
      console.log(`✅ ${name} certifié avec succès! Block: ${receipt.blockNumber}`)
      
      // Vérifier la certification
      const isNowCertified = await contract.isConstructor(address)
      if (isNowCertified) {
        console.log(`✅ Vérification: ${name} est maintenant certifié`)
      } else {
        console.error(`❌ Erreur: ${name} n'est pas certifié après la transaction`)
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la certification de ${name}:`, error.message)
    }
  }
}

async function displaySummary(contract) {
  console.log('\n📊 RÉSUMÉ FINAL')
  console.log('================')
  
  for (let i = 0; i < CONFIG.constructorAddresses.length; i++) {
    const address = CONFIG.constructorAddresses[i]
    const name = CONFIG.constructorNames[i]
    
    try {
      const isCertified = await contract.isConstructor(address)
      const status = isCertified ? '✅ CERTIFIÉ' : '❌ NON CERTIFIÉ'
      console.log(`${name.padEnd(15)} ${address} ${status}`)
    } catch (error) {
      console.log(`${name.padEnd(15)} ${address} ❌ ERREUR`)
    }
  }
  
  console.log('\n🎉 Script terminé!')
}

async function main() {
  console.log('🚀 AutoChain Constructor Setup')
  console.log('==============================\n')
  
  try {
    // 1. Valider la configuration
    await validateConfiguration()
    
    // 2. Se connecter au réseau
    const provider = await setupProvider()
    
    // 3. Initialiser le contrat
    const { contract } = await setupContract(provider)
    
    // 4. Certifier les constructeurs
    await certifyConstructors(contract)
    
    // 5. Afficher le résumé
    await displaySummary(contract)
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { CONFIG, main }