"use client"

import { useState } from "react"
import { ArrowLeft, Search, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { useMessagingStore } from "@/lib/store"

interface MobileNewConversationProps {
  onBack: () => void
}

export function MobileNewConversation({ onBack }: MobileNewConversationProps) {
  const { createConversation } = useMessagingStore()
  const [currentStep, setCurrentStep] = useState<"choice" | "private" | "group-members" | "group-details">("choice")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")

  const mockUsers = [
    { id: "1", name: "Alice Martin", avatar: "/placeholder.svg?height=32&width=32", isOnline: true },
    { id: "2", name: "Bob Dupont", avatar: "/placeholder.svg?height=32&width=32", isOnline: false },
    { id: "3", name: "Claire Moreau", avatar: "/placeholder.svg?height=32&width=32", isOnline: true },
    { id: "4", name: "David Leroy", avatar: "/placeholder.svg?height=32&width=32", isOnline: true },
  ]

  const filteredUsers = mockUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreatePrivateConversation = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      createConversation({
        type: "personal",
        name: user.name,
        avatar: user.avatar,
        participants: [userId],
      })
      onBack()
    }
  }

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      createConversation({
        type: "group",
        name: groupName,
        avatar: "/placeholder.svg?height=40&width=40",
        participants: selectedUsers,
      })
      onBack()
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case "choice":
        return "Nouvelle discussion"
      case "private":
        return "Conversation privée"
      case "group-members":
        return "Choisir les membres"
      case "group-details":
        return "Finaliser le groupe"
      default:
        return "Nouvelle discussion"
    }
  }

  const handleBack = () => {
    if (currentStep === "choice") {
      onBack()
    } else if (currentStep === "private") {
      setCurrentStep("choice")
    } else if (currentStep === "group-members") {
      setCurrentStep("choice")
    } else if (currentStep === "group-details") {
      setCurrentStep("group-members")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête mobile avec navigation */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{getStepTitle()}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Étape 1: Choix du type */}
        {currentStep === "choice" && (
          <div className="p-4 space-y-4">
            <div
              className="flex items-center gap-4 p-4 border rounded-lg active:bg-gray-50 transition-colors"
              onClick={() => setCurrentStep("private")}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Conversation privée</h3>
                <p className="text-sm text-gray-500">Discuter avec une personne</p>
              </div>
            </div>

            <div
              className="flex items-center gap-4 p-4 border rounded-lg active:bg-gray-50 transition-colors"
              onClick={() => setCurrentStep("group-members")}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Nouveau groupe</h3>
                <p className="text-sm text-gray-500">Créer une discussion de groupe</p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Conversation privée */}
        {currentStep === "private" && (
          <div className="p-4 space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Liste des utilisateurs */}
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border active:bg-gray-50 transition-colors"
                  onClick={() => handleCreatePrivateConversation(user.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.isOnline ? "En ligne" : "Hors ligne"}</p>
                  </div>
                  <Button size="sm">Inviter</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3: Sélection des membres du groupe */}
        {currentStep === "group-members" && (
          <div className="p-4 space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des personnes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Liste avec cases à cocher */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium flex-1">{user.name}</span>
                </div>
              ))}
            </div>

            {/* Bouton suivant */}
            <div className="pt-4">
              <Button
                onClick={() => setCurrentStep("group-details")}
                disabled={selectedUsers.length === 0}
                className="w-full h-12"
              >
                Suivant ({selectedUsers.length} membre{selectedUsers.length > 1 ? "s" : ""})
              </Button>
            </div>
          </div>
        )}

        {/* Étape 4: Finaliser le groupe */}
        {currentStep === "group-details" && (
          <div className="p-4 space-y-6">
            {/* Nom du groupe */}
            <div>
              <label className="block text-sm font-medium mb-2">Nom du groupe</label>
              <Input
                placeholder="Entrez le nom du groupe..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Membres sélectionnés */}
            <div>
              <label className="block text-sm font-medium mb-3">Membres sélectionnés</label>
              <div className="space-y-2">
                {selectedUsers.map((userId) => {
                  const user = mockUsers.find((u) => u.id === userId)
                  return (
                    user && (
                      <div key={userId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    )
                  )
                })}
              </div>
            </div>

            {/* Bouton de création */}
            <Button onClick={handleCreateGroup} disabled={!groupName.trim()} className="w-full h-12">
              Créer le groupe
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
