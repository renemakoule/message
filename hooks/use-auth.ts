"use client"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const authUser = await AuthService.getCurrentUser()
        setState({
          user: authUser,
          profile: authUser?.profile || null,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
        })
      }
    }

    getInitialSession()

    // Listen to auth changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((authUser) => {
      setState({
        user: authUser,
        profile: authUser?.profile || null,
        loading: false,
        error: null,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await AuthService.signInWithGoogle()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }))
    }
  }

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await AuthService.signOut()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      }))
    }
  }

  const updateStatus = async (status: "online" | "offline" | "away") => {
    try {
      await AuthService.updateUserStatus(status)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return {
    ...state,
    signInWithGoogle,
    signOut,
    updateStatus,
    isAuthenticated: !!state.user,
  }
}
