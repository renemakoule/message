"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Bell, X, MessageCircle, Users, Check, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"
import type { Database } from "@/lib/supabase"

type Conversation = Database["public"]["Functions"]["get_conversations_with_last_message"]["Returns"][0]
type Notification = Database["public"]["Tables"]["notifications"]["Row"]

interface EnhancedNotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void
}

export function EnhancedNotificationSystem({ onNotificationClick }: EnhancedNotificationSystemProps = {}) {
  const {
    notifications,
    setSelectedConversation,
    markNotificationAsRead,
    clearAllNotifications,
    currentUser,
  } = useMessagingStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [currentToast, setCurrentToast] = useState<Notification | null>(null)

  // Demander la permission pour les notifications
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasPermission(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === "granted")
        })
      }
    }
  }, [])

  // Notifications du navigateur pour les nouvelles notifications
  useEffect(() => {
    const latestNotification = notifications[0]
    if (latestNotification && !latestNotification.read && hasPermission && document.hidden) {
      new Notification(latestNotification.title, {
        body: latestNotification.message,
        icon: "/placeholder.svg",
        tag: latestNotification.id,
      })
    }
  }, [notifications, hasPermission])

  // Toast notifications pour les nouveaux messages
  useEffect(() => {
    const latestNotification = notifications[0]
    if (latestNotification && !latestNotification.read && latestNotification.type === "message") {
      setCurrentToast(latestNotification)
      setShowToast(true)
      
      // Auto-hide après 5 secondes
      const timer = setTimeout(() => {
        setShowToast(false)
        markNotificationAsRead(latestNotification.id)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notifications, markNotificationAsRead])

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id)

    // Navigation mobile
    if (onNotificationClick) {
      onNotificationClick(notification)
      setShowNotifications(false)
      return
    }

    // Navigation desktop
    if (notification.data && (notification.data as any).conversation_id) {
      const convId = (notification.data as any).conversation_id
      // Pour l'instant, on ne gère pas la navigation vers la conversation
      // car nous n'avons pas accès aux conversations ici
        setShowNotifications(false)
      }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />
      case "invitation_received":
        return <Users className="h-4 w-4" />
      case "invitation_accepted":
        return <Check className="h-4 w-4 text-green-600" />
      case "invitation_declined":
        return <UserX className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const timeAgo = (date: Date | string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${Math.floor(hours / 24)}j`
  }

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearAllNotifications()
  }

  // Si pas d'utilisateur connecté, ne pas afficher le composant
  if (!currentUser) {
    return null
  }

  return (
    <>
      {/* Bouton de notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Panel des notifications */}
        {showNotifications && (
          <div className="absolute top-12 right-0 w-96 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        notifications.forEach((n) => {
                          if (!n.read) markNotificationAsRead(n.id)
                        })
                      }}
                    >
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleClearAllNotifications}>
                    Effacer tout
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{notification.title}</p>
                            <span className="text-xs text-gray-500">{timeAgo(notification.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour fermer */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}

      {/* Toast notification pour nouveaux messages */}
      {showToast && currentToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
    <div
            className="bg-white border rounded-lg shadow-lg p-4 w-80 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => {
              handleNotificationClick(currentToast)
              setShowToast(false)
            }}
    >
      <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-600" />
          </div>

        <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{currentToast.title}</p>
                <p className="text-sm text-gray-600">{currentToast.message}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
                  setShowToast(false)
                  markNotificationAsRead(currentToast.id)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
        </div>
      )}
    </>
  )
}