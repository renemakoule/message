"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { RealtimeService } from "@/lib/realtime"
import { uploadMedia } from "@/lib/store"
import type { Database } from "@/lib/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"] & { sender: User }
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

export function useMessages(conversationId?: string, userId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select(`*, sender:users(*)`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (fetchError) throw fetchError

      setMessages((data as Message[]) || [])
      setError(null)
    } catch (err) {
      console.error("Error loading messages:", err)
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // --- CORRECTION : GESTION DE LA MISE À JOUR EN TEMPS RÉEL ET NOTIFICATIONS ---
  useEffect(() => {
    if (!conversationId || !userId) {
      console.log(`❌ Cannot subscribe to conversation: conversationId=${conversationId}, userId=${userId}`)
      return
    }

    console.log(`🔔 Setting up real-time subscription for conversation: ${conversationId}, user: ${userId}`)

    const channel = RealtimeService.subscribeToConversation(
      conversationId,
      (newMessage) => {
        console.log(`📨 Received real-time message:`, newMessage)
        // Vérifier si c'est un message d'un autre utilisateur
        if (newMessage.sender_id !== userId) {
          console.log(`📨 Processing message from other user: ${newMessage.sender_id}`)
          // Ajouter le message à l'état local
          setMessages((prevMessages) => {
            // Éviter les doublons en vérifiant l'ID ET le timestamp
            const isDuplicate = prevMessages.some((msg) => 
              msg.id === newMessage.id || 
              (msg.content === newMessage.content && 
               Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 1000)
            )
            
            if (isDuplicate) {
              console.log('Duplicate message detected, skipping:', newMessage.id)
              return prevMessages
            }
            
            console.log('Adding real-time message:', newMessage)
            return [...prevMessages, newMessage as Message]
          })

          // Les notifications sont maintenant gérées par le hook useNotifications global
          // pour éviter les doublons et gérer toutes les conversations
        } else {
          console.log(`📨 Processing own message: ${newMessage.id}`)
          // C'est un message de l'utilisateur actuel, on peut le traiter différemment
          // Par exemple, on peut mettre à jour le statut d'un message optimiste
        setMessages((prevMessages) => {
            const tempMessage = prevMessages.find(msg => 
              msg.id.startsWith('temp_') && 
              msg.content === newMessage.content &&
              msg.sender_id === userId
            )
            
            if (tempMessage) {
              console.log('Updating temp message with real message:', newMessage)
              return prevMessages.map(msg => 
                msg.id === tempMessage.id 
                  ? { ...newMessage, sender: tempMessage.sender } as Message 
                  : msg
              )
            }
            
            return prevMessages
          })
        }
      },
      (typingIndicators) => {
        console.log(`⌨️ Typing indicators updated:`, typingIndicators)
        // Logique de l'indicateur de frappe
      },
    )

    console.log(`✅ Real-time subscription established for conversation: ${conversationId}`)

    return () => {
      console.log(`🔌 Cleaning up real-time subscription for conversation: ${conversationId}`)
      RealtimeService.unsubscribe(`conversation:${conversationId}`)
    }
  }, [conversationId, userId])

  const sendMessage = async (
    content: string,
    type: "text" | "image" | "video" | "file" = "text",
    mediaData?: { media_url: string; file_name: string; file_size: number },
  ) => {
    if (!conversationId || !userId) throw new Error("Missing required parameters")

    try {
      // --- CORRECTION : MISE À JOUR OPTIMISTE AMÉLIORÉE ---
      // 1. Créez un message temporaire pour l'UI
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const { data: currentUserProfile } = await supabase.from('users').select('*').eq('id', userId).single()
      
      if (!currentUserProfile) throw new Error("Current user profile not found.")

      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: userId,
        content: content,
        type: type,
        media_url: mediaData?.media_url || null,
        file_name: mediaData?.file_name || null,
        file_size: mediaData?.file_size || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        edited_at: null,
        status: 'sending',
        sender: currentUserProfile,
        reply_to: null,
      }

      // 2. Ajoutez-le immédiatement à l'état local AVEC UNE MISE À JOUR SYNCHRONE
      setMessages((prevMessages) => {
        console.log('Adding optimistic message:', optimisticMessage)
        return [...prevMessages, optimisticMessage]
      })

      // 3. Petit délai pour s'assurer que la mise à jour optimiste est visible
      await new Promise(resolve => setTimeout(resolve, 50))

      // 4. Envoyez le vrai message au backend
      const messageInsert: MessageInsert = {
        conversation_id: conversationId,
        sender_id: userId,
        content,
        type,
        media_url: mediaData?.media_url,
        file_name: mediaData?.file_name,
        file_size: mediaData?.file_size,
      }

      const { data: realMessage, error: insertError } = await supabase
        .from("messages")
        .insert(messageInsert)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // 5. Remplacez le message temporaire par le vrai message
      setMessages((prevMessages) => {
        console.log('Replacing temp message with real message:', realMessage)
        return prevMessages.map((msg) =>
          msg.id === tempId 
            ? { ...realMessage, sender: currentUserProfile } as Message 
            : msg
        )
      })

    } catch (err) {
      console.error("Error sending message:", err)
      // En cas d'erreur, retirez le message optimiste
      setMessages((prevMessages) => {
        console.log('Removing temp message due to error')
        return prevMessages.filter(msg => !msg.id.startsWith('temp_'))
      })
      throw err
    }
  }

  const sendMediaMessage = async (
    file: File,
    caption: string,
    type: "image" | "video" | "file",
  ) => {
    if (!conversationId || !userId) throw new Error("Missing required parameters")

    try {
      const publicUrl = await uploadMedia(file, "media", userId)
      await sendMessage(caption, type, {
        media_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
      })
    } catch (err) {
      console.error("Error sending media message:", err)
      throw err
    }
  }

  const startTyping = async () => {
    if (!conversationId || !userId) return
    await RealtimeService.sendTypingIndicator(conversationId, userId)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendMediaMessage,
    startTyping,
    refetch: loadMessages,
  }
}

