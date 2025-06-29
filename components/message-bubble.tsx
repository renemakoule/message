"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/lib/store"
import { MediaMessageBubble } from "@/components/media-message-bubble"

interface MessageBubbleProps {
  message: {
    id: string
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    timestamp: string
    type: "text" | "image" | "video" | "file"
    status?: "sending" | "sent" | "delivered" | "read"
    mediaUrl?: string
    fileName?: string
    fileSize?: string
    uploadProgress?: number
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useMessagingStore()

  // Si c'est un message média, utiliser le composant spécialisé
  if (message.type !== "text") {
    return <MediaMessageBubble message={message} />
  }

  const isOwnMessage = message.senderId === user?.id
  const isSystemMessage = message.senderId === "system"

  // Message système (appels)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-muted/50 px-3 py-2 rounded-full">
          <p className="text-xs text-muted-foreground text-center">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
          <AvatarFallback>{message.senderName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isOwnMessage && "items-end")}>
        {!isOwnMessage && <span className="text-xs text-muted-foreground font-medium">{message.senderName}</span>}

        <div
          className={cn(
            "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <ScrollArea className="max-h-32 w-full">
            <p className="text-sm">{message.content}</p>
          </ScrollArea>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
          {isOwnMessage && message.status && (
            <Badge variant="secondary" className="text-xs">
              {message.status === "read" ? "✓✓" : "✓"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
