"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Edit3, Phone, Mail, MapPin, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessagingStore } from "@/lib/store"

interface MobileUserSettingsScreenProps {
  onBack: () => void
}

export function MobileUserSettingsScreen({ onBack }: MobileUserSettingsScreenProps) {
  const { user, updateUserSettings } = useMessagingStore()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    about: user?.about || "Disponible",
    status: user?.status || "available",
    phone: user?.phone || "",
    email: user?.email || "",
    location: user?.location || "",
    birthday: user?.birthday || "",
    website: user?.website || "",
  })

  const handleSave = () => {
    updateUserSettings(formData)
    onBack()
  }

  const handleAvatarChange = () => {
    // Simuler le changement d'avatar
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("Nouvelle photo sélectionnée:", file.name)
        updateUserSettings({ avatar: URL.createObjectURL(file) })
      }
    }
    input.click()
  }

  const statusOptions = [
    { value: "available", label: "🟢 Disponible", color: "text-green-600" },
    { value: "busy", label: "🔴 Occupé", color: "text-red-600" },
    { value: "away", label: "🟡 Absent", color: "text-yellow-600" },
    { value: "invisible", label: "⚫ Invisible", color: "text-gray-600" },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête mobile */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Mon profil</h1>
        </div>
        <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
          Enregistrer
        </Button>
      </div>

      {/* Contenu avec scroll */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Photo de profil */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={handleAvatarChange}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Appuyez pour changer votre photo</p>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pr-10 h-12"
                  placeholder="Votre nom complet"
                />
                <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* À propos */}
            <div className="space-y-2">
              <Label htmlFor="about">À propos</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="min-h-[80px]"
                placeholder="Parlez-nous de vous..."
              />
              <p className="text-xs text-gray-500">Cette information sera visible par vos contacts.</p>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut de disponibilité</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de contact</h3>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="h-12"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                className="h-12"
              />
            </div>

            {/* Localisation */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ville, Pays"
                className="h-12"
              />
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations supplémentaires</h3>

            {/* Date de naissance */}
            <div className="space-y-2">
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de naissance
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Site web */}
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Site web
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://votre-site.com"
                className="h-12"
              />
            </div>
          </div>

          {/* Espace en bas pour éviter que le contenu soit caché */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>
    </div>
  )
}
