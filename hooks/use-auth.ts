"use client"
 
import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"
import { useMessagingStore } from "@/lib/store" // <-- ADDED
 
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
 
  // Get setters from the Zustand store
  const { setCurrentUser, setAuthenticated } = useMessagingStore() // <-- ADDED
 
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
    } = AuthService.onAuthStateChange(async (authUser) => {
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
  // ADDED: Effect to sync with Zustand store
  useEffect(() => {
    if (state.loading) return; // Wait until loading is finished
 
    if (state.user && state.profile) {
      setCurrentUser(state.profile)
      setAuthenticated(true)
    } else {
      setCurrentUser(null)
      setAuthenticated(false)
    }
  }, [state.user, state.profile, state.loading, setCurrentUser, setAuthenticated])
 
 
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
 
  return {
    ...state,
    signInWithGoogle,
    signOut,
  }
}