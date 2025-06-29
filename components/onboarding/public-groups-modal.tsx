"use client"

import { useState } from "react"
import { X, Search, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMessagingStore } from "@/lib/store"

interface PublicGroupsModalProps {
  onClose: () => void
}

export function PublicGroupsModal({ onClose }: PublicGroupsModalProps) {
  const { joinPublicGroup } = useMessagingStore()
  const [searchQuery, setSearchQuery] = useState("")

  // Groupes publics simulés
  const publicGroups = [
    {
      id: "group1",
      name: "Développeurs JavaScript",
      description: "Communauté de développeurs JS pour partager des astuces et projets",
      memberCount: 156,
      avatar: "/placeholder.svg?height=40&width=40",
      isPublic: true,
      category: "Tech",
    },
    {
      id: "group2",
      name: "Photographes Amateurs",
      description: "Partagez vos photos et recevez des conseils de la communauté",
      memberCount: 89,
      avatar: "/placeholder.svg?height=40&width=40",
      isPublic: true,
      category: "Art",
    },
    {
      id: "group3",
      name: "Cuisine du Monde",
      description: "Recettes, astuces culinaires et découvertes gastronomiques",
      memberCount: 234,
      avatar: "/placeholder.svg?height=40&width=40",
      isPublic: true,
      category: "Lifestyle",
    },
    {
      id: "group4",
      name: "Fitness & Bien-être",
      description: "Motivation, conseils fitness et partage d'expériences sportives",
      memberCount: 178,
      avatar: "/placeholder.svg?height=40&width=40",
      isPublic: true,
      category: "Sport",
    },
    {
      id: "group5",
      name: "Voyageurs",
      description: "Conseils de voyage, bons plans et récits d'aventures",
      memberCount: 312,
      avatar: "/placeholder.svg?height=40&width=40",
      isPublic: true,
      category: "Voyage",
    },
  ]

  const filteredGroups = publicGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleJoinGroup = (groupId: string) => {
    joinPublicGroup(groupId)
    onClose()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: "bg-blue-100 text-blue-700",
      Art: "bg-purple-100 text-purple-700",
      Lifestyle: "bg-green-100 text-green-700",
      Sport: "bg-orange-100 text-orange-700",
      Voyage: "bg-indigo-100 text-indigo-700",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Groupes publics</h2>
            <p className="text-gray-600 text-sm">Découvrez et rejoignez des communautés</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des groupes par nom, description ou catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Liste des groupes */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Aucun groupe trouvé</h3>
              <p className="text-gray-600">Essayez de modifier votre recherche</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={group.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{group.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <Globe className="h-4 w-4 text-green-500" title="Groupe public" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className={getCategoryColor(group.category)}>
                            {group.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => handleJoinGroup(group.id)} size="sm" className="flex-shrink-0">
                        Rejoindre
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredGroups.length} groupe{filteredGroups.length > 1 ? "s" : ""} disponible
              {filteredGroups.length > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span>Groupes publics ouverts à tous</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
