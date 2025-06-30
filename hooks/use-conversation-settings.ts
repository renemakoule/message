"use client"

import { useState, useEffect } from "react";
import { useUsers } from "./use-users";
import { supabase } from "@/lib/supabase-client";

type SettingsSection = "main" | "members" | "media" | "notifications";

interface UseConversationSettingsProps {
  conversation: any;
  onBack?: () => void;
  isMobile?: boolean;
}

export function useConversationSettings({ conversation, onBack, isMobile = false }: UseConversationSettingsProps) {
  const [currentSection, setCurrentSection] = useState<SettingsSection>("main");
  const [groupName, setGroupName] = useState(conversation?.name || "");

  const { users: allUsers, loading: usersLoading } = useUsers();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!conversation || conversation.type !== 'group') {
        setLoadingParticipants(false);
        return;
      }
      setLoadingParticipants(true);
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation.id);

      if (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]);
      } else {
        const participantDetails = data
            .map(p => allUsers.find(u => u.id === p.user_id))
            .filter(Boolean);
        setParticipants(participantDetails);
      }
      setLoadingParticipants(false);
    };

    if (conversation && allUsers.length > 0) {
        fetchParticipants();
    }
  }, [conversation, allUsers]);

  const getSectionTitle = () => {
    switch (currentSection) {
      case "members":
        return "Membres";
      case "media":
        return "Médias";
      case "notifications":
        return "Notifications";
      default:
        return conversation?.type === "group" ? "Paramètres du groupe" : "Paramètres de la conversation";
    }
  };

  const handleBack = () => {
    if (currentSection === "main" && onBack) {
      onBack();
    } else {
      setCurrentSection("main");
    }
  };

  return {
    currentSection,
    setCurrentSection,
    getSectionTitle,
    handleBack,
    groupName,
    setGroupName,
    participants,
    loadingParticipants,
  };
}