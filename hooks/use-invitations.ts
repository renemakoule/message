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
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("invitations")
        .select(`
          *,
          from_user:users!invitations_from_user_id_fkey(*),
          conversation:conversations(*)
        `)
        .eq("to_user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error

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
    if (!userId) return

    const channel = RealtimeService.subscribeToInvitations(userId, (newInvitation) => {
      setInvitations((prev) => {
        // Avoid duplicates
        const exists = prev.some((inv) => inv.id === newInvitation.id)
        if (exists) return prev

        return [newInvitation, ...prev]
      })
    })

    return () => {
      RealtimeService.unsubscribe(`invitations:${userId}`)
    }
  }, [userId])

  const acceptInvitation = async (invitationId: string) => {
    try {
      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)

      if (updateError) throw updateError

      // Remove from local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))

      return true
    } catch (err) {
      console.error("Error accepting invitation:", err)
      throw err
    }
  }

  const declineInvitation = async (invitationId: string) => {
    try {
      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "declined" })
        .eq("id", invitationId)

      if (updateError) throw updateError

      // Remove from local state
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
