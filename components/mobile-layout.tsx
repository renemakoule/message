"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Video, Search, Plus, Settings, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMessagingStore } from "@/lib/store"
import { MessageBubble } from "@/components/message-bubble"
import { MobileConversationDetails } from "@/components/mobile-conversation-details"
import { MobileNewConversation } from "@/components/mobile-new-conversation"
import { CallInterface } from "@/components/call-interface"
import { V0StyleMessageInput } from "@/components/v0-style-message-input"
import { MobileSettingsScreen } from "@/components/mobile-settings-screen"
import { MobileUserSettingsScreen } from "@/components/mobile-user-settings-screen"
import { MobileConversationSettingsScreen } from "@/components/mobile-conversation-settings-screen"
import { NotificationSystem } from "@/components/notification-system"

type MobileScreen =
  | "conversations"
  | "chat"
  | "details"
  | "new-conversation"
  | "settings"
  | "user-settings"
  | "conversation-settings"

export function MobileLayout() {
  const { conversations, selectedConversation, setSelectedConversation, user, isCallActive } = useMessagingStore()
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>("conversations")
  const [searchQuery, setSearchQuery] = useState("")

  const navigateToChat = (conversation: any) => {
    setSelectedConversation(conversation)
    setCurrentScreen("chat")
  }

  const navigateToDetails = () => {
    setCurrentScreen("details")
  }

  const navigateBack = () => {
    if (currentScreen === "chat") {
      setCurrentScreen("conversations")
      setSelectedConversation(null)
    } else if (currentScreen === "details") {
      setCurrentScreen("chat")
    } else if (currentScreen === "new-conversation") {
      setCurrentScreen("conversations")
    } else if (currentScreen === "settings" || currentScreen === "user-settings") {
      setCurrentScreen("conversations")
    } else if (currentScreen === "conversation-settings") {
      setCurrentScreen("chat")
    }
  }

  const navigateToNewConversation = () => {
    setCurrentScreen("new-conversation")
  }

  const navigateToSettings = () => {
    setCurrentScreen("settings")
  }

  const navigateToUserSettings = () => {
    setCurrentScreen("user-settings")
  }

  const navigateToConversationSettings = () => {
    setCurrentScreen("conversation-settings")
  }

  const handleNotificationNavigation = (notification: any) => {
    if (notification.type === "message" && notification.conversationId) {
      // Trouver et sélectionner la conversation
      const conversation = conversations.find((c) => c.id === notification.conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        setCurrentScreen("chat") // Navigation vers l'écran de chat
      }
    } else if (notification.type === "call") {
      // Pour les appels, rester sur l'écran actuel ou naviguer vers les conversations
      setCurrentScreen("conversations")
    }
  }

  if (isCallActive) {
    return <CallInterface />
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Écran 1: Liste des Conversations */}
      {currentScreen === "conversations" && (
        <ConversationListScreen
          conversations={conversations}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onConversationSelect={navigateToChat}
          onNewConversation={navigateToNewConversation}
          onSettings={navigateToSettings}
          onUserSettings={navigateToUserSettings}
          onNotificationClick={handleNotificationNavigation}
        />
      )}

      {/* Écran 2: Fenêtre de Discussion */}
      {currentScreen === "chat" && selectedConversation && (
        <ChatScreen
          conversation={selectedConversation}
          onBack={navigateBack}
          onShowDetails={navigateToDetails}
          onShowConversationSettings={navigateToConversationSettings}
          onNotificationClick={handleNotificationNavigation}
        />
      )}

      {/* Écran 3: Détails de la Conversation */}
      {currentScreen === "details" && selectedConversation && (
        <MobileConversationDetails conversation={selectedConversation} onBack={navigateBack} />
      )}

      {/* Écran: Nouvelle Conversation */}
      {currentScreen === "new-conversation" && <MobileNewConversation onBack={navigateBack} />}

      {/* Écran: Paramètres Généraux */}
      {currentScreen === "settings" && <MobileSettingsScreen onBack={navigateBack} />}

      {/* Écran: Paramètres Utilisateur */}
      {currentScreen === "user-settings" && <MobileUserSettingsScreen onBack={navigateBack} />}

      {/* Écran: Paramètres de Conversation */}
      {currentScreen === "conversation-settings" && selectedConversation && (
        <MobileConversationSettingsScreen conversation={selectedConversation} onBack={navigateBack} />
      )}
    </div>
  )
}

