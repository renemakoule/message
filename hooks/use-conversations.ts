"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { useMessagingStore, type Conversation } from "@/lib/store"
import type { Database } from "@/lib/supabase"
import { toast } from "sonner"

type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"]
type ConversationParticipantInsert = Database["public"]["Tables"]["conversation_participants"]["Insert"]

// Ce type représente le résultat brut que nous allons construire
type EnrichedConversation = Conversation;

export function useConversations(userId?: string) {
  const { setConversations, refetchConversationsTrigger } = useMessagingStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setConversations([]);
      return;
    }

    try {
      setLoading(true);

      // 1. Obtenir les IDs des conversations de l'utilisateur
      const { data: userConvos, error: userConvosError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (userConvosError) throw userConvosError;
      if (!userConvos || userConvos.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
      }

      const conversationIds = userConvos.map(c => c.conversation_id);

      // 2. Obtenir les détails de ces conversations, les participants et les derniers messages
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(*, user:users(*)),
          messages(id, content, created_at, sender_id)
        `)
        .in('id', conversationIds)
        .order('created_at', { referencedTable: 'messages', ascending: false })
        .limit(1, { referencedTable: 'messages' });

      if (convosError) throw convosError;

      // 3. Agréger et formater les données côté client
      const enrichedConversations: EnrichedConversation[] = convos.map(convo => {
        const lastMessage = convo.messages[0];
        const otherParticipant = convo.type === 'personal' 
            ? convo.participants.find(p => p.user_id !== userId)?.user 
            : null;

        return {
          id: convo.id,
          name: convo.type === 'personal' && otherParticipant ? otherParticipant.name : convo.name,
          description: convo.description,
          type: convo.type,
          avatar_url: convo.type === 'personal' && otherParticipant ? otherParticipant.avatar_url : convo.avatar_url,
          is_public: convo.is_public,
          created_by: convo.created_by,
          created_at: convo.created_at,
          updated_at: convo.updated_at,
          last_message: lastMessage?.content || 'Aucun message...',
          last_message_at: lastMessage?.created_at || convo.created_at,
          unread_count: 0, // Le calcul des non-lus est complexe et sera ajouté plus tard si nécessaire
          participant_count: convo.participants.length,
          other_participant_id: otherParticipant?.id || null,
          other_participant_name: otherParticipant?.name || null,
          other_participant_avatar_url: otherParticipant?.avatar_url || null,
          other_participant_status: otherParticipant?.status || null,
        };
      });

      // 4. Trier par le dernier message
      enrichedConversations.sort((a, b) => 
        new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime()
      );

      setConversations(enrichedConversations);
      setError(null);

    } catch (err: any) {
      console.error("Error loading conversations:", err);
      setError("Erreur lors du chargement des conversations.");
      toast.error("Erreur de chargement des conversations", {
          description: err.message
      })
    } finally {
      setLoading(false);
    }
  }, [userId, setConversations]);

  useEffect(() => {
    if (refetchConversationsTrigger > 0) {
      loadConversations();
    }
  }, [refetchConversationsTrigger, loadConversations]);
  
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return;
    try {
        await supabase.rpc('mark_messages_as_read', {
            p_conversation_id: conversationId,
            p_user_id: userId
        });
        useMessagingStore.getState().setConversations(
            useMessagingStore.getState().conversations.map(c => 
                c.id === conversationId ? { ...c, unread_count: 0 } : c
            )
        );
    } catch(err) {
        console.error("Error marking conversation as read:", err);
    }
  }, [userId]);

  const createPersonalConversation = async (targetUserId: string, initialMessage?: string) => {
    if (!userId) throw new Error("User not authenticated");

    try {
      const { data: existingConvo } = await supabase.rpc('get_existing_personal_conversation', {
        user1_id: userId,
        user2_id: targetUserId
      });
      if (existingConvo && existingConvo.length > 0) {
        toast.info("Une conversation avec cet utilisateur existe déjà.");
        return existingConvo[0].id;
      }

      const { data: targetUser } = await supabase.from("users").select("name").eq("id", targetUserId).single();
      if (!targetUser) throw new Error("Target user not found");

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({ name: `Chat with ${targetUser.name}`, type: "personal", created_by: userId })
        .select().single();
      if (convError) throw convError;

      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "member", status: 'active' },
        { conversation_id: conversation.id, user_id: targetUserId, role: "member", status: 'pending' },
      ];
      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants);
      if (participantsError) throw participantsError;

      const { error: invitationError } = await supabase.from("invitations").insert({
        conversation_id: conversation.id, from_user_id: userId, to_user_id: targetUserId, type: 'personal', message: initialMessage,
      });
      if (invitationError) throw invitationError;

      await loadConversations();
      return conversation.id;
    } catch (err) {
      console.error("Error creating personal conversation:", err);
      toast.error(err instanceof Error ? err.message : "Échec de la création de la conversation");
      throw err;
    }
  };

  const createGroupConversation = async (data: { name: string; description?: string; participantIds: string[]; isPublic?: boolean; }) => {
    if (!userId) throw new Error("User not authenticated");

    try {
      const conversationData: ConversationInsert = {
        name: data.name, description: data.description, type: "group", is_public: data.isPublic || false, created_by: userId,
      };
      const { data: conversation, error: convError } = await supabase.from("conversations").insert(conversationData).select().single();
      if (convError) throw convError;

      const participants: ConversationParticipantInsert[] = [
        { conversation_id: conversation.id, user_id: userId, role: "admin", status: 'active' },
        ...data.participantIds.map(id => ({ conversation_id: conversation.id, user_id: id, role: "member", status: 'pending' as const }))
      ];
      const { error: participantsError } = await supabase.from("conversation_participants").insert(participants);
      if (participantsError) throw participantsError;

      const invitations = data.participantIds.map(id => ({
        conversation_id: conversation.id, from_user_id: userId, to_user_id: id, type: 'group' as const
      }));
      if (invitations.length > 0) {
        const { error: invitationsError } = await supabase.from("invitations").insert(invitations);
        if (invitationsError) throw invitationsError;
      }

      await loadConversations();
      return conversation.id;
    } catch (err) {
      console.error("Error creating group conversation:", err);
      toast.error(err instanceof Error ? err.message : "Échec de la création du groupe");
      throw err;
    }
  };

  const joinPublicGroup = async (conversationId: string) => {
    if (!userId) throw new Error("User not authenticated");

    try {
      const { data: conversation } = await supabase.from("conversations").select("is_public").eq("id", conversationId).single();
      if (!conversation?.is_public) throw new Error("This group is not public");

      const { data: existing } = await supabase.from("conversation_participants").select("id").eq("conversation_id", conversationId).eq("user_id", userId).single();
      if (existing) {
        toast.info("Vous êtes déjà membre de ce groupe.");
        return conversationId;
      }

      const { error } = await supabase.from("conversation_participants").insert({
        conversation_id: conversationId, user_id: userId, role: "member", status: 'active'
      });
      if (error) throw error;
      
      toast.success("Vous avez rejoint le groupe !");
      await loadConversations();
      return conversationId;
    } catch (err) {
      console.error("Error joining public group:", err);
      toast.error(err instanceof Error ? err.message : "Échec pour rejoindre le groupe");
      throw err;
    }
  };

  return {
    loading,
    error,
    refetch: loadConversations,
    markConversationAsRead,
    createPersonalConversation,
    createGroupConversation,
    joinPublicGroup,
  };
}