"use client"

import { useEffect } from "react"
import { useMessagingStore } from "@/lib/store"
import { LoginPage } from "@/components/auth/login-page"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { MessagingInterface } from "@/components/messaging-interface"

export default function App() {
  const { isAuthenticated, currentUser, conversations } = useMessagingStore()

  // Simuler la vérification de l'authentification au chargement
  useEffect(() => {
    // Ici, on vérifierait le token Supabase
    // Pour la démo, on reste non authentifié par défaut
  }, [])

  // Page de connexion
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />
  }

  // Écran d'accueil pour nouvel utilisateur
  if (conversations.length === 0) {
    return <WelcomeScreen />
  }

  // Interface de messagerie principale
  return <MessagingInterface />
}
