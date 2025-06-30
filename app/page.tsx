"use client"

import { useEffect } from "react";
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMessagingStore } from "@/lib/store"
import { useConversations } from "@/hooks/use-conversations"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { MessagingInterface } from "@/components/messaging-interface"
import SupabaseLoginPage from "@/components/auth/supabase-login-page"
import { RealtimeManager } from "@/lib/realtime-manager";

function AuthenticatedApp() {
  const currentUser = useMessagingStore((state) => state.currentUser);
  const conversations = useMessagingStore((state) => state.conversations); // On lit les conversations depuis le store
  
  useEffect(() => {
    if (currentUser?.id) {
      RealtimeManager.initialize(currentUser.id);
    }
    return () => {
      RealtimeManager.cleanup();
    };
  }, [currentUser?.id]);

  // Le hook ne sert plus qu'à déclencher le chargement et obtenir les actions
  const { loading, error, refetch } = useConversations(currentUser?.id);

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const handleConversationCreated = () => {
    refetch();
  };

  if (conversations.length === 0 && !loading) {
    return <WelcomeScreen onConversationCreated={handleConversationCreated} />;
  }

  return <MessagingInterface />;
}

export default function App() {
  const { loading: authIsLoading } = useAuth();
  const isAuthenticated = useMessagingStore((state) => state.isAuthenticated);
  const currentUser = useMessagingStore((state) => state.currentUser);

  if (authIsLoading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <SupabaseLoginPage />;
  }
  
  return <AuthenticatedApp />;
}