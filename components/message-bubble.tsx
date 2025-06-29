"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/lib/store"
import { MediaMessageBubble } from "@/components/media-message-bubble"
import { Loader2 } from "lucide-react"

export function MessageBubble({ message }: { message: any }) {
  const { currentUser } = useMessagingStore()

  if (!message || !currentUser) return null;

  const isOwnMessage = message.sender_id === currentUser.id
  const isSystemMessage = message.type === "system"

  // Message système (création de groupe, etc.)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-muted/50 px-3 py-2 rounded-full">
          <p className="text-xs text-muted-foreground text-center">{message.content}</p>
        </div>
      </div>
    )
  }
  
  // Message média
  if (message.type !== "text") {
    return <MediaMessageBubble message={message} />
  }

  // Message texte standard
  return (
    <div className={cn("flex gap-3", isOwnMessage && "flex-row-reverse")}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>{message.sender?.name?.[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isOwnMessage ? "items-end" : "items-start")}>
        {!isOwnMessage && <span className="text-xs text-muted-foreground font-medium">{message.sender?.name}</span>}

        <div
          className={cn(
            "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
          {isOwnMessage && message.status && (
            <div className="flex items-center text-xs text-muted-foreground">
              {message.status === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
              {message.status === "sent" && "✓"}
              {message.status === "delivered" && "✓✓"}
              {message.status === "read" && <span className="text-blue-500">✓✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

