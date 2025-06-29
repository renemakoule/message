"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export default function AuthTestPage() {
  const { signInWithGoogle } = useAuth()
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Check environment variables
    setConfig({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      origin: window.location.origin,
      callbackUrl: `${window.location.origin}/auth/callback`,
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
    })
  }, [])

  const handleTestAuth = () => {
    console.log("Testing authentication...")
    signInWithGoogle()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Test de Configuration d'Authentification</CardTitle>
          <CardDescription>
            Vérifiez que votre configuration Supabase est correcte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {config && (
            <div className="space-y-4">
              <h3 className="font-semibold">Configuration actuelle :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Supabase URL:</strong> {config.supabaseUrl}
                </div>
                <div>
                  <strong>Supabase Key:</strong> {config.supabaseKey}
                </div>
                <div>
                  <strong>Origin:</strong> {config.origin}
                </div>
                <div>
                  <strong>Callback URL:</strong> {config.callbackUrl}
                </div>
                <div>
                  <strong>Cookies activés:</strong> {config.cookiesEnabled ? "✅ Oui" : "❌ Non"}
                </div>
                <div>
                  <strong>User Agent:</strong> 
                  <div className="text-xs mt-1 p-2 bg-gray-100 rounded">
                    {config.userAgent}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Instructions de configuration Supabase :</h3>
            <div className="text-sm space-y-2">
              <p><strong>1. Authentication &gt; URL Configuration :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Site URL: <code className="bg-gray-100 px-1 rounded">{config?.origin}</code></li>
                <li>Redirect URLs: <code className="bg-gray-100 px-1 rounded">{config?.callbackUrl}</code></li>
              </ul>
              
              <p><strong>2. Authentication &gt; Providers &gt; Google :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Vérifiez que Google OAuth est activé</li>
                <li>Vérifiez que les credentials sont corrects</li>
                <li>Vérifiez que l'URL de redirection est autorisée</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleTestAuth} className="w-full">
              Tester l'authentification Google
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"} 
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p><strong>Note :</strong> Si l'authentification échoue, vérifiez :</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Les variables d'environnement dans votre fichier .env.local</li>
              <li>La configuration dans le dashboard Supabase</li>
              <li>Les logs dans la console du navigateur</li>
              <li>Les logs dans le terminal de développement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 