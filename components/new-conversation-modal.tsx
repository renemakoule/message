"use client"

import { useState } from "react"
import { X, Search, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useMessagingStore } from "@/lib/store"
import { useUsers } from "@/hooks/use-users"
import { useConversations } from "@/hooks/use-conversations"

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: () => void;
}

export function NewConversationModal({ onClose, onConversationCreated }: NewConversationModalProps) {
  const { currentUser } = useMessagingStore();
  const { users, loading: usersLoading } = useUsers();
  const { createPersonalConversation, createGroupConversation } = useConversations(currentUser?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredUsers = (users || [])
    .filter((user) => user.id !== currentUser?.id)
    .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreatePrivateConversation = async (userId: string) => {
    setIsCreating(true);
    try {
      await createPersonalConversation(userId);
      onConversationCreated();
    } catch (error) {
      console.error("Failed to create private conversation:", error);
    } finally {
      setIsCreating(false);
      onClose();
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      setIsCreating(true);
      try {
        await createGroupConversation({
          name: groupName,
          participantIds: selectedUsers,
        });
        onConversationCreated();
      } catch (error) {
        console.error("Failed to create group:", error);
      } finally {
        setIsCreating(false);
        onClose();
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Nouvelle discussion</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isCreating}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="private" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private" className="gap-2"><MessageCircle className="h-4 w-4" />Privée</TabsTrigger>
              <TabsTrigger value="group" className="gap-2"><Users className="h-4 w-4" />Groupe</TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher par nom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {usersLoading ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" /> : filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleCreatePrivateConversation(user.id)}>
                    <div className="relative">
                      <Avatar className="h-10 w-10"><AvatarImage src={user.avatar_url || "/placeholder.svg"} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                      {user.status === 'online' && (<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />)}
                    </div>
                    <div className="flex-1"><p className="font-medium">{user.name}</p><p className="text-sm text-gray-500">{user.status === 'online' ? "En ligne" : "Hors ligne"}</p></div>
                    <Button size="sm" disabled={isCreating}>Inviter</Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="group" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom du groupe</label>
                <Input placeholder="Entrez le nom du groupe..." value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sélectionner les membres</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Rechercher des personnes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {usersLoading ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" /> : filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleUserSelection(user.id)} />
                      <Avatar className="h-8 w-8"><AvatarImage src={user.avatar_url || "/placeholder.svg"} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating} className="w-full">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : `Créer le groupe (${selectedUsers.length} membre${selectedUsers.length > 1 ? "s" : ""})`}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

