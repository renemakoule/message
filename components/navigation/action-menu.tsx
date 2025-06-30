"use client"

import { useState } from "react"
import { Plus, MessageCircle, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserSelectionModal } from "@/components/onboarding/user-selection-modal"
import { GroupCreationModal } from "@/components/onboarding/group-creation-modal"
import { PublicGroupsModal } from "@/components/onboarding/public-groups-modal"
import { cn } from "@/lib/utils"

interface ActionMenuProps {
  variant?: "button" | "dropdown"
  className?: string
}

export function ActionMenu({ variant = "button", className }: ActionMenuProps) {
  const [showUserSelection, setShowUserSelection] = useState(false)
  const [showGroupCreation, setShowGroupCreation] = useState(false)
  const [showPublicGroups, setShowPublicGroups] = useState(false)

  // Le callback onConversationCreated est vide ici car ce menu est utilisé
  // dans un contexte où le rafraîchissement est géré par des abonnements temps réel.
  const handleConversationCreated = () => {
    setShowUserSelection(false);
  }

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className={cn("gap-2", className)}>
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowUserSelection(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Nouvelle conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowGroupCreation(true)}>
              <Users className="h-4 w-4 mr-2" />
              Créer un groupe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowPublicGroups(true)}>
              <Globe className="h-4 w-4 mr-2" />
              Rejoindre un groupe public
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Modales */}
        {showUserSelection && <UserSelectionModal onClose={() => setShowUserSelection(false)} onConversationCreated={handleConversationCreated} />}
        {showGroupCreation && <GroupCreationModal onClose={() => setShowGroupCreation(false)} />}
        {showPublicGroups && <PublicGroupsModal onClose={() => setShowPublicGroups(false)} />}
      </>
    )
  }

  return (
    <>
      <Button size="sm" onClick={() => setShowUserSelection(true)} className={cn("gap-2", className)}>
        <Plus className="h-4 w-4" />
        Nouveau
      </Button>

      {/* Modales */}
      {showUserSelection && <UserSelectionModal onClose={() => setShowUserSelection(false)} onConversationCreated={handleConversationCreated} />}
      {showGroupCreation && <GroupCreationModal onClose={() => setShowGroupCreation(false)} />}
      {showPublicGroups && <PublicGroupsModal onClose={() => setShowPublicGroups(false)} />}
    </>
  )
}