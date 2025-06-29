"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function AuthDebugPage() {
  const { signInWithGoogle } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleTestAuth = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      addLog("Starting authentication test...")
      
      // Test 1: Check if Supabase client is working
      addLog("Testing Supabase client...")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`)
      } else {
        addLog(`✅ Session check passed: ${session ? 'Has session' : 'No session'}`)
      }
      
      // Test 2: Check environment variables
      addLog("Checking environment variables...")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl) {
        addLog("❌ NEXT_PUBLIC_SUPABASE_URL is missing")
      } else {
        addLog(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl.substring(0, 20)}...`)
      }
      
      if (!supabaseKey) {
        addLog("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
      } else {
        addLog(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`)
      }
      
      // Test 3: Try to initiate OAuth
      addLog("Initiating Google OAuth...")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      
      if (error) {
        addLog(`❌ OAuth error: ${error.message}`)
      } else {
        addLog(`✅ OAuth initiated successfully`)
        if (data.url) {
          addLog(`🔗 Redirect URL: ${data.url}`)
          addLog("Click the button below to continue with the redirect...")
        } else {
          addLog("⚠️ No redirect URL provided")
        }
      }
      
    } catch (error) {
      addLog(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleContinueRedirect = () => {
    addLog("Continuing with redirect...")
    signInWithGoogle()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Debug d'Authentification</CardTitle>
          <CardDescription>
            Testez l'authentification étape par étape pour identifier les problèmes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleTestAuth} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Test en cours..." : "Tester l'authentification"}
            </Button>
            
            <Button 
              onClick={handleContinueRedirect}
              variant="outline"
              className="w-full"
            >
              Continuer avec la redirection
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"} 
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Logs de test :</h3>
            <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">Aucun log pour le moment. Cliquez sur "Tester l'authentification" pour commencer.</p>
              ) : (
                <div className="space-y-1 text-sm font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p><strong>Instructions :</strong></p>
            <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
              <li>Cliquez sur "Tester l'authentification" pour vérifier la configuration</li>
              <li>Si tout est OK, cliquez sur "Continuer avec la redirection"</li>
              <li>Vérifiez les logs pour identifier les problèmes</li>
              <li>Regardez aussi la console du navigateur pour plus de détails</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 