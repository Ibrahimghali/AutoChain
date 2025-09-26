// Configuration des constructeurs certifiés
export interface ConstructorInfo {
  address: string
  name: string
  brand: string
  logo?: string
  description: string
  website?: string
  primaryColor: string
  secondaryColor: string
}

// Couleurs par défaut pour les constructeurs
const DEFAULT_COLORS = [
  { primary: "#dc2626", secondary: "#fef2f2" }, // red
  { primary: "#2563eb", secondary: "#eff6ff" }, // blue
  { primary: "#059669", secondary: "#ecfdf5" }, // emerald
  { primary: "#7c3aed", secondary: "#f3e8ff" }, // violet
  { primary: "#ea580c", secondary: "#fff7ed" }, // orange
  { primary: "#0891b2", secondary: "#ecfeff" }, // cyan
]

// Charger les constructeurs depuis les variables d'environnement
function loadConstructorsFromEnv(): Record<string, ConstructorInfo> {
  const constructors: Record<string, ConstructorInfo> = {}
  
  const addresses = process.env.NEXT_PUBLIC_CONSTRUCTOR_ADDRESSES?.split(',').map(addr => addr.trim()) || []
  const names = process.env.NEXT_PUBLIC_CONSTRUCTOR_NAMES?.split(',').map(name => name.trim()) || []
  const descriptions = process.env.NEXT_PUBLIC_CONSTRUCTOR_DESCRIPTIONS?.split(',').map(desc => desc.trim()) || []
  
  addresses.forEach((address, index) => {
    if (address) {
      const name = names[index] || `Constructeur ${index + 1}`
      const description = descriptions[index] || `Constructeur automobile certifié`
      const colorIndex = index % DEFAULT_COLORS.length
      const colors = DEFAULT_COLORS[colorIndex]
      
      constructors[address.toLowerCase()] = {
        address: address.toLowerCase(),
        name,
        brand: name.replace(/\s*(Motors|Group|AG|Corporation|Corp|Inc|Ltd).*$/i, ''), // Extraire la marque
        logo: `/${name.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
        description,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
      }
    }
  })
  
  return constructors
}

// Base de données des constructeurs certifiés (générée dynamiquement)
export const CONSTRUCTORS: Record<string, ConstructorInfo> = loadConstructorsFromEnv()

// Constructeurs d'exemple pour les tests (sera supprimé en production)
const EXAMPLE_CONSTRUCTORS: Record<string, ConstructorInfo> = {
  // Constructeurs d'exemple (garder pour compatibilité)
  "0x3456789012345678901234567890123456789012": {
    address: "0x3456789012345678901234567890123456789012",
    name: "Mercedes-Benz",
    brand: "Mercedes",
    logo: "/mercedes-logo.png",
    description: "Constructeur automobile allemand premium",
    website: "https://mercedes-benz.com",
    primaryColor: "#059669", // emerald-600
    secondaryColor: "#ecfdf5", // emerald-50
  },
  "0x4567890123456789012345678901234567890123": {
    address: "0x4567890123456789012345678901234567890123",
    name: "Audi AG",
    brand: "Audi",
    logo: "/audi-logo.png",
    description: "Constructeur automobile allemand de luxe",
    website: "https://audi.com",
    primaryColor: "#7c3aed", // violet-600
    secondaryColor: "#f5f3ff", // violet-50
  },
}

// Fonction pour obtenir les informations d'un constructeur par son adresse
export function getConstructorInfo(address: string): ConstructorInfo | null {
  const normalizedAddress = address.toLowerCase()

  // Chercher par adresse exacte
  for (const [key, constructor] of Object.entries(CONSTRUCTORS)) {
    if (key.toLowerCase() === normalizedAddress || constructor.address.toLowerCase() === normalizedAddress) {
      return constructor
    }
  }

  return null
}

// Fonction pour obtenir tous les constructeurs
export function getAllConstructors(): ConstructorInfo[] {
  return Object.values(CONSTRUCTORS)
}

// Fonction pour vérifier si une adresse est un constructeur certifié
export function isKnownConstructor(address: string): boolean {
  return getConstructorInfo(address) !== null
}

// Fonction pour obtenir la couleur primaire d'un constructeur
export function getConstructorPrimaryColor(address: string): string {
  const constructor = getConstructorInfo(address)
  return constructor?.primaryColor || "#6b7280" // gray-500 par défaut
}

// Fonction pour obtenir la couleur secondaire d'un constructeur
export function getConstructorSecondaryColor(address: string): string {
  const constructor = getConstructorInfo(address)
  return constructor?.secondaryColor || "#f9fafb" // gray-50 par défaut
}
