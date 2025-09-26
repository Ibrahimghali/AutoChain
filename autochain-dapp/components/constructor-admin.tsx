"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useConstructor } from "@/hooks/use-constructor"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AlertCircle, CheckCircle, Plus, Trash2, Users, Shield } from "lucide-react"

interface ConstructorStatus {
  address: string
  isConstructor: boolean
}

export function ConstructorAdmin() {
  const { account, userRole } = useWeb3()
  const { 
    isLoading, 
    certifiedConstructors,
    addConstructor,
    removeConstructor,
    checkAllConstructors,
    initializeCertifiedConstructors
  } = useConstructor()
  
  const { toast } = useToast()
  const [newConstructorAddress, setNewConstructorAddress] = useState("")
  const [constructorStatuses, setConstructorStatuses] = useState<ConstructorStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)

  // Vérifier que l'utilisateur est admin
  const isAdmin = userRole === "constructor" || account === "0x..." // Remplacer par l'adresse admin réelle

  // Charger le statut des constructeurs au montage
  useEffect(() => {
    if (isAdmin) {
      handleCheckAllStatuses()
    }
  }, [isAdmin])

  // Vérifier le statut de tous les constructeurs
  const handleCheckAllStatuses = async () => {
    setIsChecking(true)
    try {
      const statuses = await checkAllConstructors()
      setConstructorStatuses(statuses)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de vérifier le statut: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Ajouter un constructeur
  const handleAddConstructor = async () => {
    if (!newConstructorAddress.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse valide",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await addConstructor(newConstructorAddress.trim())
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })
        setNewConstructorAddress("")
        // Rafraîchir les statuts
        await handleCheckAllStatuses()
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Supprimer un constructeur
  const handleRemoveConstructor = async (address: string) => {
    try {
      const result = await removeConstructor(address)
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })
        // Rafraîchir les statuts
        await handleCheckAllStatuses()
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Initialiser tous les constructeurs certifiés
  const handleInitializeAll = async () => {
    try {
      const result = await initializeCertifiedConstructors()
      
      if (result.success) {
        toast({
          title: "Initialisation terminée",
          description: `${result.results.filter(r => r.success).length} constructeurs traités avec succès`,
        })
      } else {
        toast({
          title: "Initialisation partiellement réussie",
          description: "Certains constructeurs n'ont pas pu être ajoutés",
          variant: "destructive"
        })
      }
      
      // Rafraîchir les statuts
      await handleCheckAllStatuses()
    } catch (error: any) {
      toast({
        title: "Erreur d'initialisation",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administration des Constructeurs
          </CardTitle>
          <CardDescription>
            Accès restreint aux administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Administration des Constructeurs
          </CardTitle>
          <CardDescription>
            Gérez les constructeurs certifiés pour le système AutoChain
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleInitializeAll} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <LoadingSpinner />}
              <Plus className="h-4 w-4" />
              Initialiser tous les constructeurs certifiés
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCheckAllStatuses}
              disabled={isChecking}
              className="flex items-center gap-2"
            >
              {isChecking && <LoadingSpinner />}
              <CheckCircle className="h-4 w-4" />
              Vérifier les statuts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ajouter un constructeur */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Constructeur</CardTitle>
          <CardDescription>
            Ajoutez une nouvelle adresse comme constructeur certifié
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0x..."
              value={newConstructorAddress}
              onChange={(e) => setNewConstructorAddress(e.target.value)}
              className="font-mono"
            />
            <Button 
              onClick={handleAddConstructor}
              disabled={isLoading || !newConstructorAddress.trim()}
            >
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des constructeurs */}
      <Card>
        <CardHeader>
          <CardTitle>Constructeurs Certifiés</CardTitle>
          <CardDescription>
            Liste des adresses définies comme constructeurs certifiés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {constructorStatuses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Aucun statut de constructeur vérifié</p>
              <Button variant="outline" onClick={handleCheckAllStatuses} className="mt-4">
                Vérifier les statuts
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {constructorStatuses.map((status, index) => (
                <div key={status.address} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-mono text-sm">{status.address}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={status.isConstructor ? "default" : "secondary"} 
                             className={status.isConstructor ? "bg-green-100 text-green-800" : ""}>
                        {status.isConstructor ? "Constructeur Certifié" : "Non Certifié"}
                      </Badge>
                      {certifiedConstructors.includes(status.address) && (
                        <Badge variant="outline">Prédéfini</Badge>
                      )}
                    </div>
                  </div>
                  
                  {status.isConstructor && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveConstructor(status.address)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur les constructeurs prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle>Constructeurs Prédéfinis</CardTitle>
          <CardDescription>
            Adresses définies dans le fichier constructeurs.txt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {certifiedConstructors.map((address, index) => (
              <div key={address} className="font-mono text-sm p-2 bg-muted rounded">
                {address}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}