"use client"

import { useState } from "react"
import { X, User, Camera, Edit3, Phone, Mail, MapPin, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMessagingStore } from "@/lib/store"

interface UserSettingsModalProps {
  onClose: () => void
}

export function UserSettingsModal({ onClose }: UserSettingsModalProps) {
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
    onClose()
  }

  const handleAvatarChange = () => {
    // Simuler le changement d'avatar
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Ici vous pourriez uploader l'image
        console.log("Nouvelle photo sélectionnée:", file.name)
        // Pour la démo, on simule juste le changement
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Paramètres du profil</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Photo de profil */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-3xl">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                onClick={handleAvatarChange}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Cliquez sur l'icône pour changer votre photo</p>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </h3>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pr-10"
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
                <SelectTrigger>
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
              />
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  )
}
