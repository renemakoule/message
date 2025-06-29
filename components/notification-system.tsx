"use client"

import { useEffect, useState } from "react"
import { Bell, X, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"

interface Notification {
  id: string
  type: "message" | "call" | "system"
  title: string
  message: string
  avatar?: string
  timestamp: Date
  conversationId?: string
  isRead: boolean
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationSystem({ onNotificationClick }: NotificationSystemProps = {}) {
  const { conversations, messages, currentCall, setSelectedConversation } = useMessagingStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [notificationSound] = useState(new Audio("/notification.mp3"))

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

  // Écouter les nouveaux messages
  useEffect(() => {
    const allMessages = Object.values(messages).flat()
    const latestMessage = allMessages[allMessages.length - 1]

    if (latestMessage && latestMessage.senderId !== "current-user") {
      const conversation = conversations.find((c) => messages[c.id]?.some((m) => m.id === latestMessage.id))

      if (conversation) {
        addNotification({
          type: "message",
          title: conversation.name,
          message: latestMessage.content,
          avatar: conversation.avatar,
          conversationId: conversation.id,
        })

        // Notification du navigateur
        if (hasPermission && document.hidden) {
          new Notification(conversation.name, {
            body: latestMessage.content,
            icon: conversation.avatar || "/placeholder.svg",
            tag: conversation.id,
          })
        }

        // Son de notification
        playNotificationSound()
      }
    }
  }, [messages, conversations, hasPermission])

  // Écouter les appels entrants
  useEffect(() => {
    if (currentCall && currentCall.status === "ringing") {
      addNotification({
        type: "call",
        title: "Appel entrant",
        message: `${currentCall.participant.name} vous appelle`,
        avatar: currentCall.participant.avatar,
      })

      // Notification du navigateur pour appel
      if (hasPermission) {
        new Notification("Appel entrant", {
          body: `${currentCall.participant.name} vous appelle`,
          icon: currentCall.participant.avatar || "/placeholder.svg",
          tag: "incoming-call",
          requireInteraction: true,
        })
      }

      // Son d'appel (différent du message)
      playCallSound()
    }
  }, [currentCall, hasPermission])

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp" | "isRead">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]) // Garder max 10 notifications
  }

  const playNotificationSound = () => {
    try {
      notificationSound.currentTime = 0
      notificationSound.play().catch(() => {
        // Ignore les erreurs de lecture audio
      })
    } catch (error) {
      // Ignore les erreurs
    }
  }

  const playCallSound = () => {
    // Son d'appel plus long et répétitif
    try {
      const callSound = new Audio("/ringtone.mp3")
      callSound.loop = true
      callSound.play().catch(() => {})
    } catch (error) {
      // Ignore les erreurs
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    markAsRead(notification.id)

    // Si on a une fonction de navigation mobile, l'utiliser
    if (onNotificationClick) {
      onNotificationClick(notification)
      setShowNotifications(false)
      return
    }

    // Sinon, comportement desktop par défaut
    if (notification.type === "message" && notification.conversationId) {
      const conversation = conversations.find((c) => c.id === notification.conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        setShowNotifications(false)
      }
    } else if (notification.type === "call") {
      setShowNotifications(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
          <div className="absolute top-12 right-0 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onRemove={() => removeNotification(notification.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay pour fermer */}
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}

      {/* Notifications toast en temps réel */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications
          .filter((n) => !n.isRead)
          .slice(0, 3)
          .map((notification) => (
            <ToastNotification
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
      </div>
    </>
  )
}

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  onRemove: () => void
}

function NotificationItem({ notification, onClick, onRemove }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "message":
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${Math.floor(hours / 24)}j`
  }

  return (
    <div
      className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
        !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {notification.avatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.avatar || "/placeholder.svg"} />
            <AvatarFallback>{notification.title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{getIcon()}</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{notification.title}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.timestamp)}</p>
        </div>
      </div>
    </div>
  )
}

interface ToastNotificationProps {
  notification: Notification
  onClick: () => void
  onClose: () => void
}

function ToastNotification({ notification, onClick, onClose }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000) // Auto-close après 5 secondes
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="bg-background border rounded-lg shadow-lg p-4 w-80 animate-in slide-in-from-right cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {notification.avatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.avatar || "/placeholder.svg"} />
            <AvatarFallback>{notification.title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {notification.type === "call" ? <Phone className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
