"use client"

import { useState } from "react"
import { ArrowLeft, MessageSquare, Bell, Shield, Palette, Info, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MobileSettingsScreenProps {
  onBack: () => void
}

type SettingsSection = "main" | "privacy" | "notifications" | "chat" | "appearance" | "about"

export function MobileSettingsScreen({ onBack }: MobileSettingsScreenProps) {
  const [currentSection, setCurrentSection] = useState<SettingsSection>("main")

  const handleBack = () => {
    if (currentSection === "main") {
      onBack()
    } else {
      setCurrentSection("main")
    }
  }

  const getSectionTitle = () => {
    switch (currentSection) {
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

  const renderMainSettings = () => (
    <div className="space-y-1">
      {/* Confidentialité */}
      <div
        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-colors"
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
        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-colors"
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
        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-colors"
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
        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-colors"
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
        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-colors"
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

  const renderPrivacySettings = () => (
    <div className="space-y-6 p-4">
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
    <div className="space-y-6 p-4">
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
      </div>
    </div>
  )

  const renderChatSettings = () => (
    <div className="space-y-6 p-4">
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
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <h3 className="font-medium">Thème</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-blue-500 rounded-lg p-3 text-center">
            <div className="w-full h-12 bg-white border rounded mb-2"></div>
            <p className="text-sm font-medium">Clair</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-3 text-center active:border-gray-300">
            <div className="w-full h-12 bg-gray-800 rounded mb-2"></div>
            <p className="text-sm font-medium">Sombre</p>
          </div>
          <div className="border-2 border-transparent rounded-lg p-3 text-center active:border-gray-300">
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
                className={`w-10 h-10 ${color} rounded-full border-2 ${
                  index === 0 ? "border-gray-800" : "border-transparent"
                } active:scale-110 transition-transform`}
              />
            ),
          )}
        </div>
      </div>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Messagerie App</h3>
        <p className="text-gray-500">Version 2.1.0</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <Button variant="ghost" className="w-full justify-start h-12">
          Aide et support
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12">
          Conditions d'utilisation
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12">
          Politique de confidentialité
        </Button>
        <Button variant="ghost" className="w-full justify-start h-12">
          Signaler un problème
        </Button>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
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
    <div className="flex flex-col h-full bg-white">
      {/* En-tête mobile */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{getSectionTitle()}</h1>
      </div>

      {/* Contenu avec scroll */}
      <ScrollArea className="flex-1">{renderCurrentSection()}</ScrollArea>
    </div>
  )
}