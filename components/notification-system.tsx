"use client"

import React, { useState } from "react"
import { Bell, X, MessageCircle, Phone, Check, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMessagingStore } from "@/lib/store"
import { useInvitations } from "@/hooks/use-invitations"
import { useConversations } from "@/hooks/use-conversations"
import type { Database } from "@/lib/supabase"

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationSystem({ onNotificationClick }: NotificationSystemProps = {}) {
  const { 
    currentUser,
    setSelectedConversation,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useMessagingStore();
  
  const { conversations, refetch: refetchConversations } = useConversations(currentUser?.id);
  const { invitations, acceptInvitation, declineInvitation, refetch: refetchInvitations } = useInvitations(currentUser?.id);

  const [showNotifications, setShowNotifications] = useState(false);
  
  const handleAccept = async (e: React.MouseEvent, invitationId: string) => {
    e.stopPropagation();
    await acceptInvitation(invitationId);
    await refetchInvitations();
    await refetchConversations();
    setShowNotifications(false);
  };
  
  const handleDecline = async (e: React.MouseEvent, invitationId: string) => {
    e.stopPropagation();
    await declineInvitation(invitationId);
    await refetchInvitations();
    setShowNotifications(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.data && (notification.data as any).conversation_id) {
      const convId = (notification.data as any).conversation_id;
      const conversation = conversations.find((c) => c.id === convId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
        setShowNotifications(false);
  };

  const allDisplayItems = [
    ...notifications.map(n => ({...n, itemType: 'notification'})),
    ...invitations.map(i => ({...i, itemType: 'invitation'}))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.read).length + invitations.length;

  return (
    <>
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {showNotifications && (
          <div className="absolute top-12 right-0 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
              <Button variant="link" size="sm" onClick={clearAllNotifications} className="p-0 h-auto">Tout effacer</Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {allDisplayItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>Rien de nouveau.</p></div>
              ) : (
                allDisplayItems.map((item) => (
                    item.itemType === 'notification' ?
                    <NotificationItem key={item.id} notification={item as Notification} onClick={() => handleNotificationClick(item as Notification)} /> :
                    <InvitationItem key={item.id} invitation={item as any} onAccept={(e) => handleAccept(e, item.id)} onDecline={(e) => handleDecline(e, item.id)} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </>
  )
}

function timeAgo(date: Date | string) {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
  };

function NotificationItem({ notification, onClick }: { notification: Notification, onClick: () => void }) {
  return (
        <div className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${!notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`} onClick={onClick}>
      <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><MessageCircle className="h-4 w-4 text-blue-600"/></div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{notification.title}</p>
              <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
            </div>
          </div>
        </div>
    );
}

function InvitationItem({ invitation, onAccept, onDecline }: { invitation: any, onAccept: (e: React.MouseEvent) => void, onDecline: (e: React.MouseEvent) => void }) {
    return (
        <div className="p-3 border-b bg-amber-50 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8"><AvatarImage src={invitation.from_user.avatar_url} /><AvatarFallback>{invitation.from_user.name[0]}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Invitation de {invitation.from_user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{invitation.conversation.type === 'group' ? `Rejoindre "${invitation.conversation.name}"` : "Démarrer une conversation"}</p>
             <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={onAccept} className="h-7 px-3 text-xs"><Check className="h-3 w-3 mr-1" />Accepter</Button>
                <Button size="sm" variant="outline" onClick={onDecline} className="h-7 px-3 text-xs"><UserX className="h-3 w-3 mr-1" />Refuser</Button>
             </div>
        </div>
      </div>
    </div>
    );
}

