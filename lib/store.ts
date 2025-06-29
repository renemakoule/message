"use client"

import { create } from "zustand"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status?: "online" | "offline" | "away"
  about?: string
  phone?: string
  location?: string
  birthday?: string
  website?: string
  lastSeen?: Date
}

interface Conversation {
  id: string
  name: string
  type: "personal" | "group"
  avatar?: string
  description?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline?: boolean
  memberCount?: number
  status?: "active" | "pending" | "declined"
  participants: string[]
  createdBy?: string
  isPublic?: boolean
  invitedBy?: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: "text" | "image" | "video" | "file" | "audio" | "system"
  status?: "sending" | "sent" | "delivered" | "read"
  mediaUrl?: string
  fileName?: string
  fileSize?: string
  uploadProgress?: number
  isNew?: boolean
}

interface Invitation {
  id: string
  fromUserId: string
  toUserId: string
  conversationId: string
  type: "personal" | "group"
  status: "pending" | "accepted" | "declined"
  createdAt: Date
  message?: string
}

interface Notification {
  id: string
  type: "message" | "invitation_sent" | "invitation_received" | "invitation_accepted" | "invitation_declined"
  title: string
  message: string
  avatar?: string
  timestamp: Date
  conversationId?: string
  invitationId?: string
  isRead: boolean
  fromUserId?: string
}

interface TypingUser {
  userId: string
  userName: string
  conversationId: string
  timestamp: Date
}

interface MessagingStore {
  // Auth state
  currentUser: User | null
  isAuthenticated: boolean

  // Users
  allUsers: User[]
  onlineUsers: string[]

  // Conversations
  conversations: Conversation[]
  selectedConversation: Conversation | null
  messages: Record<string, Message[]>

  // Invitations
  invitations: Invitation[]

  // Notifications
  notifications: Notification[]

  // Typing indicators
  typingUsers: TypingUser[]

  // Actions
  setCurrentUser: (user: User | null) => void
  setAuthenticated: (isAuth: boolean) => void
  loadAllUsers: () => void
  setSelectedConversation: (conversation: Conversation | null) => void

  // Conversation actions
  createPersonalConversation: (targetUserId: string, message?: string) => void
  createGroupConversation: (data: {
    name: string
    description?: string
    participants: string[]
    isPublic?: boolean
  }) => void
  joinPublicGroup: (groupId: string) => void

  // Message actions
  sendMessage: (conversationId: string, content: string, type?: "text" | "image" | "video" | "file" | "audio") => void
  markMessagesAsRead: (conversationId: string) => void

  // Invitation actions
  sendInvitation: (toUserId: string, conversationId: string, type: "personal" | "group", message?: string) => void
  acceptInvitation: (invitationId: string) => void
  declineInvitation: (invitationId: string) => void

  // Notification actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void
  markNotificationAsRead: (notificationId: string) => void
  clearAllNotifications: () => void

  // Typing actions
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void

