"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, MoreVertical, Settings, ChevronDown, Loader2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMessagingStore } from "@/lib/store"
import { useMessages } from "@/hooks/use-messages"
import { useAuth } from "@/hooks/use-auth"
import { MessageBubble } from "@/components/message-bubble"
import { V0StyleMessageInput } from "@/components/v0-style-message-input"
import { ConversationSettingsModal } from "@/components/conversation-settings-modal"
import { EnhancedNotificationSystem } from "@/components/enhanced-notification-system"
import { TypingIndicator } from "@/components/typing-indicator"
import { cn } from "@/lib/utils"

export function ChatWindow() {
  const { currentUser } = useMessagingStore();
  const { selectedConversation, startCall } = useMessagingStore()
  const { messages, loading: messagesLoading, error } = useMessages(selectedConversation?.id, currentUser?.id)

  const [showSettings, setShowSettings] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isUserScrolling])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
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

  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { [key: string]: any[] } = {}
    msgs.forEach((message) => {
      const dateKey = new Date(message.created_at).toDateString()
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
      return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    }
  }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Votre messagerie</h2>
          <p className="text-muted-foreground mb-6">
            Sélectionnez une conversation pour commencer à discuter.
          </p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages || [])
  const sortedDates = Object.keys(messageGroups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2"
          onClick={() => setShowSettings(true)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted text-muted-foreground">{selectedConversation.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedConversation.type === "group"
                ? `${selectedConversation.participant_count} membres`
                : "Détails"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnhancedNotificationSystem />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startCall(selectedConversation.id, "audio")}
            className="hover:bg-green-100 hover:text-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startCall(selectedConversation.id, "video")}
            className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
          >
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>Paramètres</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-background" style={{ height: 0 }}>
        <div className="p-4 space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">Erreur de chargement des messages.</div>
          ) : (messages || []).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">C'est le début de votre conversation.</p>
              <p className="text-sm text-muted-foreground mt-2">Envoyez un message pour commencer !</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <div className="sticky top-0 flex items-center justify-center py-2 bg-background/80 backdrop-blur-sm z-10">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground font-medium">{formatDateLabel(dateKey)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {messageGroups[dateKey].map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>
            ))
          )}
          {/* <TypingIndicator /> */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute bottom-24 right-6 z-20">
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex-shrink-0">
        <V0StyleMessageInput conversationId={selectedConversation.id} />
      </div>

      {showSettings && (
        <ConversationSettingsModal conversation={selectedConversation} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

