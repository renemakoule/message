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
    try {
      console.log("Starting Google OAuth sign in...");
      console.log("Current origin:", window.location.origin);
      console.log("Redirect URL:", `${window.location.origin}/auth/callback`);
      
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

      console.log("Google OAuth initiated successfully", data);
      
      // Check if we should redirect
      if (data.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        console.warn("No redirect URL provided by Supabase");
      }
      
      return data
    } catch (error) {
      console.error("Exception in signInWithGoogle:", error);
      throw error;
    }
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
    try {
      console.log("Attempting to upsert user profile for:", user.id, user.email)
      
      const profileData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url,
        status: "online",
        updated_at: new Date().toISOString(),
      }
      
      console.log("Profile data to upsert:", profileData)
      
      const { data, error } = await supabase
        .from("users")
        .upsert(profileData)
        .select()
        .single()

      if (error) {
        console.error("Error upserting user profile:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log("Successfully upserted user profile:", data)
      return data
    } catch (error) {
      console.error("Exception in upsertUserProfile:", error)
      throw error
    }
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
      console.log("Auth state change:", event, session?.user?.id)
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Create/update user profile
          await this.upsertUserProfile(session.user)
          await this.updateUserStatus("online")

          // Get full user with profile
          const authUser = await this.getCurrentUser()
          callback(authUser)
        } catch (error) {
          console.error("Error in auth state change handler:", error)
          // Even if profile creation fails, we can still proceed with the user
          // The profile can be created later
          const authUser = await this.getCurrentUser()
          callback(authUser)
        }
      } else if (event === "SIGNED_OUT") {
        callback(null)
      }
    })
  }
}