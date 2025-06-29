"use client"
 
import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { RealtimeService } from "@/lib/realtime"
import type { Database } from "@/lib/supabase"
 
type Invitation = Database["public"]["Tables"]["invitations"]["Row"] & {
  from_user: Database["public"]["Tables"]["users"]["Row"]
  conversation: Database["public"]["Tables"]["conversations"]["Row"]
}
 
export function useInvitations(userId?: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  const loadInvitations = useCallback(async () => {
    if (!userId) {
        setLoading(false);
        setInvitations([]);
        return;
    };
 
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select(`
          *,
          from_user:users!invitations_from_user_id_fkey(*),
          conversation:conversations(*)
        `)
        .eq("to_user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
 
      if (fetchError) throw fetchError
 
      setInvitations((data as Invitation[]) || [])
      setError(null)
    } catch (err) {
      console.error("Error loading invitations:", err)
      setError(err instanceof Error ? err.message : "Failed to load invitations")
    } finally {
      setLoading(false)
    }
  }, [userId])
 
  useEffect(() => {
    loadInvitations()
  }, [loadInvitations])
 
  // Subscribe to real-time invitations
  useEffect(() => {
    if (!userId) {
      // Si pas d'userId, on ne fait rien mais on ne retourne pas directement
      return () => {}
    }
 
    const channel = RealtimeService.subscribeToInvitations(userId, (newInvitation) => {
      setInvitations((prev) => {
        if (prev.some((inv) => inv.id === newInvitation.id)) return prev
        return [newInvitation, ...prev]
      })
    })
 
    return () => {
      RealtimeService.unsubscribe(`invitations:${userId}`)
    }
  }, [userId])
 
  const acceptInvitation = async (invitationId: string) => {
    if (!userId) throw new Error("User not authenticated");
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) throw new Error("Invitation not found");
 
    try {
      // Step 1: Update the invitation status to 'accepted'
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)
 
      if (updateError) throw updateError
 
      // Step 2: Update the user's status in the conversation to 'active'
      // This is the critical step that makes the conversation appear for the user.
      const { error: participantError } = await supabase
        .from("conversation_participants")
        .update({ status: 'active' })
        .eq('conversation_id', invitation.conversation_id)
        .eq('user_id', userId);
 
      if (participantError) throw participantError;
 
      // Step 3: Remove from local state after successful operation
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
 
      return true
    } catch (err) {
      console.error("Error accepting invitation:", err)
      throw err
    }
  }
 
  const declineInvitation = async (invitationId: string) => {
    if (!userId) throw new Error("User not authenticated");
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) throw new Error("Invitation not found");
 
    try {
      // Step 1: Update invitation status to 'declined'
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "declined" })
        .eq("id", invitationId)
 
      if (updateError) throw updateError
 
      // Step 2: Remove the user from the conversation participants
      // This ensures they don't see a "pending" conversation.
      const { error: participantError } = await supabase
        .from("conversation_participants")
        .delete()
        .eq('conversation_id', invitation.conversation_id)
        .eq('user_id', userId);
 
      if (participantError) throw participantError;
 
      // Step 3: Remove from local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
 
      return true
    } catch (err) {
      console.error("Error declining invitation:", err)
      throw err
    }
  }
 
  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refetch: loadInvitations,
  }
}