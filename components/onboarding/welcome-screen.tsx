"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Plus, Search } from "lucide-react"
import { useMessagingStore } from "@/lib/store"
import { UserSelectionModal } from "@/components/onboarding/user-selection-modal"
import { GroupCreationModal } from "@/components/onboarding/group-creation-modal"
import { PublicGroupsModal } from "@/components/onboarding/public-groups-modal"

// Le composant reçoit maintenant le callback
export function WelcomeScreen({ onConversationCreated }: { onConversationCreated: () => void }) {
  const { currentUser } = useMessagingStore()
  const [showUserSelection, setShowUserSelection] = useState(false)
  const [showGroupCreation, setShowGroupCreation] = useState(false)
  const [showPublicGroups, setShowPublicGroups] = useState(false)

  if (!currentUser) return null;
  
  // Wrapper pour fermer la modale APRÈS que le parent a rafraîchi
  const handleConversationCreated = () => {
    onConversationCreated();
    setShowUserSelection(false);
    setShowGroupCreation(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Message de bienvenue */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue {currentUser.name} ! 👋</h1>
          <p className="text-xl text-gray-600 mb-2">Commencez à échanger avec vos contacts</p>
          <p className="text-gray-500">Choisissez une option ci-dessous pour démarrer votre première conversation</p>
        </div>

        {/* Options principales */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Conversation privée */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Conversation privée</CardTitle>
              <CardDescription>Discutez en privé avec un autre utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowUserSelection(true)} className="w-full h-12">
                <Plus className="h-5 w-5 mr-2" />
                Démarrer une discussion
              </Button>
            </CardContent>
          </Card>

          {/* Groupe */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Conversation de groupe</CardTitle>
              <CardDescription>Créez un groupe ou rejoignez un groupe existant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setShowGroupCreation(true)} className="w-full" variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
              <Button onClick={() => setShowPublicGroups(true)} className="w-full" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Rejoindre un groupe
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Guide rapide */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">💡</span>
              </div>
              Comment ça marche ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p className="font-medium">Choisissez</p>
                <p className="text-gray-600">Sélectionnez un utilisateur ou créez un groupe</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <p className="font-medium">Invitez</p>
                <p className="text-gray-600">Envoyez une invitation à discuter</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <p className="font-medium">Discutez</p>
                <p className="text-gray-600">Commencez votre conversation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modales */}
        {showUserSelection && <UserSelectionModal onClose={() => setShowUserSelection(false)} onConversationCreated={handleConversationCreated} />}
        {showGroupCreation && <GroupCreationModal onClose={() => setShowGroupCreation(false)} />}
        {showPublicGroups && <PublicGroupsModal onClose={() => setShowPublicGroups(false)} />}
      </div>
    </div>
  )
}