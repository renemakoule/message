"use client"

import { useState } from "react"
import { Search, Settings, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessagingStore, type Conversation } from "@/lib/store"
import { useConversations } from "@/hooks/use-conversations"
import { AuthService } from "@/lib/auth"
import { SettingsModal } from "@/components/settings-modal"
import { UserSettingsModal } from "@/components/user-settings-modal"
import { ActionMenu } from "@/components/navigation/action-menu"
import { cn } from "@/lib/utils"

export function ConversationList() {
  // On récupère les conversations et le déclencheur depuis le store
  const { currentUser, selectedConversation, setSelectedConversation, conversations } = useMessagingStore()
  // Le hook useConversations gère maintenant le chargement et le rafraîchissement
  const { loading: conversationsLoading, error, refetch } = useConversations(currentUser?.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)

  const handleSignOut = async () => {
    await AuthService.signOut()
  }

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div><Skeleton className="h-8 w-8 rounded-md" /></div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3 mt-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
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
              <DropdownMenuItem onClick={() => setShowUserSettings(true)}><Settings className="h-4 w-4 mr-2" />Profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}><Settings className="h-4 w-4 mr-2" />Paramètres</DropdownMenuItem>
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
          <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background border-input text-foreground" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {groupConversations.length > 0 && <ConversationSection title="Groupes" conversations={groupConversations} selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />}
          {personalConversations.length > 0 && <ConversationSection title="Messages privés" conversations={personalConversations} selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />}
          {filteredConversations.length === 0 && searchQuery && <div className="text-center py-8"><p className="text-muted-foreground">Aucune conversation trouvée pour "{searchQuery}"</p></div>}
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
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">{title} ({conversations.length})</h3>
      <div className="space-y-1">
        {conversations.map((conversation: Conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} isSelected={selectedConversation?.id === conversation.id} onClick={() => onSelectConversation(conversation)} />
        ))}
      </div>
    </div>
  )
}

function ConversationItem({ conversation, isSelected, onClick }: { conversation: Conversation; isSelected: boolean; onClick: () => void; }) {
    const lastMessageTime = conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
    
    // Priorité n°3: Déterminer l'avatar et le statut à afficher
    const isGroup = conversation.type === 'group';
    const avatarUrl = isGroup ? conversation.avatar_url : conversation.other_participant_avatar_url;
    const displayName = isGroup ? conversation.name : conversation.other_participant_name;
    const presenceStatus = isGroup ? null : conversation.other_participant_status;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors", isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50")} onClick={onClick}>
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
          <AvatarFallback className="bg-muted text-muted-foreground">{displayName?.[0]}</AvatarFallback>
        </Avatar>
        {/* Priorité n°3: Afficher l'indicateur de présence */}
        {presenceStatus === 'online' && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-foreground truncate">{displayName}</h3>
          <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{conversation.last_message || "..."}</p>
          {conversation.unread_count > 0 && (
            <Badge variant="default" className="ml-2 bg-primary text-primary-foreground px-2">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}