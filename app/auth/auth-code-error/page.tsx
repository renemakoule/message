"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Database, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams } from "next/navigation"

export default function AuthCodeErrorPage() {
  const { signInWithGoogle } = useAuth()
  const searchParams = useSearchParams()
  
  const error = searchParams.get("error")
  const description = searchParams.get("description")
  const code = searchParams.get("code")

  const handleRetry = () => {
    signInWithGoogle()
  }

  const getErrorMessage = () => {
    switch (error) {
      case "server_error":
        return "Erreur serveur lors de l'authentification"
      case "database_error":
        return "Erreur de base de données"
      case "pkce_error":
        return "Erreur de session (PKCE)"
      case "session_error":
        return "Erreur lors de la création de la session"
      case "session_exception":
        return "Exception inattendue lors de l'authentification"
      case "no_code":
        return "Code d'authentification manquant"
      default:
        return "Erreur d'authentification"
    }
  }

  const getErrorIcon = () => {
    switch (error) {
      case "database_error":
        return <Database className="h-6 w-6 text-red-600" />
      case "pkce_error":
        return <Settings className="h-6 w-6 text-red-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-red-600" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-xl">{getErrorMessage()}</CardTitle>
          <CardDescription>
            {description || "Une erreur s'est produite lors de votre connexion. Veuillez réessayer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>L'erreur peut être due à :</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Un problème temporaire de connexion</li>
              <li>Une erreur de base de données</li>
              <li>Un problème de configuration</li>
              <li>Une session expirée</li>
            </ul>
          </div>
          
          {error === "database_error" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <Settings className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Erreur de base de données détectée
                  </p>
                  <p className="text-sm text-yellow-700 mb-2">
                    Cette erreur indique un problème avec la configuration de la base de données Supabase.
                  </p>
                  <div className="text-xs text-yellow-600 space-y-1">
                    <p><strong>Actions recommandées :</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Vérifiez que les tables sont créées correctement</li>
                      <li>Vérifiez les politiques RLS (Row Level Security)</li>
                      <li>Vérifiez les permissions de la base de données</li>
                      <li>Exécutez les scripts de migration si nécessaire</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error === "server_error" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> Cette erreur peut être temporaire. Si le problème persiste, 
                vérifiez que votre base de données Supabase est accessible et que les tables sont correctement configurées.
              </p>
            </div>
          )}
          
          {error === "pkce_error" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Settings className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Erreur de session détectée
                  </p>
                  <p className="text-sm text-blue-700 mb-2">
                    Cette erreur indique un problème avec les cookies de session. Cela peut être dû à :
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Les cookies sont bloqués par le navigateur</li>
                      <li>Mode navigation privée/incognito</li>
                      <li>Extensions de navigateur qui bloquent les cookies</li>
                      <li>Problème temporaire de session</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer la connexion
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
          
          {code && (
            <div className="text-xs text-gray-500 text-center">
              Code d'erreur: {code}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 