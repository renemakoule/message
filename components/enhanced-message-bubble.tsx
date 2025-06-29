"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/lib/store"
import { MediaMessageBubble } from "@/components/media-message-bubble"

interface EnhancedMessageBubbleProps {
  message: {
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
}

export function EnhancedMessageBubble({ message }: EnhancedMessageBubbleProps) {
  const { currentUser } = useMessagingStore()
  const isCurrentUser = message.senderId === currentUser?.id
  const isSystemMessage = message.senderId === "system"

  // Utiliser MediaMessageBubble pour les médias
  if (message.type !== "text" && message.type !== "system") {
    return <MediaMessageBubble message={message} />
  }

  // Message système
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-gray-100 px-3 py-2 rounded-full max-w-xs">
          <p className="text-xs text-gray-600 text-center">{message.content}</p>
        </div>
      </div>
    )
  }

  // Indicateur de nouveau message
  const isNewMessage = message.isNew && !isCurrentUser

  return (
    <div className={cn("flex gap-3 max-w-[70%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
          <AvatarFallback className="text-xs">{message.senderName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isCurrentUser ? "items-end" : "items-start")}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 px-1">{message.senderName}</span>
            {isNewMessage && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Nouveau
              </Badge>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-sm break-words relative",
            isCurrentUser
              ? "bg-blue-500 text-white rounded-br-md"
              : isNewMessage
                ? "bg-blue-50 border border-blue-200 text-gray-900 rounded-bl-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md",
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <div className={cn("flex items-center gap-1 px-1", isCurrentUser ? "flex-row-reverse" : "")}>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
          {isCurrentUser && message.status && (
            <div className="flex items-center">
              {message.status === "sending" && <span className="text-xs text-gray-400">⏳</span>}
              {message.status === "sent" && <span className="text-xs text-gray-400">✓</span>}
              {message.status === "delivered" && <span className="text-xs text-gray-400">✓✓</span>}
              {message.status === "read" && <span className="text-xs text-blue-500">✓✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
