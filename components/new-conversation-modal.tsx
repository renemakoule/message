"use client"

import { useState } from "react"
import { X, Search, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useMessagingStore } from "@/lib/store"

interface NewConversationModalProps {
  onClose: () => void
}

export function NewConversationModal({ onClose }: NewConversationModalProps) {
  const { createConversation } = useMessagingStore()
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
      onClose()
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
      onClose()
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Nouvelle discussion</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <Tabs defaultValue="private" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversation privée
              </TabsTrigger>
              <TabsTrigger value="group" className="gap-2">
                <Users className="h-4 w-4" />
                Créer un groupe
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Liste des utilisateurs */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCreatePrivateConversation(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
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
            </TabsContent>

            <TabsContent value="group" className="space-y-4">
              {/* Nom du groupe */}
              <div>
                <label className="text-sm font-medium mb-2 block">Nom du groupe</label>
                <Input
                  placeholder="Entrez le nom du groupe..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              {/* Sélection des membres */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sélectionner les membres</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher des personnes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton de création */}
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full"
              >
                Créer le groupe ({selectedUsers.length} membre{selectedUsers.length > 1 ? "s" : ""})
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
