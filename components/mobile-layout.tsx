"use client"

import { useState } from "react"
import { useMessagingStore } from "@/lib/store"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { MobileConversationDetails } from "@/components/mobile-conversation-details"
import { MobileNewConversation } from "@/components/mobile-new-conversation"
import { CallInterface } from "@/components/call-interface"
import { MobileSettingsScreen } from "@/components/mobile-settings-screen"
import { MobileUserSettingsScreen } from "@/components/mobile-user-settings-screen"
import { MobileConversationSettingsScreen } from "@/components/mobile-conversation-settings-screen"
import { useConversations } from "@/hooks/use-conversations"

type MobileScreen =
  | "conversations"
  | "chat"
  | "details"
  | "new-conversation"
  | "settings"
  | "user-settings"
  | "conversation-settings"

export function MobileLayout() {
  const { currentUser, selectedConversation, setSelectedConversation, isCallActive } = useMessagingStore()
  
  // CORRECTION: On ne récupère que la fonction `refetch` du hook.
  // La liste des conversations est maintenant lue par les composants enfants (comme ConversationList) directement depuis le store.
  const { refetch } = useConversations(currentUser?.id);

  const [currentScreen, setCurrentScreen] = useState<MobileScreen>("conversations")

  const navigateToChat = (conversation: any) => {
    setSelectedConversation(conversation)
    setCurrentScreen("chat")
  }

  const navigateToDetails = () => setCurrentScreen("details");
  const navigateToNewConversation = () => setCurrentScreen("new-conversation");
  const navigateToSettings = () => setCurrentScreen("settings");
  const navigateToUserSettings = () => setCurrentScreen("user-settings");
  const navigateToConversationSettings = () => setCurrentScreen("conversation-settings");

  const navigateBack = () => {
    switch (currentScreen) {
      case "chat":
        setSelectedConversation(null);
        setCurrentScreen("conversations");
        break;
      case "details":
        setCurrentScreen("chat");
        break;
      case "new-conversation":
      case "settings":
      case "user-settings":
        setCurrentScreen("conversations");
        break;
      case "conversation-settings":
        setCurrentScreen("chat");
        break;
      default:
        setCurrentScreen("conversations");
    }
  }
  
  const handleConversationCreated = () => {
      refetch();
      setCurrentScreen("conversations");
  }

  if (isCallActive) {
    return <CallInterface />
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {currentScreen === "conversations" && (
        <ConversationList/>
      )}
      {currentScreen === "chat" && selectedConversation && (
        <ChatWindow />
      )}
      {currentScreen === "details" && selectedConversation && (
        <MobileConversationDetails conversation={selectedConversation} onBack={navigateBack} />
      )}
      {currentScreen === "new-conversation" && <MobileNewConversation onBack={navigateBack} onConversationCreated={handleConversationCreated}/>}
      {currentScreen === "settings" && <MobileSettingsScreen onBack={navigateBack} />}
      {currentScreen === "user-settings" && <MobileUserSettingsScreen onBack={navigateBack} />}
      {currentScreen === "conversation-settings" && selectedConversation && (
        <MobileConversationSettingsScreen conversation={selectedConversation} onBack={navigateBack} />
      )}
    </div>
  )
}