"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Bell, X, MessageCircle, Users, Check, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"

interface EnhancedNotificationSystemProps {
  onNotificationClick?: (notification: any) => void
}

export function EnhancedNotificationSystem({ onNotificationClick }: EnhancedNotificationSystemProps = {}) {
  const {
    notifications,
    invitations,
    setSelectedConversation,
    conversations,
    acceptInvitation,
    declineInvitation,
    markNotificationAsRead,
    clearAllNotifications,
  } = useMessagingStore()

  const [showNotifications, setShowNotifications] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

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
    if (latestNotification && !latestNotification.isRead && hasPermission && document.hidden) {
      new Notification(latestNotification.title, {
        body: latestNotification.message,
        icon: latestNotification.avatar || "/placeholder.svg",
        tag: latestNotification.id,
      })
    }
  }, [notifications, hasPermission])

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id)

    // Navigation mobile
    if (onNotificationClick) {
      onNotificationClick(notification)
      setShowNotifications(false)
      return
    }

    // Navigation desktop
    if (notification.conversationId) {
      const conversation = conversations.find((c) => c.id === notification.conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        setShowNotifications(false)
      }
    }
  }

  const handleAcceptInvitation = (invitationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    acceptInvitation(invitationId)
  }

  const handleDeclineInvitation = (invitationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    declineInvitation(invitationId)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const pendingInvitations = invitations.filter((i) => i.status === "pending")

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
                          if (!n.isRead) markNotificationAsRead(n.id)
                        })
                      }}
                    >
                      Tout marquer comme lu
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
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
                        !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {notification.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{notification.title[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{notification.title}</p>
                            <span className="text-xs text-gray-500">{timeAgo(notification.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{notification.message}</p>

                          {/* Actions pour les invitations */}
                          {notification.type === "invitation_received" && notification.invitationId && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => handleAcceptInvitation(notification.invitationId!, e)}
                                className="h-7 px-3 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleDeclineInvitation(notification.invitationId!, e)}
                                className="h-7 px-3 text-xs"
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          )}
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
              onClose={() => markNotificationAsRead(notification.id)}
            />
          ))}
      </div>
    </>
  )
}

interface ToastNotificationProps {
  notification: any
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
      className="bg-white border rounded-lg shadow-lg p-4 w-80 animate-in slide-in-from-right cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {notification.avatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.avatar || "/placeholder.svg"} />
            <AvatarFallback>{notification.title[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
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