// Écran 1: Liste des Conversations
interface ConversationListScreenProps {
  conversations: any[]
  user: any
  searchQuery: string
  setSearchQuery: (query: string) => void
  onConversationSelect: (conversation: any) => void
  onNewConversation: () => void
  onSettings: () => void
  onUserSettings: () => void
  onNotificationClick: (notification: any) => void
}

function ConversationListScreen({
  conversations,
  user,
  searchQuery,
  setSearchQuery,
  onConversationSelect,
  onNewConversation,
  onSettings,
  onUserSettings,
  onNotificationClick,
}: ConversationListScreenProps) {
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* En-tête mobile avec menu utilisateur */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={onUserSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem>Statut</DropdownMenuItem>
                <DropdownMenuItem>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <h1 className="text-lg font-semibold">Messages</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem onNotificationClick={onNotificationClick} />
            <Button size="sm" onClick={onNewConversation} className="rounded-full w-10 h-10 p-0">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* État vide optimisé mobile */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Plus className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Vos conversations apparaîtront ici</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Appuyez sur l'icône '+' pour commencer votre première conversation
          </p>
          <Button onClick={onNewConversation} size="lg" className="w-full max-w-xs">
            <Plus className="h-5 w-5 mr-2" />
            Démarrer une discussion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête mobile avec menu utilisateur */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onUserSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem>Statut</DropdownMenuItem>
              <DropdownMenuItem>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationSystem onNotificationClick={onNotificationClick} />
          <Button size="sm" onClick={onNewConversation} className="rounded-full w-10 h-10 p-0">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche mobile */}
      <div className="p-4 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Liste des conversations optimisée tactile */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="flex items-center gap-4 p-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
            onClick={() => onConversationSelect(conversation)}
          >
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate text-base">{conversation.name}</h3>
                <span className="text-sm text-gray-500 ml-2">{conversation.lastMessageTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.status === "pending" ? (
                    <span className="italic text-yellow-600">Invitation envoyée...</span>
                  ) : (
                    conversation.lastMessage
                  )}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 bg-blue-600 min-w-[20px] h-5 text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Écran 2: Fenêtre de Discussion
interface ChatScreenProps {
  conversation: any
  onBack: () => void
  onShowDetails: () => void
  onShowConversationSettings: () => void
  onNotificationClick: (notification: any) => void
}

function ChatScreen({
  conversation,
  onBack,
  onShowDetails,
  onShowConversationSettings,
  onNotificationClick,
}: ChatScreenProps) {
  const { messages, sendMessage, startCall } = useMessagingStore()

  if (conversation.status === "pending") {
    return (
      <div className="flex flex-col h-full">
        {/* En-tête mobile avec retour */}
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{conversation.name}</h2>
            <p className="text-sm text-yellow-600">Invitation en attente</p>
          </div>
        </div>

        {/* Zone d'attente mobile */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">En attente de {conversation.name}</h3>
            <p className="text-sm text-gray-500 text-center">
              La conversation commencera dès que votre invitation sera acceptée
            </p>
          </div>
        </div>
      </div>
    )
  }

  const conversationMessages = messages[conversation.id] || []

  return (
    <div className="flex flex-col h-full">
      {/* En-tête mobile avec navigation */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1" onClick={onShowDetails}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{conversation.name}</h2>
            <p className="text-sm text-gray-500">
              {conversation.type === "group"
                ? `${conversation.memberCount} membres`
                : conversation.isOnline
                  ? "En ligne"
                  : "Hors ligne"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => startCall(conversation.id, "audio")} className="p-2">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => startCall(conversation.id, "video")} className="p-2">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onShowConversationSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres de la conversation
              </DropdownMenuItem>
              <DropdownMenuItem>Rechercher dans la conversation</DropdownMenuItem>
              <DropdownMenuItem>Exporter la conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Zone des messages mobile */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{conversation.name} a rejoint la conversation</p>
            <p className="text-sm text-gray-400 mt-2">Commencez votre discussion !</p>
          </div>
        ) : (
          conversationMessages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
      </div>

      {/* Zone de saisie unifiée */}
      <div className="flex-shrink-0">
        <V0StyleMessageInput conversationId={conversation.id} />
      </div>
    </div>
  )
}
