"use client"

import { useState } from "react";
import { useMessagingStore } from "@/lib/store";
import { useUsers } from "@/hooks/use-users";
import { useConversations } from "@/hooks/use-conversations";
import { toast } from "sonner";

interface UseNewConversationProps {
    onSuccess?: () => void;
}

export function useNewConversation({ onSuccess }: UseNewConversationProps) {
    const { currentUser } = useMessagingStore();
    const { users, loading: usersLoading } = useUsers();
    const { createPersonalConversation, createGroupConversation } = useConversations(currentUser?.id);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const filteredUsers = (users || [])
        .filter((user) => user.id !== currentUser?.id)
        .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCreatePrivateConversation = async (userId: string) => {
        setIsCreating(true);
        try {
            await createPersonalConversation(userId);
            toast.success("Invitation envoyée !");
            onSuccess?.();
        } catch (error) {
            console.error("Failed to create private conversation:", error);
            toast.error("Échec de la création de la conversation.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        
        setIsCreating(true);
        try {
            await createGroupConversation({
                name: groupName,
                participantIds: selectedUsers,
            });
            toast.success("Groupe créé avec succès !");
            onSuccess?.();
        } catch (error) {
            console.error("Failed to create group:", error);
            toast.error("Échec de la création du groupe.");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    return {
        users,
        usersLoading,
        searchQuery,
        setSearchQuery,
        filteredUsers,
        selectedUsers,
        toggleUserSelection,
        groupName,
        setGroupName,
        isCreating,
        handleCreatePrivateConversation,
        handleCreateGroup,
    };
}