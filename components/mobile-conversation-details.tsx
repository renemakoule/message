"use client"

import { ArrowLeft, Phone, Video, UserPlus, Download, ImageIcon, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useConversationSettings } from "@/hooks/use-conversation-settings"


interface MobileConversationDetailsProps {
  conversation: any
  onBack: () => void
}

export function MobileConversationDetails({ conversation, onBack }: MobileConversationDetailsProps) {
  const { participants, loadingParticipants } = useConversationSettings({ conversation });

  const mockAttachments = [
    { id: 1, name: "presentation.pdf", size: "2.4 MB", type: "pdf", date: "Hier" },
    { id: 2, name: "budget.xlsx", size: "1.2 MB", type: "excel", date: "2 jours" },
    { id: 3, name: "photo-equipe.jpg", size: "3.1 MB", type: "image", date: "1 semaine" },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête mobile avec retour */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Détails</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profil principal */}
        <div className="p-6 text-center border-b">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={conversation.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-3xl">{conversation.name[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-2">{conversation.name}</h2>
          {conversation.type === "group" ? (
            <p className="text-gray-500">{conversation.participant_count} membres</p>
          ) : (
            <p className="text-gray-500">Conversation privée</p>
          )}
        </div>

        {/* Actions rapides */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 gap-2 bg-transparent">
              <Phone className="h-5 w-5" />
              Appeler
            </Button>
            <Button variant="outline" className="h-12 gap-2 bg-transparent">
              <Video className="h-5 w-5" />
              Vidéo
            </Button>
          </div>
        </div>

        {/* Membres du groupe (mobile) */}
        {conversation.type === "group" && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Membres</h3>
              <Button variant="ghost" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4">
              {loadingParticipants ? (
                <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : participants.map((member: any) => (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    {member.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.status === 'online' ? "En ligne" : "Hors ligne"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fichiers partagés (mobile) */}
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Fichiers partagés</h3>

          <div className="space-y-3">
            {mockAttachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {attachment.type === "image" ? (
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-sm text-gray-500">
                    {attachment.size} • {attachment.date}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}