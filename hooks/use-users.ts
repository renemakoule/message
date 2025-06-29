"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { RealtimeService } from "@/lib/realtime"
import type { Database } from "@/lib/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("name")

      if (error) throw error

      setUsers(data || [])
      setError(null)
    } catch (err) {
      console.error("Error loading users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Subscribe to user presence changes
  useEffect(() => {
    const channel = RealtimeService.subscribeToUserPresence((updatedUser) => {
      setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    })

    return () => {
      RealtimeService.unsubscribe("user-presence")
    }
  }, [])

  const getOnlineUsers = () => {
    return users.filter((user) => user.status === "online")
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  const searchUsers = (query: string) => {
    if (!query.trim()) return users

    const lowercaseQuery = query.toLowerCase()
    return users.filter(
      (user) => user.name.toLowerCase().includes(lowercaseQuery) || user.email.toLowerCase().includes(lowercaseQuery),
    )
  }

  return {
    users,
    loading,
    error,
    getOnlineUsers,
    getUserById,
    searchUsers,
    refetch: loadUsers,
  }
}
