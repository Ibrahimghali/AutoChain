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

// Base de données des constructeurs certifiés
export const CONSTRUCTORS: Record<string, ConstructorInfo> = {
  // Constructeurs réels certifiés dans le contrat AutoChain
  "0x2f609e0c31ad4f3ee42ebef47cf347d198dee998": {
    address: "0x2f609e0c31ad4f3ee42ebef47cf347d198dee998",
    name: "Tesla Motors",
    brand: "Tesla",
    logo: "/tesla-logo.png",
    description: "Constructeur de véhicules électriques premium et innovant",
    website: "https://tesla.com",
    primaryColor: "#dc2626", // red-600
    secondaryColor: "#fef2f2", // red-50
  },
  "0x390953dfbd34bc86c6fb9acfd137606ffa0c4baa": {
    address: "0x390953dfbd34bc86c6fb9acfd137606ffa0c4baa",
    name: "BMW Group",
    brand: "BMW",
    logo: "/bmw-logo.png",
    description: "Constructeur automobile allemand de luxe et performance",
    website: "https://bmw.com",
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#eff6ff", // blue-50
  },
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
