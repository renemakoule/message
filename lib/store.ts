"use client"

import { create } from "zustand"
import { supabase } from "./supabase-client"
import type { Database } from "./supabase"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]
export type Conversation = Database["public"]["Functions"]["get_conversations_with_last_message"]["Returns"][0]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"] & { 
    sender: UserProfile;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
}

// ... (autres types comme Call, TypingUser)
type Call = { conversationId: string; type: "audio" | "video"; status: "ringing" | "active"; participant: { id: string; name: string; avatar?: string | null; } }
type TypingUser = { conversationId: string; userId: string; userName: string; }

interface MessagingStore {
  // --- État ---
  currentUser: UserProfile | null
  isAuthenticated: boolean
  conversations: Conversation[] // <-- On ajoute la liste des conversations au store
  selectedConversation: Conversation | null
  messages: Message[]
  isCallActive: boolean
  currentCall: Call | null
  notifications: Notification[]
  typingUsers: TypingUser[]
  refetchConversationsTrigger: number // <-- NOUVEAU: Déclencheur pour rafraîchir la liste

  // --- Actions ---
  setCurrentUser: (user: UserProfile | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setConversations: (conversations: Conversation[]) => void // <-- NOUVEAU
  refetchConversations: () => void // <-- NOUVEAU
  setSelectedConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (tempId: string, finalMessage: Message) => void
  removeMessage: (messageId: string) => void
  // ... (autres actions)
  joinPublicGroup: (groupId: string) => void;
  updateUserSettings: (settings: Partial<UserProfile>) => void;
  startCall: (conversationId: string, type: "audio" | "video") => void
  endCall: () => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  clearAllNotifications: () => void
}

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // --- État initial ---
  currentUser: null,
  isAuthenticated: false,
  conversations: [], // <-- Initialisé
  selectedConversation: null,
  messages: [],
  isCallActive: false,
  currentCall: null,
  notifications: [],
  typingUsers: [],
  refetchConversationsTrigger: 0, // <-- Initialisé

  // --- Actions ---
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
  
  setConversations: (conversations) => set({ conversations }),
  refetchConversations: () => set((state) => ({ refetchConversationsTrigger: state.refetchConversationsTrigger + 1 })),
  
  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation, messages: [] });
    
    // Priorité n°2: Mise à jour optimiste du compteur de non-lus
    if (conversation && conversation.unread_count > 0) {
        set(state => ({
            conversations: state.conversations.map(c => 
                c.id === conversation.id ? { ...c, unread_count: 0 } : c
            )
        }));
    }
  },
  
  // Actions pour les messages
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
      if (state.messages.some(m => m.id === message.id)) return {};
      return { messages: [...state.messages, message] };
  }),
  updateMessage: (tempId, finalMessage) => set((state) => ({
      messages: state.messages.map(m => m.id === tempId ? finalMessage : m)
  })),
  removeMessage: (messageId) => set((state) => ({
      messages: state.messages.filter(m => m.id !== messageId)
  })),
  
  // Reste des actions...
  joinPublicGroup: (groupId: string) => { console.log(`Joining public group ${groupId}`); },
  updateUserSettings: (settings) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...settings } : null,
    }));
  },
  startCall: (conversationId, type) => {
    const { selectedConversation } = get()
    if (!selectedConversation) return

    set({
      isCallActive: true,
      currentCall: {
        conversationId,
        type,
        status: "ringing",
        participant: {
          id: selectedConversation.id,
          name: selectedConversation.name,
          avatar: selectedConversation.avatar_url,
        },
      },
    })
    setTimeout(() => {
      set((state) =>
        state.currentCall ? { ...state, currentCall: { ...state.currentCall, status: "active" } } : state,
      )
    }, 3000)
  },
  endCall: () => set({ isCallActive: false, currentCall: null }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 50) })),
  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    }))
    supabase.from("notifications").update({ read: true }).eq("id", notificationId).then(({ error }) => {
        if (error) console.error("Failed to mark notification as read:", error)
    })
  },
  clearAllNotifications: () => {
    const userId = get().currentUser?.id
    if (!userId) return
    set({ notifications: [] })
    supabase.from("notifications").delete().eq("user_id", userId).then(({ error }) => {
        if (error) console.error("Failed to clear notifications:", error)
    })
  },
}))

// ... (fonction uploadMedia inchangée)
export async function uploadMedia(file: File, bucket: string = "media", userId: string): Promise<string> {
    if (!userId) { throw new Error("User ID is required to upload media.") }
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) { throw uploadError; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (!data.publicUrl) { throw new Error("Could not get public URL for the uploaded file."); }
    return data.publicUrl;
}