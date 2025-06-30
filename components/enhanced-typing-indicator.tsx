"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"

interface EnhancedTypingIndicatorProps {
  conversationId: string
}

export function EnhancedTypingIndicator({ conversationId }: EnhancedTypingIndicatorProps) {
  const { typingUsers, currentUser } = useMessagingStore()

  const typingInThisConversation = typingUsers.filter(
    (t) => t.conversationId === conversationId && t.userId !== currentUser?.id,
  )

  if (typingInThisConversation.length === 0) return null

  const typingUser = typingInThisConversation[0] // Afficher seulement le premier utilisateur qui tape

  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 duration-300">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/placeholder.svg?height=32&width=32" />
        <AvatarFallback className="text-xs">{typingUser.userName[0]}</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 mr-2">{typingUser.userName} écrit</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}