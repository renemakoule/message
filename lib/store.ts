"use client"

// -----------------------------------------------------------------------------
// IMPORTS ET CLIENT SUPABASE
// -----------------------------------------------------------------------------

import { create } from "zustand"
import { supabase } from "./supabase-client"
import type { Database } from "./supabase"

// -----------------------------------------------------------------------------
// TYPES DE DONNÉES
// -----------------------------------------------------------------------------

type UserProfile = Database["public"]["Tables"]["users"]["Row"]
type Conversation = Database["public"]["Functions"]["get_conversations_with_last_message"]["Returns"][0]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]

/**
 * Représente l'état d'un appel en cours.
 */
type Call = {
  conversationId: string
  type: "audio" | "video"
  status: "ringing" | "active" // L'appel sonne ou est actif
  participant: {
    id: string
    name: string
    avatar?: string | null
  }
}

// -----------------------------------------------------------------------------
// INTERFACE DU STORE ZUSTAND
// -----------------------------------------------------------------------------

/**
 * Interface définissant l'état et les actions pour la gestion de la messagerie.
 */
interface MessagingStore {
  // --- État Global de l'UI ---
  currentUser: UserProfile | null
  isAuthenticated: boolean
  selectedConversation: Conversation | null
  isCallActive: boolean
  currentCall: Call | null
  notifications: Notification[]

  // --- Actions pour modifier l'état ---
  setCurrentUser: (user: UserProfile | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setSelectedConversation: (conversation: Conversation | null) => void
  startCall: (conversationId: string, type: "audio" | "video") => void
  endCall: () => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  clearAllNotifications: () => void
}

// -----------------------------------------------------------------------------
// STORE ZUSTAND (`useMessagingStore`)
// -----------------------------------------------------------------------------

/**
 * Hook Zustand pour accéder et gérer l'état global de l'application de messagerie.
 */
export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // --- État initial ---
  currentUser: null,
  isAuthenticated: false,
  selectedConversation: null,
  isCallActive: false,
  currentCall: null,
  notifications: [],

  // --- Actions ---

  setCurrentUser: (user) => set({ currentUser: user }),

  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation })
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

    // Simule la connexion de l'appel après quelques secondes
    setTimeout(() => {
      set((state) =>
        state.currentCall ? { ...state, currentCall: { ...state.currentCall, status: "active" } } : state,
      )
    }, 3000)
  },

  endCall: () => set({ isCallActive: false, currentCall: null }),

  // Actions pour les notifications
  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      // Ajoute la nouvelle notification au début et limite le tableau à 50 notifications
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),

  markNotificationAsRead: (notificationId) => {
    // Mise à jour optimiste de l'UI
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    }))
    // Met à jour le backend en arrière-plan sans bloquer l'UI
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .then(({ error }) => {
        if (error) console.error("Failed to mark notification as read:", error)
      })
  },

  clearAllNotifications: () => {
    const userId = get().currentUser?.id
    if (!userId) return

    // Mise à jour optimiste de l'UI
    set({ notifications: [] })

    // Supprime toutes les notifications pour l'utilisateur dans le backend
    supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) console.error("Failed to clear notifications:", error)
      })
  },
}))

// -----------------------------------------------------------------------------
// FONCTIONS UTILITAIRES
// -----------------------------------------------------------------------------

/**
 * Télécharge un fichier vers Supabase Storage.
 * @param file Le fichier à télécharger.
 * @param bucket Le nom du bucket de stockage. Par défaut, 'media'.
 * @param userId L'ID de l'utilisateur qui télécharge, pour l'organisation des fichiers.
 * @returns L'URL publique du fichier téléchargé.
 */
export async function uploadMedia(file: File, bucket: string = "media", userId: string): Promise<string> {
  if (!userId) {
    throw new Error("User ID is required to upload media.")
  }

  const fileExt = file.name.split(".").pop()
  // Crée un chemin de fichier unique pour éviter les collisions de noms
  const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading file to Supabase Storage:", uploadError)
    throw uploadError
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

  if (!data.publicUrl) {
    throw new Error("Could not get public URL for the uploaded file.")
  }

  return data.publicUrl
}