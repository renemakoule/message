"use client"
 
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Zap, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
 
export default function SupabaseLoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
 
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  }
 
  return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
<div className="w-full max-w-md space-y-8">
<div className="text-center">
<div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
<MessageCircle className="h-8 w-8 text-white" />
</div>
<h1 className="text-3xl font-bold text-gray-900">MessagingApp</h1>
<p className="text-gray-600 mt-2">Connectez-vous pour commencer à discuter</p>
</div>
 
        <Card className="shadow-xl">
<CardHeader className="text-center">
<CardTitle>Bienvenue</CardTitle>
<CardDescription>
              Connectez-vous avec votre compte Google pour accéder à toutes les fonctionnalités
</CardDescription>
</CardHeader>
<CardContent className="space-y-6">
<Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
              size="lg"
>
              {isLoading ? (
<div className="flex items-center space-x-2">
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
<span>Connexion en cours...</span>
</div>
              ) : (
<div className="flex items-center space-x-2">
<svg className="h-5 w-5" viewBox="0 0 24 24">
<path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
<path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
<path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
<path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
</svg>
<span>Continuer avec Google</span>
</div>
              )}
</Button>
<div className="space-y-4 pt-4 border-t">
<h3 className="font-semibold text-center text-gray-900">Fonctionnalités incluses</h3>
<div className="grid grid-cols-2 gap-4">
<div className="flex items-center space-x-2"><MessageCircle className="h-4 w-4 text-blue-600" /> <span className="text-sm text-gray-600">Messages temps réel</span></div>
<div className="flex items-center space-x-2"><Users className="h-4 w-4 text-green-600" /> <span className="text-sm text-gray-600">Groupes privés</span></div>
<div className="flex items-center space-x-2"><Zap className="h-4 w-4 text-yellow-600" /> <span className="text-sm text-gray-600">Notifications</span></div>
<div className="flex items-center space-x-2"><Shield className="h-4 w-4 text-purple-600" /> <span className="text-sm text-gray-600">Sécurisé</span></div>
</div>
</div>
</CardContent>
</Card>
<div className="text-center text-sm text-gray-500"><p>En vous connectant, vous acceptez nos conditions d'utilisation</p></div>
</div>
</div>
  )
}