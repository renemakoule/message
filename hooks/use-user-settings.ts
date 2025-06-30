"use client"

import { useState, useEffect } from "react"
import { useMessagingStore } from "@/lib/store"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase"

// Type correct pour une mise à jour partielle du profil utilisateur.
type UserProfile = Database["public"]["Tables"]["users"]["Row"]
type UserProfileUpdate = Partial<UserProfile>

interface UseUserSettingsProps {
    onSuccess?: () => void;
}

export function useUserSettings({ onSuccess }: UseUserSettingsProps) {
    // CORRECTION : On déstructure `currentUser` et on l'aliase en `user`.
    const { currentUser: user, updateUserSettings } = useMessagingStore();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        about: user?.about || "Disponible",
        status: user?.status || "available",
        phone: user?.phone || "",
        email: user?.email || "",
        location: user?.location || "",
        birthday: user?.birthday || "",
        website: user?.website || "",
    });

    // Sync with store if user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                about: user.about || "Disponible",
                status: user.status || "available",
                phone: user.phone || "",
                email: user.email || "",
                location: user.location || "",
                birthday: user.birthday || "",
                website: user.website || "",
            })
        }
    }, [user])


    const handleSave = () => {
        try {
            // formData correspond maintenant au type attendu par updateUserSettings
            updateUserSettings(formData);
            toast.success("Profil mis à jour avec succès !");
            onSuccess?.();
        } catch(error) {
            console.error("Failed to update user settings", error);
            toast.error("Erreur lors de la mise à jour du profil.");
        }
    }

    const handleAvatarChange = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                console.log("Nouvelle photo sélectionnée:", file.name)
                // In a real app, you would upload this file and get a URL
                // For this demo, we use a local object URL
                updateUserSettings({ avatar_url: URL.createObjectURL(file) })
                toast.success("Photo de profil mise à jour.");
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

    return {
        user,
        formData,
        setFormData,
        handleSave,
        handleAvatarChange,
        statusOptions,
    }
}