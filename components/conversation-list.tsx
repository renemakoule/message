"use client"

import { useState } from "react"
import { Search, Settings, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessagingStore } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import { useConversations } from "@/hooks/use-conversations"
import { AuthService } from "@/lib/auth"
import { SettingsModal } from "@/components/settings-modal"
import { UserSettingsModal } from "@/components/user-settings-modal"
import { ActionMenu } from "@/components/navigation/action-menu"
import { cn } from "@/lib/utils"

export function ConversationList() {
  const { currentUser, selectedConversation, setSelectedConversation } = useMessagingStore()
  const { conversations, loading: conversationsLoading, error } = useConversations(currentUser?.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)

  const handleSignOut = async () => {
    await AuthService.signOut()
  }

  if (conversationsLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3 mt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Erreur: {error}</div>;
  }

  const filteredConversations = (conversations || []).filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const groupConversations = filteredConversations.filter((conv) => conv.type === "group")
  const personalConversations = filteredConversations.filter((conv) => conv.type === "personal")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={currentUser?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-muted text-muted-foreground">{currentUser?.name?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setShowUserSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <h1 className="font-semibold text-foreground">Messages</h1>
        </div>
        <ActionMenu variant="button" />
      </div>

      <div className="p-4 border-b border-border bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-input text-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {groupConversations.length > 0 && (
            <ConversationSection
              title="Groupes"
              conversations={groupConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          )}
          {personalConversations.length > 0 && (
            <ConversationSection
              title="Messages privés"
              conversations={personalConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          )}
          {filteredConversations.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune conversation trouvée pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showUserSettings && <UserSettingsModal onClose={() => setShowUserSettings(false)} />}
    </div>
  )
}

function ConversationSection({ title, conversations, selectedConversation, onSelectConversation }: any) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
        {title} ({conversations.length})
      </h3>
      <div className="space-y-1">
        {conversations.map((conversation: any) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation?.id === conversation.id}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  )
}

function ConversationItem({ conversation, isSelected, onClick }: any) {
    const lastMessageTime = conversation.last_message_at 
        ? new Date(conversation.last_message_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) 
        : "";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-muted text-muted-foreground">{conversation.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
          <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{conversation.last_message || "..."}</p>
          {conversation.unread_count > 0 && (
            <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

