"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { uploadMedia, useMessagingStore, type Message } from "@/lib/store"
import type { Database } from "@/lib/supabase"
import { toast } from "sonner"

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]
type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export function useMessages(conversationId?: string, id?: string | undefined) {
  const { setMessages, addMessage, updateMessage, removeMessage, currentUser } = useMessagingStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Le hook charge uniquement les messages initiaux dans le store.
  // Le temps réel est géré globalement par RealtimeManager.
  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]); // Vider les messages si pas de conversation
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(`*, sender:users(*)`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data as Message[]) || []);
      setError(null);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId, setMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = async (
    content: string,
    type: "text" | "image" | "video" | "file" = "text",
    mediaData?: { media_url: string; file_name: string; file_size: number },
  ) => {
    if (!conversationId || !currentUser) {
      toast.error("Impossible d'envoyer le message. Utilisateur ou conversation non défini.");
      throw new Error("Missing required parameters");
    }

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content, type,
      media_url: mediaData?.media_url || null,
      file_name: mediaData?.file_name || null,
      file_size: mediaData?.file_size || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edited_at: null,
      status: 'sending',
      sender: currentUser,
      reply_to: null,
    };

    addMessage(optimisticMessage);

    try {
      const messageInsert: MessageInsert = {
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content, type,
        media_url: mediaData?.media_url,
        file_name: mediaData?.file_name,
        file_size: mediaData?.file_size,
        status: 'sent',
      };

      const { data: realMessage, error: insertError } = await supabase
        .from("messages")
        .insert(messageInsert)
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Le RealtimeManager va intercepter cet insert et mettre à jour le message.
      // On peut laisser la mise à jour optimiste ici pour une réactivité maximale.
      updateMessage(tempId, { ...realMessage, sender: currentUser, status: 'sent' } as Message);

    } catch (err: any) {
      console.error("Supabase error details:", { message: err.message, details: err.details, hint: err.hint, code: err.code });
      const userFriendlyMessage = err.code === '42501' ? "Permission refusée." : "Échec de l'envoi du message.";
      toast.error(userFriendlyMessage, { description: err.message });
      
      removeMessage(tempId);
      throw err;
    }
  }

  const sendMediaMessage = async (file: File, caption: string, type: "image" | "video" | "file") => {
     if (!conversationId || !currentUser) throw new Error("Missing required parameters")

    const toastId = toast.loading("Envoi du média...");

    try {
      const publicUrl = await uploadMedia(file, "media", currentUser.id)
      await sendMessage(caption, type, {
        media_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
      })
      toast.success("Média envoyé !", { id: toastId });
    } catch (err) {
      console.error("Error sending media message:", err)
      toast.error("Échec de l'envoi du média.", { id: toastId });
      throw err
    }
  };

  const startTyping = async () => { 
      // Cette fonction devrait maintenant utiliser un service centralisé si nécessaire
      // ou être gérée différemment, mais pour l'instant on la laisse.
      if (!conversationId || !currentUser) return;
      // Il faudrait une méthode dans RealtimeManager pour ça.
      // await RealtimeManager.sendTypingIndicator(conversationId, currentUser.id)
  };

  return {
    loading,
    error,
    sendMessage,
    sendMediaMessage,
    startTyping,
    refetch: loadMessages,
  };
}