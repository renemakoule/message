"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import type { Database } from "@/lib/supabase"

type Conversation = Database["public"]["Functions"]["get_conversations_with_last_message"]["Returns"][0]
type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"]
type ConversationParticipantInsert = Database["public"]["Tables"]["conversation_participants"]["Insert"]

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase.rpc("get_conversations_with_last_message", {
        user_uuid: userId,
      })

      if (error) throw error

      setConversations(data || [])
      setError(null)
    } catch (err) {
      console.error("Error loading conversations:", err)
      setError(err instanceof Error ? err.message : "Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const createPersonalConversation = async (targetUserId: string, initialMessage?: string) => {
    if (!userId) throw new Error("User not authenticated")

    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner(type)
        `)
        .eq("user_id", userId)

      const existingConversation = existingParticipants?.find((p) => {
        return p.conversations.type === "personal"
      })

      if (existingConversation) {
        // Check if target user is also in this conversation
        const { data: targetParticipant } = await supabase
          .from("conversation_participants")
          .select("*")
          .eq("conversation_id", existingConversation.conversation_id)
          .eq("user_id", targetUserId)
          .single()

        if (targetParticipant) {
          return existingConversation.conversation_id
        }
      }

      // Get target user info
      const { data: targetUser } = await supabase.from("users").select("name").eq("id", targetUserId).single()

      if (!targetUser) throw new Error("Target user not found")

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          name: targetUser.name,
          type: "personal",
          created_by: userId,
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "admin" },
        { conversation_id: conversation.id, user_id: targetUserId, role: "member" },
      ]

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)

      if (participantsError) throw participantsError

      // Send invitation
      const { error: invitationError } = await supabase.from("invitations").insert({
        conversation_id: conversation.id,
        from_user_id: userId,
        to_user_id: targetUserId,
        message: initialMessage,
      })

      if (invitationError) throw invitationError

      // Reload conversations
      await loadConversations()

      return conversation.id
    } catch (err) {
      console.error("Error creating personal conversation:", err)
      throw err
    }
  }

  const createGroupConversation = async (data: {
    name: string
    description?: string
    participantIds: string[]
    isPublic?: boolean
  }) => {
    if (!userId) throw new Error("User not authenticated")

    try {
      // Create conversation
      const conversationData: ConversationInsert = {
        name: data.name,
        description: data.description,
        type: "group",
        is_public: data.isPublic || false,
        created_by: userId,
      }

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert(conversationData)
        .select()
        .single()

      if (convError) throw convError

      // Add creator as admin
      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "admin" },
      ]

      // Add other participants as members
      data.participantIds.forEach((participantId) => {
        participants.push({
          conversation_id: conversation.id,
          user_id: participantId,
          role: "member",
        })
      })

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)

      if (participantsError) throw participantsError

      // Send invitations to participants
      const invitations = data.participantIds.map((participantId) => ({
        conversation_id: conversation.id,
        from_user_id: userId,
        to_user_id: participantId,
      }))

      if (invitations.length > 0) {
        const { error: invitationsError } = await supabase.from("invitations").insert(invitations)

        if (invitationsError) throw invitationsError
      }

      // Reload conversations
      await loadConversations()

      return conversation.id
    } catch (err) {
      console.error("Error creating group conversation:", err)
      throw err
    }
  }

  const joinPublicGroup = async (conversationId: string) => {
    if (!userId) throw new Error("User not authenticated")

    try {
      // Check if conversation is public
      const { data: conversation } = await supabase
        .from("conversations")
        .select("is_public")
        .eq("id", conversationId)
        .single()

      if (!conversation?.is_public) {
        throw new Error("This group is not public")
      }

      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from("conversation_participants")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", userId)
        .single()

      if (existingParticipant) {
        throw new Error("Already a member of this group")
      }

      // Add as participant
      const { error } = await supabase.from("conversation_participants").insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "member",
      })

      if (error) throw error

      // Reload conversations
      await loadConversations()

      return conversationId
    } catch (err) {
      console.error("Error joining public group:", err)
      throw err
    }
  }

  return {
    conversations,
    loading,
    error,
    createPersonalConversation,
    createGroupConversation,
    joinPublicGroup,
    refetch: loadConversations,
  }
}
