"use client"

import { Phone, Video, UserPlus, Download, ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessagingStore } from "@/lib/store"

export function ConversationDetails() {
  const { selectedConversation } = useMessagingStore()

  if (!selectedConversation) return null

  const mockMembers = [
    { id: 1, name: "Alice Martin", avatar: "/placeholder.svg?height=32&width=32", isOnline: true },
    { id: 2, name: "Bob Dupont", avatar: "/placeholder.svg?height=32&width=32", isOnline: false },
    { id: 3, name: "Claire Moreau", avatar: "/placeholder.svg?height=32&width=32", isOnline: true },
  ]

  const mockAttachments = [
    { id: 1, name: "presentation.pdf", size: "2.4 MB", type: "pdf", date: "Hier" },
    { id: 2, name: "budget.xlsx", size: "1.2 MB", type: "excel", date: "2 jours" },
    { id: 3, name: "photo-equipe.jpg", size: "3.1 MB", type: "image", date: "1 semaine" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* En-tête fixe */}
      <div className="p-6 border-b border-border text-center bg-card">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
            {selectedConversation.name[0]}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg text-foreground">{selectedConversation.name}</h2>
        {selectedConversation.type === "group" ? (
          <p className="text-sm text-muted-foreground">{selectedConversation.memberCount} membres</p>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${selectedConversation.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm text-muted-foreground">
              {selectedConversation.isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Actions rapides */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent border-input text-foreground hover:bg-muted"
            >
              <Phone className="h-4 w-4" />
              Appeler
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent border-input text-foreground hover:bg-muted"
            >
              <Video className="h-4 w-4" />
              Vidéo
            </Button>
          </div>

          <Separator />

          {/* Membres du groupe */}
          {selectedConversation.type === "group" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Membres</h3>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {mockMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-muted text-muted-foreground">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.isOnline ? "En ligne" : "Hors ligne"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Fichiers partagés */}
          <div>
            <h3 className="font-medium mb-4 text-foreground">Fichiers partagés</h3>

            <div className="space-y-3">
              {mockAttachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {attachment.type === "image" ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.size} • {attachment.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
