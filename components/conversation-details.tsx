"use client"

import { Phone, Video, UserPlus, Download, ImageIcon, FileText, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessagingStore } from "@/lib/store"
import { useUsers } from "@/hooks/use-users"
import { supabase } from "@/lib/supabase-client"
import { useEffect, useState } from "react"

export function ConversationDetails() {
  const { selectedConversation } = useMessagingStore()
  const { users: allUsers, loading: usersLoading } = useUsers();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedConversation || selectedConversation.type !== 'group') {
        setLoadingParticipants(false);
        return;
      }
      setLoadingParticipants(true);
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', selectedConversation.id);

      if (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]);
      } else {
        const participantDetails = data
            .map(p => allUsers.find(u => u.id === p.user_id))
            .filter(Boolean); // Filter out any undefined users
        setParticipants(participantDetails);
      }
      setLoadingParticipants(false);
    };

    if (selectedConversation && allUsers.length > 0) {
        fetchParticipants();
    }
  }, [selectedConversation, allUsers]);

  if (!selectedConversation) return null

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border text-center bg-card">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={selectedConversation.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
            {selectedConversation.name[0]}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg text-foreground">{selectedConversation.name}</h2>
        {selectedConversation.type === "group" ? (
          <p className="text-sm text-muted-foreground">{selectedConversation.participant_count} membres</p>
        ) : (
          <p className="text-sm text-muted-foreground">Conversation privée</p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Phone className="h-4 w-4" />Appeler</Button>
            <Button variant="outline" size="sm" className="gap-2"><Video className="h-4 w-4" />Vidéo</Button>
          </div>
          <Separator />
          {selectedConversation.type === "group" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground flex items-center gap-2"><Users className="h-4 w-4"/>Membres</h3>
                <Button variant="ghost" size="sm" className="gap-2"><UserPlus className="h-4 w-4" />Ajouter</Button>
              </div>
              <div className="space-y-3">
                {loadingParticipants || usersLoading ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/> : participants.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8"><AvatarImage src={member.avatar_url || "/placeholder.svg"} /><AvatarFallback>{member.name[0]}</AvatarFallback></Avatar>
                      {member.status === 'online' && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />}
                    </div>
                    <div className="flex-1"><p className="text-sm font-medium text-foreground">{member.name}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Separator />
          {/* La section Fichiers partagés nécessiterait son propre hook pour être fonctionnelle */}
        </div>
      </ScrollArea>
    </div>
  )
}

