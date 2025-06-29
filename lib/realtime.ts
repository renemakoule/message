import { supabase } from "./supabase-client"
import type { Database } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type TypingIndicator = Database["public"]["Tables"]["typing_indicators"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]
type Invitation = Database["public"]["Tables"]["invitations"]["Row"]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map()

  // Subscribe to conversation messages
  static subscribeToConversation(
    conversationId: string,
    onMessage: (message: Message & { sender: User }) => void,
    onTyping: (indicators: TypingIndicator[]) => void,
  ) {
    const channelName = `conversation:${conversationId}`
    console.log(`🔔 Subscribing to conversation: ${conversationId}`)

    if (this.channels.has(channelName)) {
      console.log(`🔄 Unsubscribing from existing channel: ${channelName}`)
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
          console.log(`📨 Received message in real-time:`, payload.new)
          const { data: sender } = await supabase.from("users").select("*").eq("id", payload.new.sender_id).single()
          if (sender) {
            console.log(`👤 Sender found:`, sender.name)
            onMessage({
              ...(payload.new as Message),
              sender,
            })
          } else {
            console.log(`❌ Sender not found for ID:`, payload.new.sender_id)
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
          console.log(`⌨️ Typing indicator update for conversation: ${conversationId}`)
          const { data: indicators } = await supabase
            .from("typing_indicators")
            .select("*")
            .eq("conversation_id", conversationId)
            .gte("created_at", new Date(Date.now() - 10000).toISOString())

          onTyping(indicators || [])
        },
      )
      .subscribe((status) => {
        console.log(`📡 Channel ${channelName} subscription status:`, status)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to user presence
  static subscribeToUserPresence(onUserStatusChange: (user: User) => void) {
    const channelName = "user-presence"
    console.log(`👤 Subscribing to user presence`)

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
          console.log(`👤 User status change:`, payload.new)
          onUserStatusChange(payload.new as User)
        },
      )
      .subscribe((status) => {
        console.log(`📡 Channel ${channelName} subscription status:`, status)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to invitations
  static subscribeToInvitations(
    userId: string,
    onInvitation: (invitation: Invitation & { from_user: User; conversation: any }) => void,
  ) {
    const channelName = `invitations:${userId}`
    console.log(`📨 Subscribing to invitations for user: ${userId}`)

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
          console.log(`📨 Received invitation in real-time:`, payload.new)
          const { data: invitationDetails } = await supabase
            .from("invitations")
            .select(`*, from_user:users!invitations_from_user_id_fkey(*), conversation:conversations(*)`)
            .eq("id", payload.new.id)
            .single()

          if (invitationDetails) {
            console.log(`📨 Invitation details:`, invitationDetails)
            onInvitation(invitationDetails as any)
          }
        },
      )
      .subscribe((status) => {
        console.log(`📡 Channel ${channelName} subscription status:`, status)
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Subscribes to real-time notifications for a specific user.
   * @param userId The ID of the user to listen for.
   * @param onNotification The callback to execute when a new notification is inserted.
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
  ) {
    const channelName = `notifications:${userId}`;
    console.log(`🔔 Subscribing to notifications for user: ${userId}`);

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`🔔 Received notification in real-time:`, payload.new);
          onNotification(payload.new as Notification);
        },
      )
      .subscribe((status) => {
        console.log(`📡 Channel ${channelName} subscription status:`, status);
      });

    this.channels.set(channelName, channel);
    return channel;
  }


  // Send typing indicator
  static async sendTypingIndicator(conversationId: string, userId: string) {
    console.log(`⌨️ Sending typing indicator for conversation: ${conversationId}, user: ${userId}`)
    await supabase.from("typing_indicators").delete().eq("conversation_id", conversationId).eq("user_id", userId)
    await supabase.from("typing_indicators").insert({ conversation_id: conversationId, user_id: userId })
  }

  // Unsubscribe from a channel
  static unsubscribe(channelName: string) {
    console.log(`🔌 Unsubscribing from channel: ${channelName}`)
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    console.log(`🔌 Unsubscribing from all channels`)
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}

