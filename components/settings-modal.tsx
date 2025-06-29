"use client"

import { useState } from "react"
import { X, User, MessageSquare, Bell, Shield, Palette, Info, ChevronRight, Camera, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMessagingStore } from "@/lib/store"

interface SettingsModalProps {
  onClose: () => void
}

type SettingsSection = "main" | "profile" | "privacy" | "notifications" | "chat" | "appearance" | "about"

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, updateUserSettings } = useMessagingStore()
  const [currentSection, setCurrentSection] = useState<SettingsSection>("main")
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    status: user?.status || "",
    about: user?.about || "Disponible",
  })

  const renderMainSettings = () => (
    <div className="space-y-1">
      {/* Profil */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("profile")}
      >
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Profil</h3>
          <p className="text-sm text-gray-500">Nom, photo, statut</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Confidentialité */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("privacy")}
      >
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Confidentialité</h3>
          <p className="text-sm text-gray-500">Blocage, dernière connexion</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Notifications */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("notifications")}
      >
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-gray-500">Sons, vibrations</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Discussions */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("chat")}
      >
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Discussions</h3>
          <p className="text-sm text-gray-500">Sauvegarde, historique</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Apparence */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("appearance")}
      >
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <Palette className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Apparence</h3>
          <p className="text-sm text-gray-500">Thème, police</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <Separator className="my-4" />

      {/* À propos */}
      <div
        className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={() => setCurrentSection("about")}
      >
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Info className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">À propos</h3>
          <p className="text-sm text-gray-500">Version, aide</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Photo de profil */}
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Appuyez pour changer la photo</p>
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <div className="relative">
          <Input
            id="name"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="pr-10"
          />
          <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500">
          Ce nom sera visible par vos contacts et les personnes avec qui vous discutez.
        </p>
      </div>

      {/* À propos */}
      <div className="space-y-2">
        <Label htmlFor="about">À propos</Label>
        <div className="relative">
          <Textarea
            id="about"
            value={profileData.about}
            onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
            className="pr-10 min-h-[80px]"
            placeholder="Ajoutez quelques mots sur vous..."
          />
          <Edit3 className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Statut */}
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={profileData.status} onValueChange={(value) => setProfileData({ ...profileData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">🟢 Disponible</SelectItem>
            <SelectItem value="busy">🔴 Occupé</SelectItem>
            <SelectItem value="away">🟡 Absent</SelectItem>
            <SelectItem value="invisible">⚫ Invisible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => updateUserSettings(profileData)} className="w-full">
        Enregistrer les modifications
      </Button>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Qui peut voir mes informations</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dernière connexion</p>
              <p className="text-sm text-gray-500">Qui peut voir quand vous étiez en ligne</p>
            </div>
            <Select defaultValue="contacts">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Tout le monde</SelectItem>
                <SelectItem value="contacts">Mes contacts</SelectItem>
                <SelectItem value="nobody">Personne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Photo de profil</p>
              <p className="text-sm text-gray-500">Qui peut voir votre photo</p>
            </div>
            <Select defaultValue="contacts">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Tout le monde</SelectItem>
                <SelectItem value="contacts">Mes contacts</SelectItem>
                <SelectItem value="nobody">Personne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">À propos</p>
              <p className="text-sm text-gray-500">Qui peut voir votre statut</p>
            </div>
            <Select defaultValue="contacts">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Tout le monde</SelectItem>
                <SelectItem value="contacts">Mes contacts</SelectItem>
                <SelectItem value="nobody">Personne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Messages</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Confirmations de lecture</p>
            <p className="text-sm text-gray-500">Envoyer et recevoir les accusés de lecture</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Groupes</p>
            <p className="text-sm text-gray-500">Qui peut vous ajouter aux groupes</p>
          </div>
          <Select defaultValue="contacts">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Tout le monde</SelectItem>
              <SelectItem value="contacts">Mes contacts</SelectItem>
              <SelectItem value="nobody">Personne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Contacts bloqués</h3>
        <Button variant="outline" className="w-full bg-transparent">
          Gérer les contacts bloqués
        </Button>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Notifications de messages</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-gray-500">Afficher les notifications</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Son</p>
            <p className="text-sm text-gray-500">Son de notification</p>
          </div>
          <Select defaultValue="default">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="bell">Cloche</SelectItem>
              <SelectItem value="chime">Carillon</SelectItem>
              <SelectItem value="none">Aucun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Vibration</p>
            <p className="text-sm text-gray-500">Vibrer lors des notifications</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Aperçu</p>
            <p className="text-sm text-gray-500">Afficher l'aperçu du message</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Notifications de groupe</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-gray-500">Afficher les notifications de groupe</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mentions uniquement</p>
            <p className="text-sm text-gray-500">Notifier seulement quand vous êtes mentionné</p>
          </div>
          <Switch />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Notifications d'appel</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sonnerie</p>
            <p className="text-sm text-gray-500">Son pour les appels entrants</p>
          </div>
          <Select defaultValue="default">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="classic">Classique</SelectItem>
              <SelectItem value="modern">Moderne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderChatSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Affichage</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Taille de police</p>
            <p className="text-sm text-gray-500">Taille du texte dans les discussions</p>
          </div>
          <Select defaultValue="medium">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petite</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Aperçu des liens</p>
            <p className="text-sm text-gray-500">Générer un aperçu pour les liens</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Entrée pour envoyer</p>
            <p className="text-sm text-gray-500">Envoyer avec la touche Entrée</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Médias</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Téléchargement automatique</p>
            <p className="text-sm text-gray-500">Télécharger automatiquement les médias</p>
          </div>
          <Select defaultValue="wifi">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Jamais</SelectItem>
              <SelectItem value="wifi">Wi-Fi uniquement</SelectItem>
              <SelectItem value="always">Toujours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Qualité d'upload</p>
            <p className="text-sm text-gray-500">Qualité des photos envoyées</p>
          </div>
          <Select defaultValue="auto">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automatique</SelectItem>
              <SelectItem value="best">Meilleure</SelectItem>
              <SelectItem value="data">Économie de données</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Sauvegarde</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sauvegarde automatique</p>
            <p className="text-sm text-gray-500">Sauvegarder les discussions</p>
          </div>
          <Switch defaultChecked />
        </div>

        <Button variant="outline" className="w-full bg-transparent">
          Exporter les discussions
        </Button>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Thème</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-blue-500 rounded-lg p-3 text-center cursor-pointer">
            <div className="w-full h-12 bg-white border rounded mb-2"></div>
            <p className="text-sm font-medium">Clair</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-3 text-center cursor-pointer hover:border-gray-300">
            <div className="w-full h-12 bg-gray-800 rounded mb-2"></div>
            <p className="text-sm font-medium">Sombre</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-3 text-center cursor-pointer hover:border-gray-300">
            <div className="w-full h-12 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
            <p className="text-sm font-medium">Auto</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Couleur d'accent</h3>

        <div className="grid grid-cols-6 gap-3">
          {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-red-500"].map(
            (color, index) => (
              <div
                key={index}
                className={`w-10 h-10 ${color} rounded-full cursor-pointer border-2 ${
                  index === 0 ? "border-gray-800" : "border-transparent"
                } hover:scale-110 transition-transform`}
              />
            ),
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Arrière-plan de chat</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-transparent rounded-lg p-2 cursor-pointer hover:border-gray-300">
            <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
            <p className="text-xs text-center">Par défaut</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-2 cursor-pointer hover:border-gray-300">
            <div className="w-full h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2"></div>
            <p className="text-xs text-center">Dégradé</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-2 cursor-pointer hover:border-gray-300">
            <div className="w-full h-16 bg-green-50 rounded mb-2 flex items-center justify-center">
              <span className="text-xs">+</span>
            </div>
            <p className="text-xs text-center">Personnalisé</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Messagerie App</h3>
        <p className="text-gray-500">Version 2.1.0</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <Button variant="ghost" className="w-full justify-start">
          Aide et support
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Conditions d'utilisation
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Politique de confidentialité
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          Signaler un problème
        </Button>
      </div>

      <Separator />

      <div className="text-center text-sm text-gray-500">
        <p>© 2024 Messagerie App</p>
        <p>Tous droits réservés</p>
      </div>
    </div>
  )

  const getSectionTitle = () => {
    switch (currentSection) {
      case "profile":
        return "Profil"
      case "privacy":
        return "Confidentialité"
      case "notifications":
        return "Notifications"
      case "chat":
        return "Discussions"
      case "appearance":
        return "Apparence"
      case "about":
        return "À propos"
      default:
        return "Paramètres"
    }
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "profile":
        return renderProfileSettings()
      case "privacy":
        return renderPrivacySettings()
      case "notifications":
        return renderNotificationSettings()
      case "chat":
        return renderChatSettings()
      case "appearance":
        return renderAppearanceSettings()
      case "about":
        return renderAboutSettings()
      default:
        return renderMainSettings()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {currentSection !== "main" && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentSection("main")}>
                ←
              </Button>
            )}
            <h2 className="text-lg font-semibold">{getSectionTitle()}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{renderCurrentSection()}</div>
      </div>
    </div>
  )
}