  // Presence actions
  updateUserStatus: (userId: string, status: "online" | "offline" | "away") => void
}

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  allUsers: [
    {
      id: "user1",
      name: "Alice Martin",
      email: "alice@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      about: "Designer passionnée",
    },
    {
      id: "user2",
      name: "Bob Dupont",
      email: "bob@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
      about: "Développeur Full Stack",
    },
    {
      id: "user3",
      name: "Claire Moreau",
      email: "claire@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      about: "Chef de projet",
    },
    {
      id: "user4",
      name: "David Leroy",
      email: "david@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "away",
      about: "Marketing Manager",
    },
    {
      id: "user5",
      name: "Emma Bernard",
      email: "emma@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      about: "UX Designer",
    },
  ],
  onlineUsers: ["user1", "user3", "user5"],
  conversations: [],
  selectedConversation: null,
  messages: {},
  invitations: [],
  notifications: [],
  typingUsers: [],

  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

  loadAllUsers: () => {
    // Simuler le chargement des utilisateurs depuis Supabase
    // En réalité, ceci sera une requête à Supabase
  },

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation })
    if (conversation) {
      get().markMessagesAsRead(conversation.id)
    }
  },

  createPersonalConversation: (targetUserId, message) => {
    const { currentUser, allUsers } = get()
    if (!currentUser) return

    const targetUser = allUsers.find((u) => u.id === targetUserId)
    if (!targetUser) return

    // Vérifier si une conversation existe déjà
    const existingConv = get().conversations.find((c) => c.type === "personal" && c.participants.includes(targetUserId))

    if (existingConv) {
      set({ selectedConversation: existingConv })
      return
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: targetUser.name,
      type: "personal",
      avatar: targetUser.avatar,
      lastMessage: message || "Invitation envoyée...",
      lastMessageTime: "Maintenant",
      unreadCount: 0,
      status: "pending",
      participants: [currentUser.id, targetUserId],
      invitedBy: currentUser.id,
    }

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      selectedConversation: newConversation,
    }))

    // Envoyer l'invitation
    get().sendInvitation(targetUserId, newConversation.id, "personal", message)

    // Si un message initial est fourni, l'envoyer
    if (message) {
      get().sendMessage(newConversation.id, message)
    }
  },

  createGroupConversation: (data) => {
    const { currentUser } = get()
    if (!currentUser) return

    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: data.name,
      type: "group",
      description: data.description,
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Groupe créé",
      lastMessageTime: "Maintenant",
      unreadCount: 0,
      status: "active",
      participants: [currentUser.id, ...data.participants],
      memberCount: data.participants.length + 1,
      createdBy: currentUser.id,
      isPublic: data.isPublic || false,
    }

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      selectedConversation: newConversation,
    }))

    // Envoyer des invitations aux participants
    data.participants.forEach((userId) => {
      get().sendInvitation(userId, newConversation.id, "group")
    })

    // Message système de création
    const systemMessage: Message = {
      id: Date.now().toString(),
      conversationId: newConversation.id,
      senderId: "system",
      senderName: "Système",
      content: `${currentUser.name} a créé le groupe "${data.name}"`,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      type: "system",
      status: "read",
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [newConversation.id]: [systemMessage],
      },
    }))
  },

  joinPublicGroup: (groupId) => {
    const { currentUser, conversations } = get()
    if (!currentUser) return

    const group = conversations.find((c) => c.id === groupId && c.isPublic)
    if (!group || group.participants.includes(currentUser.id)) return

    // Ajouter l'utilisateur au groupe
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === groupId
          ? {
              ...c,
              participants: [...c.participants, currentUser.id],
              memberCount: (c.memberCount || 0) + 1,
            }
          : c,
      ),
    }))

    // Message système
    const systemMessage: Message = {
      id: Date.now().toString(),
      conversationId: groupId,
      senderId: "system",
      senderName: "Système",
      content: `${currentUser.name} a rejoint le groupe`,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      type: "system",
      status: "read",
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), systemMessage],
      },
    }))
  },

  sendMessage: (conversationId, content, type = "text") => {
    const { currentUser } = get()
    if (!currentUser) return

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      type,
      status: "sending",
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), newMessage],
      },
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, lastMessage: content, lastMessageTime: "Maintenant" } : conv,
      ),
    }))

    // Simuler l'envoi
    setTimeout(() => {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        },
      }))

      // Simuler la réception
      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
            ),
          },
        }))
      }, 500)
    }, 1000)
  },

  markMessagesAsRead: (conversationId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) => ({
          ...msg,
          isNew: false,
          status: msg.senderId !== state.currentUser?.id ? "read" : msg.status,
        })),
      },
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
      ),
    }))
  },

  sendInvitation: (toUserId, conversationId, type, message) => {
    const { currentUser } = get()
    if (!currentUser) return

    const invitation: Invitation = {
      id: Date.now().toString(),
      fromUserId: currentUser.id,
      toUserId,
      conversationId,
      type,
      status: "pending",
      createdAt: new Date(),
      message,
    }

    set((state) => ({
      invitations: [...state.invitations, invitation],
    }))

    // Notification pour le destinataire
    get().addNotification({
      type: "invitation_received",
      title: `Invitation de ${currentUser.name}`,
      message: type === "group" ? "Vous invite à rejoindre un groupe" : "Vous invite à discuter",
      avatar: currentUser.avatar,
      conversationId,
      invitationId: invitation.id,
      fromUserId: currentUser.id,
    })
  },

  acceptInvitation: (invitationId) => {
    const { invitations, currentUser } = get()
    const invitation = invitations.find((i) => i.id === invitationId)
    if (!invitation || !currentUser) return

    // Marquer l'invitation comme acceptée
    set((state) => ({
      invitations: state.invitations.map((i) => (i.id === invitationId ? { ...i, status: "accepted" } : i)),
      conversations: state.conversations.map((c) =>
        c.id === invitation.conversationId ? { ...c, status: "active" } : c,
      ),
    }))

    // Notification pour l'expéditeur
    get().addNotification({
      type: "invitation_accepted",
      title: `${currentUser.name} a accepté`,
      message: "Votre invitation a été acceptée",
      avatar: currentUser.avatar,
      conversationId: invitation.conversationId,
      fromUserId: currentUser.id,
    })
  },

  declineInvitation: (invitationId) => {
    const { invitations, currentUser } = get()
    const invitation = invitations.find((i) => i.id === invitationId)
    if (!invitation || !currentUser) return

    // Marquer l'invitation comme refusée
    set((state) => ({
      invitations: state.invitations.map((i) => (i.id === invitationId ? { ...i, status: "declined" } : i)),
      conversations: state.conversations.map((c) =>
        c.id === invitation.conversationId ? { ...c, status: "declined" } : c,
      ),
    }))

    // Notification pour l'expéditeur
    get().addNotification({
      type: "invitation_declined",
      title: `${currentUser.name} a refusé`,
      message: "Votre invitation a été refusée",
      avatar: currentUser.avatar,
      conversationId: invitation.conversationId,
      fromUserId: currentUser.id,
    })
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications.slice(0, 49)], // Garder max 50
    }))
  },

  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    }))
  },

  clearAllNotifications: () => {
    set({ notifications: [] })
  },

  startTyping: (conversationId) => {
    const { currentUser } = get()
    if (!currentUser) return

    const typingUser: TypingUser = {
      userId: currentUser.id,
      userName: currentUser.name,
      conversationId,
      timestamp: new Date(),
    }

    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter((t) => !(t.userId === currentUser.id && t.conversationId === conversationId)),
        typingUser,
      ],
    }))

    // Auto-remove après 3 secondes
    setTimeout(() => {
      get().stopTyping(conversationId)
    }, 3000)
  },

  stopTyping: (conversationId) => {
    const { currentUser } = get()
    if (!currentUser) return

    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.userId === currentUser.id && t.conversationId === conversationId),
      ),
    }))
  },

  updateUserStatus: (userId, status) => {
    set((state) => ({
      allUsers: state.allUsers.map((u) =>
        u.id === userId ? { ...u, status, lastSeen: status === "offline" ? new Date() : undefined } : u,
      ),
      onlineUsers:
        status === "online"
          ? [...state.onlineUsers.filter((id) => id !== userId), userId]
          : state.onlineUsers.filter((id) => id !== userId),
    }))
  },
}))
