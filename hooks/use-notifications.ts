"use client"

import { useEffect, useCallback } from "react"
import { useMessagingStore } from "@/lib/store"
import { RealtimeService } from "@/lib/realtime"
import { supabase } from "@/lib/supabase-client"

export function useNotifications() {
  const { currentUser, setNotifications, addNotification } = useMessagingStore();
  const userId = currentUser?.id;

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      console.log("❌ Cannot load notifications: no userId")
      return;
    }

    console.log(`🔔 Loading notifications for user: ${userId}`)

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Charger les 50 plus récentes

      if (error) throw error;
      console.log(`📋 Loaded ${data?.length || 0} notifications`)
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [userId, setNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) {
      console.log("❌ Cannot subscribe to notifications: no userId")
      return () => {}
    }

    console.log(`🔔 Setting up notification subscription for user: ${userId}`)

    const channel = RealtimeService.subscribeToNotifications(userId, (newNotification) => {
        console.log(`🔔 Received new notification:`, newNotification)
        // Ajoute la nouvelle notification en haut de la liste dans le store
        addNotification(newNotification);
    });

    console.log(`✅ Notification subscription established for user: ${userId}`)

    return () => {
      console.log(`🔌 Cleaning up notification subscription for user: ${userId}`)
      if (channel) {
        RealtimeService.unsubscribe(`notifications:${userId}`);
      }
    };
  }, [userId, addNotification]);
}

