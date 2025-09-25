"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { BlockchainStatus } from "@/components/blockchain-status"
import { ConstructorHeader } from "@/components/constructor-header" // Added constructor header import
import { useWeb3 } from "@/hooks/use-web3"
import {
  Car,
  Shield,
  History,
  CheckCircle,
  ArrowRight,
  Wallet,
  Users,
  TrendingUp,
  Lock,
  Zap,
  Globe,
} from "lucide-react"

export default function HomePage() {
  const { isConnected, userRole, connect, isLoading, error, account } = useWeb3() // Added account to destructuring

  const features = [
    {
      icon: Shield,
      title: "Certification Constructeur",
      description: "Chaque véhicule est certifié officiellement par son constructeur sur la blockchain.",
      color: "text-primary",
    },
    {
      icon: History,
      title: "Traçabilité Complète",
      description: "Historique transparent et immuable de tous les propriétaires successifs.",
      color: "text-accent",
    },
    {
      icon: Lock,
      title: "Transactions Sécurisées",
      description: "Achats et ventes sécurisés via smart contracts Ethereum.",
      color: "text-chart-3",
    },
    {
      icon: Zap,
      title: "Processus Simplifié",
      description: "Interface intuitive pour créer, vendre et acheter des véhicules.",
      color: "text-chart-4",
    },
  ]

  const stats = [
    { label: "Véhicules Certifiés", value: "12,847", icon: Car },
    { label: "Constructeurs Partenaires", value: "24", icon: Users },
    { label: "Transactions Réalisées", value: "3,291", icon: TrendingUp },
    { label: "Utilisateurs Actifs", value: "8,456", icon: Globe },
  ]

  const benefits = [
    "Élimination des fraudes et falsifications",
    "Réduction des coûts de transaction",
    "Confiance renforcée entre acheteurs et vendeurs",
    "Processus de vente accéléré",
    "Valeur résiduelle préservée",
    "Conformité réglementaire automatique",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/" userRole={userRole} isConnected={isConnected} onConnectWallet={connect} />

      {isConnected && userRole === "constructor" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <ConstructorHeader />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="blockchain-grid absolute inset-0 opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              Révolution Blockchain Automobile
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              <span className="text-foreground">Transformez la vente de</span>
              <br />
              <span className="text-primary">véhicules avec AutoChain</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8">
              La première plateforme décentralisée qui garantit la traçabilité complète, la certification constructeur
              et la sécurité des transactions automobiles grâce à la blockchain Ethereum.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <Button
                  size="lg"
                  onClick={connect}
                  disabled={isLoading}
                  className="flex items-center space-x-2 glow-effect"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{isLoading ? "Connexion..." : "Connecter MetaMask"}</span>
                </Button>
              ) : (
                <Button size="lg" asChild className="glow-effect">
                  <a href="/dashboard" className="flex items-center space-x-2">
                    <Car className="w-5 h-5" />
                    <span>Accéder au Tableau de Bord</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <a href="#features">En savoir plus</a>
              </Button>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              <BlockchainStatus
                isConnected={isConnected}
                account={account} // Using account from useWeb3 hook
                userRole={userRole}
                error={error}
                onConnect={connect}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">
              Pourquoi choisir <span className="text-primary">AutoChain</span> ?
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Une solution complète qui révolutionne le marché automobile grâce à la technologie blockchain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="car-card-hover border-border/50">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Avantages clés de la blockchain</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl">Comment ça fonctionne ?</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Certification</h4>
                    <p className="text-sm text-muted-foreground">
                      Le constructeur enregistre et certifie le véhicule sur la blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Mise en vente</h4>
                    <p className="text-sm text-muted-foreground">
                      Le propriétaire met son véhicule en vente via smart contract
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-chart-3 rounded-full flex items-center justify-center text-background text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Transaction sécurisée</h4>
                    <p className="text-sm text-muted-foreground">
                      L'acheteur effectue le paiement et devient automatiquement propriétaire
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">
            Prêt à révolutionner vos transactions automobiles ?
          </h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8">
            Rejoignez la communauté AutoChain et découvrez une nouvelle façon de vendre et d'acheter des véhicules.
          </p>
          {!isConnected ? (
            <Button
              size="lg"
              onClick={connect}
              disabled={isLoading}
              className="flex items-center space-x-2 glow-effect mx-auto"
            >
              <Wallet className="w-5 h-5" />
              <span>{isLoading ? "Connexion en cours..." : "Commencer maintenant"}</span>
            </Button>
          ) : (
            <Button size="lg" asChild className="glow-effect">
              <a href="/dashboard" className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>Accéder à votre tableau de bord</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoChain</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 AutoChain. Plateforme décentralisée de vente automobile.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
