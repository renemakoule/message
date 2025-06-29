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

  // -- CORRECTION: Suppression de la logique de création automatique de fonction --
  // La fonction get_existing_personal_conversation doit être créée manuellement dans la base de données

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setConversations([]);
      return;
    }

    try {
      setLoading(true)
      const { data, error: rpcError } = await supabase.rpc("get_conversations_with_last_message", {
        user_uuid: userId,
      })

      if (rpcError) throw rpcError

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
      // Vérifier si une conversation existe déjà
      let existingConvo = null;
      let existingConvoError = null;
      
      try {
        // Essayer d'utiliser la fonction RPC
        const { data, error } = await supabase.rpc('get_existing_personal_conversation', {
          user1_id: userId,
          user2_id: targetUserId
        });
        existingConvo = data;
        existingConvoError = error;
      } catch (rpcError) {
        // Si la fonction RPC n'existe pas, utiliser une requête directe
        console.log("RPC function not available, using direct query...");
        
        // Trouver les conversations personnelles où les deux utilisateurs sont participants
        const { data: user1Conversations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', userId);
          
        const { data: user2Conversations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', targetUserId);
          
        if (user1Conversations && user2Conversations) {
          const user1Ids = user1Conversations.map(cp => cp.conversation_id);
          const user2Ids = user2Conversations.map(cp => cp.conversation_id);
          const commonIds = user1Ids.filter(id => user2Ids.includes(id));
          
          if (commonIds.length > 0) {
            const { data: conversations } = await supabase
              .from('conversations')
              .select('*')
              .eq('type', 'personal')
              .in('id', commonIds);
            existingConvo = conversations;
          }
        }
      }
      
      if (existingConvoError) {
        console.error("Error checking for existing conversation:", existingConvoError);
      }
        
      if (existingConvo && existingConvo.length > 0) {
        console.log("Conversation already exists:", existingConvo[0].id);
        return existingConvo[0].id;
      }

      const { data: targetUser } = await supabase.from("users").select("name").eq("id", targetUserId).single()
      if (!targetUser) throw new Error("Target user not found")

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          name: `Chat with ${targetUser.name}`,
          type: "personal",
          created_by: userId,
        })
        .select()
        .single()

      if (convError) throw convError

      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "member", status: 'active' },
        { conversation_id: conversation.id, user_id: targetUserId, role: "member", status: 'pending' },
      ]

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)
      if (participantsError) throw participantsError

      const { error: invitationError } = await supabase.from("invitations").insert({
        conversation_id: conversation.id,
        from_user_id: userId,
        to_user_id: targetUserId,
        type: 'personal',
        message: initialMessage,
      })
      if (invitationError) throw invitationError

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

      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "admin", status: 'active' },
      ]

      data.participantIds.forEach((participantId) => {
        participants.push({
          conversation_id: conversation.id,
          user_id: participantId,
          role: "member",
          status: 'pending'
        })
      })

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)
      if (participantsError) throw participantsError

      const invitations = data.participantIds.map((participantId) => ({
        conversation_id: conversation.id,
        from_user_id: userId,
        to_user_id: participantId,
        type: 'group' as const,
      }))

      if (invitations.length > 0) {
        const { error: invitationsError } = await supabase.from("invitations").insert(invitations)
        if (invitationsError) throw invitationsError
      }

      return conversation.id
    } catch (err) {
      console.error("Error creating group conversation:", err)
      throw err
    }
  }

  const joinPublicGroup = async (conversationId: string) => {
    if (!userId) throw new Error("User not authenticated")

    try {
      const { data: conversation } = await supabase.from("conversations").select("is_public").eq("id", conversationId).single()
      if (!conversation?.is_public) {
        throw new Error("This group is not public")
      }

      const { data: existingParticipant } = await supabase.from("conversation_participants").select("*").eq("conversation_id", conversationId).eq("user_id", userId).single()
      if (existingParticipant) {
        console.warn("User is already a member of this group");
        return conversationId;
      }

      const { error } = await supabase.from("conversation_participants").insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "member",
        status: 'active'
      })

      if (error) throw error
      
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
    refetch: loadConversations,
    createPersonalConversation,
    createGroupConversation,
    joinPublicGroup,
  }
}

