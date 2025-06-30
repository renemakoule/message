"use client"
 
import { useEffect, useState } from "react"
import { AuthService, type AuthUser } from "@/lib/auth"
import { useMessagingStore } from "@/lib/store"
 
interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}
 
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
 
  const { setCurrentUser, setAuthenticated } = useMessagingStore()
 
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const authUser = await AuthService.getCurrentUser()
        setState({
          user: authUser,
          loading: false,
          error: null,
        })
        if (authUser) {
          setCurrentUser(authUser.profile || null)
          setAuthenticated(true)
        } else {
          setCurrentUser(null)
          setAuthenticated(false)
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
        })
        setCurrentUser(null)
        setAuthenticated(false)
      }
    }
 
    getInitialSession()
 
    // Listen to auth changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((authUser) => {
      setState({
        user: authUser,
        loading: false,
        error: null,
      })
      if (authUser) {
        setCurrentUser(authUser.profile || null)
        setAuthenticated(true)
      } else {
        setCurrentUser(null)
        setAuthenticated(false)
      }
    })
 
    return () => {
      subscription.unsubscribe()
    }
  }, [setCurrentUser, setAuthenticated])
 
 
  const signInWithGoogle = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await AuthService.signInWithGoogle()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw new Error(errorMessage)
    }
  }
 
  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await AuthService.signOut()
      // The onAuthStateChange listener will handle setting the state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
       throw new Error(errorMessage)
    }
  }
 
  return {
    user: state.user,
    profile: state.user?.profile || null,
    loading: state.loading,
    error: state.error,
    signInWithGoogle,
    signOut,
  }
}