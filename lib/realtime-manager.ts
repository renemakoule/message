import { supabase } from "./supabase-client";
import { useMessagingStore, type Message } from "./store";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "./supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export class RealtimeManager {
  private static channels: RealtimeChannel[] = [];
  private static userId: string | null = null;

  public static initialize(userId: string) {
    if (this.userId === userId) return;
    if (this.userId) this.cleanup();
    
    this.userId = userId;
    console.log(`[RealtimeManager] Initializing for user: ${userId}`);
    this.subscribeToAllMessages(); // Modifié pour ne plus passer userId
    this.subscribeToNotifications(userId);
  }

  // S'abonne à tous les messages entrants
  private static subscribeToAllMessages() {
    const channel = supabase.channel('public:messages');
    channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[RealtimeManager] Received new message payload:', payload.new);
          // Priorité n°1: Déclencher un rafraîchissement de la liste des conversations
          useMessagingStore.getState().refetchConversations();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeManager] Subscribed to messages channel.');
        }
      });
    
    this.channels.push(channel);
  }

  private static subscribeToNotifications(userId: string) {
    const channel = supabase.channel(`public:notifications:user_id=eq.${userId}`);
    channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('[RealtimeManager] Received new notification:', payload.new);
          useMessagingStore.getState().addNotification(payload.new as any);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeManager] Subscribed to notifications for user ${userId}.`);
        }
      });
      
    this.channels.push(channel);
  }
  
  public static cleanup() {
    console.log('[RealtimeManager] Cleaning up all subscriptions.');
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels = [];
    this.userId = null;
  }
}