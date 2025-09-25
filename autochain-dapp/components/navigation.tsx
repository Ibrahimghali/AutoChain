"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWeb3 } from "@/hooks/use-web3"
import { useAutoChain } from "@/hooks/use-autochain"
import { Car, Home, Plus, ShoppingCart, History, Wallet, Menu, X } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isConnected, account, userRole, connect } = useWeb3()
  const { canCreateCar } = useAutoChain()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: "/", label: "Accueil", icon: Home, show: true },
    { href: "/dashboard", label: "Tableau de bord", icon: Car, show: true }, // Temporarily always show
    { href: "/create-car", label: "Créer véhicule", icon: Plus, show: canCreateCar },
    { href: "/buy-car", label: "Acheter", icon: ShoppingCart, show: true }, // Temporarily always show
    { href: "/history", label: "Historique", icon: History, show: true }, // Temporarily always show
  ]

  console.log("Navigation state:", { isConnected, account, userRole, canCreateCar })

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error("Erreur de connexion:", error)
    }
  }

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AutoChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems
              .filter((item) => item.show)
              .map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <Card className="px-3 py-2 bg-primary/10 border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-muted-foreground">
                    {userRole === "constructor" && "Constructeur"}
                    {userRole === "user" && "Utilisateur"}
                    {account && ` • ${account.slice(0, 6)}...${account.slice(-4)}`}
                  </span>
                </div>
              </Card>
            ) : (
              <Button onClick={handleConnect} className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Connecter MetaMask</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navigationItems
                .filter((item) => item.show)
                .map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start flex items-center space-x-2"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
