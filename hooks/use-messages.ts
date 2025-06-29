"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { RealtimeService } from "@/lib/realtime"
import type { Database } from "@/lib/supabase"

type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: Database["public"]["Tables"]["users"]["Row"]
}
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

export function useMessages(conversationId?: string, userId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users(*)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error

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

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return

    const channel = RealtimeService.subscribeToConversation(
      conversationId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((msg) => msg.id === newMessage.id)
          if (exists) return prev

          return [...prev, newMessage]
        })
      },
      (typingIndicators) => {
        // Handle typing indicators if needed
        console.log("Typing indicators:", typingIndicators)
      },
    )

    return () => {
      RealtimeService.unsubscribe(`conversation:${conversationId}`)
    }
  }, [conversationId])

  const sendMessage = async (content: string, type: "text" | "image" | "video" | "file" | "audio" = "text") => {
    if (!conversationId || !userId) throw new Error("Missing required parameters")

    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: userId,
        content,
        type,
      }

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select(`
          *,
          sender:users(*)
        `)
        .single()

      if (error) throw error

      return data as Message
    } catch (err) {
      console.error("Error sending message:", err)
      throw err
    }
  }

  const markAsRead = async () => {
    if (!conversationId || !userId) return

    try {
      await supabase.rpc("mark_messages_as_read", {
        conversation_uuid: conversationId,
        user_uuid: userId,
      })
    } catch (err) {
      console.error("Error marking messages as read:", err)
    }
  }

  const startTyping = async () => {
    if (!conversationId || !userId) return

    try {
      await RealtimeService.sendTypingIndicator(conversationId, userId)
    } catch (err) {
      console.error("Error starting typing indicator:", err)
    }
  }

  const stopTyping = async () => {
    if (!conversationId || !userId) return

    try {
      await RealtimeService.stopTypingIndicator(conversationId, userId)
    } catch (err) {
      console.error("Error stopping typing indicator:", err)
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    refetch: loadMessages,
  }
}
