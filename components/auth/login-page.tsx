"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Zap } from "lucide-react"
import { useMessagingStore } from "@/lib/store"

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { setCurrentUser, setAuthenticated } = useMessagingStore()

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      // Simuler la connexion Google (à remplacer par Supabase Auth)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simuler les données utilisateur de Google
      const mockUser = {
        id: "current-user",
        name: "John Doe",
        email: "john.doe@gmail.com",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "online" as const,
        about: "Nouveau sur la plateforme",
      }

      setCurrentUser(mockUser)
      setAuthenticated(true)
    } catch (error) {
      console.error("Erreur de connexion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatApp</h1>
          <p className="text-gray-600">Connectez-vous et commencez à discuter</p>
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>Connectez-vous avec votre compte Google pour accéder à vos conversations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bouton Google */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Connexion en cours...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuer avec Google
                </div>
              )}
            </Button>

            {/* Fonctionnalités */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span>Messages instantanés et sécurisés</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-green-500" />
                <span>Conversations de groupe</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Notifications en temps réel</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
        </div>
      </div>
    </div>
  )
}
