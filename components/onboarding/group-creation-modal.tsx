"use client"

import { useState } from "react"
import { X, Users, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMessagingStore } from "@/lib/store"

interface GroupCreationModalProps {
  onClose: () => void
}

export function GroupCreationModal({ onClose }: GroupCreationModalProps) {
  const { allUsers, currentUser, createGroupConversation } = useMessagingStore()
  const [step, setStep] = useState<"details" | "members">("details")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Filtrer les utilisateurs (exclure l'utilisateur actuel)
  const filteredUsers = allUsers
    .filter((user) => user.id !== currentUser?.id)
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) return

    createGroupConversation({
      name: groupName.trim(),
      description: groupDescription.trim() || undefined,
      participants: selectedMembers,
      isPublic,
    })

    onClose()
  }

  const canProceed = step === "details" ? groupName.trim() : selectedMembers.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{step === "details" ? "Créer un groupe" : "Ajouter des membres"}</h2>
            <p className="text-gray-600 text-sm">
              {step === "details"
                ? "Définissez les informations de votre groupe"
                : "Sélectionnez les personnes à inviter"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Étapes */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === "details" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === "details" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Détails</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className={`flex items-center gap-2 ${step === "members" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === "members" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Membres</span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "details" ? (
            <div className="space-y-6">
              {/* Nom du groupe */}
              <div>
                <Label htmlFor="groupName" className="text-sm font-medium">
                  Nom du groupe *
                </Label>
                <Input
                  id="groupName"
                  placeholder="Ex: Équipe Marketing, Amis du lycée..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="groupDescription" className="text-sm font-medium">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="groupDescription"
                  placeholder="Décrivez brièvement le but de ce groupe..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Groupe public */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="isPublic" className="text-sm font-medium">
                    Groupe public
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Les autres utilisateurs pourront découvrir et rejoindre ce groupe
                  </p>
                </div>
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des personnes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Membres sélectionnés */}
              {selectedMembers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Membres sélectionnés ({selectedMembers.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((userId) => {
                      const user = allUsers.find((u) => u.id === userId)
                      return user ? (
                        <div
                          key={userId}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          <button
                            onClick={() => toggleMember(userId)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Liste des utilisateurs */}
              <div>
                <h3 className="text-sm font-medium mb-3">Utilisateurs disponibles</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleMember(user.id)}
                    >
                      <Checkbox checked={selectedMembers.includes(user.id)} onChange={() => toggleMember(user.id)} />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {step === "details" ? (
              <span>Étape 1 sur 2</span>
            ) : (
              <span>
                {selectedMembers.length} membre{selectedMembers.length > 1 ? "s" : ""} sélectionné
                {selectedMembers.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {step === "members" && (
              <Button variant="outline" onClick={() => setStep("details")}>
                Retour
              </Button>
            )}
            <Button onClick={step === "details" ? () => setStep("members") : handleCreateGroup} disabled={!canProceed}>
              {step === "details" ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter des membres
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Créer le groupe
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
