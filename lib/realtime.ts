import { supabase } from "./supabase-client"
import type { Database } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type TypingIndicator = Database["public"]["Tables"]["typing_indicators"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]
type Invitation = Database["public"]["Tables"]["invitations"]["Row"]

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map()

  // Subscribe to conversation messages
  static subscribeToConversation(
    conversationId: string,
    onMessage: (message: Message & { sender: User }) => void,
    onTyping: (indicators: TypingIndicator[]) => void,
  ) {
    const channelName = `conversation:${conversationId}`

    // Unsubscribe if already subscribed
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Get sender information
          const { data: sender } = await supabase.from("users").select("*").eq("id", payload.new.sender_id).single()

          if (sender) {
            onMessage({
              ...(payload.new as Message),
              sender,
            })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          // Fetch current typing indicators
          const { data: indicators } = await supabase
            .from("typing_indicators")
            .select("*")
            .eq("conversation_id", conversationId)
            .gte("created_at", new Date(Date.now() - 10000).toISOString()) // Last 10 seconds

          onTyping(indicators || [])
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to user presence
  static subscribeToUserPresence(onUserStatusChange: (user: User) => void) {
    const channelName = "user-presence"

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        (payload) => {
          onUserStatusChange(payload.new as User)
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to invitations
  static subscribeToInvitations(
    userId: string,
    onInvitation: (invitation: Invitation & { from_user: User; conversation: any }) => void,
  ) {
    const channelName = `invitations:${userId}`

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "invitations",
          filter: `to_user_id=eq.${userId}`,
        },
        async (payload) => {
          // Get invitation details with sender and conversation info
          const { data: invitationDetails } = await supabase
            .from("invitations")
            .select(`
              *,
              from_user:users!invitations_from_user_id_fkey(*),
              conversation:conversations(*)
            `)
            .eq("id", payload.new.id)
            .single()

          if (invitationDetails) {
            onInvitation(invitationDetails as any)
          }
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Send typing indicator
  static async sendTypingIndicator(conversationId: string, userId: string) {
    // Remove existing typing indicator for this user in this conversation
    await supabase.from("typing_indicators").delete().eq("conversation_id", conversationId).eq("user_id", userId)

    // Insert new typing indicator
    const { error } = await supabase.from("typing_indicators").insert({
      conversation_id: conversationId,
      user_id: userId,
    })

    if (error) {
      console.error("Error sending typing indicator:", error)
    }
  }

  // Stop typing indicator
  static async stopTypingIndicator(conversationId: string, userId: string) {
    const { error } = await supabase
      .from("typing_indicators")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error stopping typing indicator:", error)
    }
  }

  // Unsubscribe from a channel
  static unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}
