"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, MoreVertical, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMessagingStore } from "@/lib/store"
import { MessageBubble } from "@/components/message-bubble"
import { TypingIndicator } from "@/components/typing-indicator"
import { V0StyleMessageInput } from "@/components/v0-style-message-input"
import { ConversationSettingsModal } from "@/components/conversation-settings-modal"
import { NotificationSystem } from "@/components/notification-system"
import { cn } from "@/lib/utils"

export function ChatWindow() {
  const { selectedConversation, messages, startCall } = useMessagingStore()
  const [isTyping, setIsTyping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas pour les nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isUserScrolling])

  // Détecter la position de scroll
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // 50px de marge

      setShowScrollButton(!isAtBottom)
      setIsUserScrolling(!isAtBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      setIsUserScrolling(false)
    }
  }

  // Grouper les messages par date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {}

    messages.forEach((message) => {
      // Simuler des dates différentes pour la démo
      const messageDate = new Date()

      // Simuler des messages plus anciens basés sur l'ID
      const messageId = Number.parseInt(message.id)
      if (messageId <= 2) {
        messageDate.setDate(messageDate.getDate() - 2) // Il y a 2 jours
      } else if (messageId <= 4) {
        messageDate.setDate(messageDate.getDate() - 1) // Hier
      }
      // Les autres messages sont d'aujourd'hui

      const dateKey = messageDate.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier"
    } else {
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Bienvenue dans votre messagerie !</h2>
          <p className="text-muted-foreground mb-6">
            Sélectionnez une conversation dans la liste de gauche pour commencer à discuter, ou créez une nouvelle
            conversation.
          </p>
        </div>
      </div>
    )
  }

  if (selectedConversation.status === "pending") {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* En-tête fixe */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-muted text-muted-foreground">{selectedConversation.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
              <p className="text-sm text-muted-foreground">Invitation en attente</p>
            </div>
          </div>
          <NotificationSystem />
        </div>

        {/* Zone d'attente */}
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-medium mb-2 text-foreground">
              En attente de la réponse de {selectedConversation.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Vous pourrez commencer à discuter dès que votre invitation sera acceptée.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const conversationMessages = messages[selectedConversation.id] || []
  const messageGroups = groupMessagesByDate(conversationMessages)
  const sortedDates = Object.keys(messageGroups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* En-tête fixe - ne scroll jamais */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2"
          onClick={() => setShowSettings(true)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted text-muted-foreground">{selectedConversation.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedConversation.type === "group"
                ? `${selectedConversation.memberCount} membres`
                : selectedConversation.isOnline
                  ? "En ligne"
                  : "Hors ligne"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationSystem />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              startCall(selectedConversation.id, "audio")
              const button = document.activeElement as HTMLButtonElement
              button?.blur()
            }}
            className="hover:bg-green-100 hover:text-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              startCall(selectedConversation.id, "video")
              const button = document.activeElement as HTMLButtonElement
              button?.blur()
            }}
            className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
          >
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>Paramètres de la conversation</DropdownMenuItem>
              <DropdownMenuItem>Rechercher dans la conversation</DropdownMenuItem>
              <DropdownMenuItem>Exporter la conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Zone des messages avec scroll interne UNIQUEMENT */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-background"
        style={{ height: 0 }} // Force le flex-1 à calculer correctement
      >
        <div className="p-4 space-y-4">
          {conversationMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{selectedConversation.name} a rejoint la conversation.</p>
              <p className="text-sm text-muted-foreground mt-2">Commencez votre discussion !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  {/* Séparateur de date - apparaît selon le contexte */}
                  <div className="sticky top-0 flex items-center justify-center py-2 bg-background/80 backdrop-blur-sm z-10">
                    <div className="bg-muted px-3 py-1 rounded-full">
                      <span className="text-xs text-muted-foreground font-medium">{formatDateLabel(dateKey)}</span>
                    </div>
                  </div>

                  {/* Messages de cette date */}
                  <div className="space-y-4">
                    {messageGroups[dateKey].map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isTyping && <TypingIndicator />}

          {/* Élément pour auto-scroll */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Bouton de scroll vers le bas - apparaît seulement quand on a scrollé vers le haut */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-6 z-20">
          <Button
            onClick={scrollToBottom}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground",
              "animate-in slide-in-from-bottom-2 duration-200",
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Zone de saisie fixe en bas - ne scroll jamais */}
      <div className="flex-shrink-0">
        <V0StyleMessageInput conversationId={selectedConversation.id} />
      </div>

      {/* Modal des paramètres */}
      {showSettings && (
        <ConversationSettingsModal conversation={selectedConversation} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
