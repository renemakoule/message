"use client"

import { useState } from "react"
import { X, Search, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMessagingStore } from "@/lib/store"
import { useUsers } from "@/hooks/use-users"
import { useConversations } from "@/hooks/use-conversations"
import type { Database } from "@/lib/supabase"
import { toast } from "sonner"

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface UserSelectionModalProps {
  onClose: () => void;
  onConversationCreated: () => void; // Callback pour notifier le parent
}

export function UserSelectionModal({ onClose, onConversationCreated }: UserSelectionModalProps) {
  const { currentUser } = useMessagingStore()
  const { createPersonalConversation } = useConversations(currentUser?.id);
  const { users, loading: usersLoading } = useUsers();

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [inviteMessage, setInviteMessage] = useState("")
  const [isCreating, setIsCreating] = useState(false); // État de chargement local

  const filteredUsers = (users || [])
    .filter((user) => user.id !== currentUser?.id)
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleSendInvitation = async () => {
    if (!selectedUser) return;
    
    setIsCreating(true);

    try {
      await createPersonalConversation(selectedUser.id, inviteMessage.trim() || undefined);
      toast.success(`Invitation envoyée à ${selectedUser.name}.`);
      onConversationCreated(); // Notifier le parent que la conversation est créée et qu'il faut rafraîchir
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Échec de la création de la conversation.");
      setIsCreating(false); 
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "online": return "En ligne"
      case "away": return "Absent"
      default: return "Hors ligne"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Nouvelle conversation</h2>
            <p className="text-gray-600 text-sm">Choisissez une personne avec qui discuter</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isCreating}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="flex-1 overflow-y-auto p-6">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Chargement des utilisateurs...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600">
                {searchQuery ? "Essayez de modifier votre recherche" : "Aucun utilisateur disponible"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                        user.status,
                      )} border-2 border-white rounded-full`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(user.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    {user.about && <p className="text-sm text-gray-500 truncate mt-1">{user.about}</p>}
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message d'invitation (si utilisateur sélectionné) */}
        {selectedUser && (
          <div className="p-6 border-t bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message d'invitation (optionnel)</label>
              <Input
                placeholder="Écrivez un message pour accompagner votre invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                maxLength={200}
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500 mt-1">{inviteMessage.length}/200 caractères</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedUser ? (
              <span>Invitation à {selectedUser.name}</span>
            ) : (
              <span>Sélectionnez une personne pour continuer</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Annuler
            </Button>
            <Button onClick={handleSendInvitation} disabled={!selectedUser || isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-2" />}
              {isCreating ? "Création en cours..." : "Envoyer l'invitation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}