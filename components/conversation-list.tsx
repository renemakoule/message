"use client"

import { useState } from "react"
import { Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMessagingStore } from "@/lib/store"
import { SettingsModal } from "@/components/settings-modal"
import { UserSettingsModal } from "@/components/user-settings-modal"
import { ActionMenu } from "@/components/navigation/action-menu"
import { cn } from "@/lib/utils"
import { AuthService } from "@/lib/auth"

export function ConversationList() {
  const { conversations, selectedConversation, setSelectedConversation, currentUser } = useMessagingStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const groupConversations = filteredConversations.filter((conv) => conv.type === "group")
  const personalConversations = filteredConversations.filter((conv) => conv.type === "personal")

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* En-tête fixe */}
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
          <ActionMenu variant="dropdown" />
        </div>

        {/* État vide - Première utilisation */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-primary rounded-full" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">Bienvenue dans ChatApp ! 🎉</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Vous n'avez pas encore de conversations. Commencez par créer une nouvelle discussion ou rejoindre un groupe.
          </p>

          {/* Actions rapides */}
          <div className="space-y-3 w-full max-w-xs">
            <ActionMenu variant="dropdown" className="w-full justify-center" />
          </div>
        </div>

        {/* Modales */}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showUserSettings && <UserSettingsModal onClose={() => setShowUserSettings(false)} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête fixe avec menu utilisateur */}
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

      {/* Barre de recherche fixe */}
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

      {/* Liste des conversations avec scroll */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Conversations de groupe */}
          {groupConversations.length > 0 && (
            <ConversationSection
              title="Groupes"
              conversations={groupConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          )}

          {/* Conversations personnelles */}
          {personalConversations.length > 0 && (
            <ConversationSection
              title="Messages privés"
              conversations={personalConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          )}

          {/* État vide pour la recherche */}
          {filteredConversations.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune conversation trouvée pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Modales */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showUserSettings && <UserSettingsModal onClose={() => setShowUserSettings(false)} />}
    </div>
  )
}

interface ConversationSectionProps {
  title: string
  conversations: any[]
  selectedConversation: any
  onSelectConversation: (conversation: any) => void
}

function ConversationSection({
  title,
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
        {title} ({conversations.length})
      </h3>
      <div className="space-y-1">
        {conversations.map((conversation) => (
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

interface ConversationItemProps {
  conversation: any
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
        conversation.status === "pending" && "opacity-60",
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={conversation.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-muted text-muted-foreground">{conversation.name[0]}</AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
          <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.status === "pending" ? (
              <span className="italic">Invitation envoyée...</span>
            ) : (
              conversation.lastMessage
            )}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
