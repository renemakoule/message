import { supabase } from "./supabase-client"
import type { User } from "@supabase/supabase-js"
import type { Database } from "./supabase"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export interface AuthUser extends User {
  profile?: UserProfile
}

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }

    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting current user:", error)
      return null
    }

    if (!user) return null

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return {
      ...user,
      profile: profile || undefined,
    }
  }

  // Create or update user profile
  static async upsertUserProfile(user: User) {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url,
        status: "online",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting user profile:", error)
      throw error
    }

    return data
  }

  // Update user status
  static async updateUserStatus(status: "online" | "offline" | "away") {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("users")
      .update({
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating user status:", error)
      throw error
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Create/update user profile
        await this.upsertUserProfile(session.user)
        await this.updateUserStatus("online")

        // Get full user with profile
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else if (event === "SIGNED_OUT") {
        callback(null)
      }
    })
  }
}
