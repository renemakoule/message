"use client"


import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMessagingStore } from "@/lib/store"
import { useConversations } from "@/hooks/use-conversations"
import { useNotifications } from "@/hooks/use-notifications"
import SupabaseLoginPage from "@/components/auth/supabase-login-page"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { MessagingInterface } from "@/components/messaging-interface"


/**
 * Component rendered only when the user is authenticated.
 * It handles the logic of fetching user-specific data like conversations.
 */
function AuthenticatedApp() {
  const currentUser = useMessagingStore((state) => state.currentUser);
  
  // Activer le hook de notifications pour l'utilisateur authentifié
  useNotifications();
  
  const { conversations, loading, error, refetch } = useConversations(currentUser?.id);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>Erreur lors du chargement des conversations.</p>
      </div>
    );
  }


  // La fonction de rafraîchissement est passée pour être appelée après la création d'une nouvelle conversation.
  const handleConversationCreated = () => {
    refetch();
  };


  if (conversations.length === 0) {
    return <WelcomeScreen onConversationCreated={handleConversationCreated} />;
  }


  return <MessagingInterface />;
}




/**
 * Main application entry point.
 * This component acts as a router based on the authentication state.
 */
export default function App() {
  // --- CORRECTION: TOUS les hooks sont appelés au niveau supérieur ---
  const { loading: authIsLoading } = useAuth();
  const isAuthenticated = useMessagingStore((state) => state.isAuthenticated);
  const currentUser = useMessagingStore((state) => state.currentUser);


  // L'état de chargement initial est maintenant géré par le hook `useAuth`.
  if (authIsLoading && !currentUser) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  // Après le chargement initial, on peut se fier à l'état du store.
  if (!isAuthenticated) {
    return <SupabaseLoginPage />;
  }
  
  // Si l'utilisateur est authentifié, on est certain que `currentUser` est disponible.
  return <AuthenticatedApp />;
}



