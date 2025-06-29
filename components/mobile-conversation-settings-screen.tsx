"use client"

import { useState } from "react"
import { ArrowLeft, Users, Bell, Trash2, LogOut, Edit3, Camera, UserMinus, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MobileConversationSettingsScreenProps {
  conversation: any
  onBack: () => void
}

type SettingsSection = "main" | "members" | "notifications"

export function MobileConversationSettingsScreen({ conversation, onBack }: MobileConversationSettingsScreenProps) {
  const [currentSection, setCurrentSection] = useState<SettingsSection>("main")
  const [groupName, setGroupName] = useState(conversation.name)

  const mockMembers = [
    { id: "1", name: "Alice Martin", avatar: "/placeholder.svg", isOnline: true, role: "admin" },
    { id: "2", name: "Bob Dupont", avatar: "/placeholder.svg", isOnline: false, role: "member" },
    { id: "3", name: "Claire Moreau", avatar: "/placeholder.svg", isOnline: true, role: "member" },
    { id: "4", name: "David Leroy", avatar: "/placeholder.svg", isOnline: true, role: "member" },
  ]

  const handleBack = () => {
    if (currentSection === "main") {
      onBack()
    } else {
      setCurrentSection("main")
    }
  }

  const getSectionTitle = () => {
    switch (currentSection) {
      case "members":
        return "Membres"
      case "notifications":
        return "Notifications"
      default:
        return conversation.type === "group" ? "Paramètres du groupe" : "Paramètres de la conversation"
    }
  }

  const renderMainSettings = () => {
    if (conversation.type === "group") {
      return (
        <div className="space-y-6 p-4">
          {/* Info du groupe */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-20 w-20">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{conversation.name[0]}</AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Nom du groupe */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Nom du groupe</Label>
            <div className="relative">
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="pr-10 h-12"
              />
              <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Actions rapides */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setCurrentSection("members")}
            >
              <Users className="h-5 w-5" />
              Membres du groupe ({mockMembers.length})
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setCurrentSection("notifications")}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Button>
          </div>

          <Separator />

          {/* Paramètres du groupe */}
          <div className="space-y-4">
            <h3 className="font-medium">Paramètres du groupe</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Envoyer des messages</p>
                <p className="text-sm text-gray-500">Qui peut envoyer des messages</p>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="admins">Admins uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modifier les infos du groupe</p>
                <p className="text-sm text-gray-500">Qui peut modifier le nom et la photo</p>
              </div>
              <Select defaultValue="admins">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="admins">Admins uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Actions dangereuses */}
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 h-12">
                  <LogOut className="h-5 w-5" />
                  Quitter le groupe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Quitter le groupe ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous ne recevrez plus de messages de ce groupe. Vous pourrez être ajouté à nouveau par un membre.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">Quitter</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 h-12">
                  <Trash2 className="h-5 w-5" />
                  Supprimer le groupe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Tous les messages et médias seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )
    } else {
      // Conversation privée
      return (
        <div className="space-y-6 p-4">
          {/* Info du contact */}
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{conversation.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{conversation.name}</h3>
            <p className="text-gray-500">{conversation.isOnline ? "En ligne" : "Hors ligne"}</p>
          </div>

          {/* Actions rapides */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setCurrentSection("notifications")}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Button>
          </div>

          <Separator />

          {/* Paramètres de la conversation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Messages éphémères</p>
                <p className="text-sm text-gray-500">Les messages disparaissent automatiquement</p>
              </div>
              <Select defaultValue="off">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Désactivé</SelectItem>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chiffrement de bout en bout</p>
                <p className="text-sm text-gray-500">Vos messages sont sécurisés</p>
              </div>
              <div className="text-green-600 text-sm font-medium">Activé</div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 h-12">
              <UserMinus className="h-5 w-5" />
              Bloquer le contact
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 h-12">
                  <Trash2 className="h-5 w-5" />
                  Supprimer la conversation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tous les messages de cette conversation seront supprimés. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )
    }
  }

  const renderMembersSettings = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Membres ({mockMembers.length})</h3>
        <Button size="sm">Ajouter</Button>
      </div>

      <div className="space-y-3">
        {mockMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{member.name}</p>
                {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-gray-500">
                {member.role === "admin" ? "Administrateur" : "Membre"} • {member.isOnline ? "En ligne" : "Hors ligne"}
              </p>
            </div>

            <Select defaultValue={member.role}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="remove" className="text-red-600">
                  Retirer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <h3 className="font-medium">Notifications</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-gray-500">Recevoir les notifications de cette conversation</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Son personnalisé</p>
            <p className="text-sm text-gray-500">Son spécifique pour cette conversation</p>
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

        {conversation.type === "group" && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mentions uniquement</p>
              <p className="text-sm text-gray-500">Notifier seulement quand vous êtes mentionné</p>
            </div>
            <Switch />
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Mode silencieux</h3>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" size="sm" className="h-12 bg-transparent">
            1 heure
          </Button>
          <Button variant="outline" size="sm" className="h-12 bg-transparent">
            8 heures
          </Button>
          <Button variant="outline" size="sm" className="h-12 bg-transparent">
            1 semaine
          </Button>
        </div>

        <Button variant="outline" className="w-full bg-transparent h-12">
          Jusqu'à ce que je réactive
        </Button>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "members":
        return renderMembersSettings()
      case "notifications":
        return renderNotificationSettings()
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
