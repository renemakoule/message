"use client"

import { useState, useEffect } from "react"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { ConversationDetails } from "@/components/conversation-details"
import { NewConversationModal } from "@/components/new-conversation-modal"
import { MobileLayout } from "@/components/mobile-layout"
import { useMessagingStore } from "@/lib/store"

export function MessagingInterface() {
  const { selectedConversation } = useMessagingStore()
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Version mobile
  if (isMobile) {
    return <MobileLayout />
  }

  // Version desktop (3 colonnes)
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Colonne de gauche - Liste des conversations */}
      <div className="w-80 border-r bg-white flex-shrink-0">
        <ConversationList onNewConversation={() => setShowNewConversation(true)} />
      </div>

      {/* Colonne centrale - Fenêtre de discussion */}
      <div className="flex-1 min-w-0">
        <ChatWindow />
      </div>

      {/* Colonne de droite - Détails de la conversation */}
      {selectedConversation && (
        <div className="w-80 border-l bg-white flex-shrink-0">
          <ConversationDetails />
        </div>
      )}

      {/* Modales */}
      {showNewConversation && <NewConversationModal onClose={() => setShowNewConversation(false)} />}
    </div>
  )
}
