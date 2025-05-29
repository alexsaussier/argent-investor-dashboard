import { cookies } from "next/headers"
import { supabaseAdmin } from "./supabase"

export interface User {
  id: string
  name: string
  email: string
  role: "investor" | "admin" | "super_admin"
  added_date: string
  last_login?: string
}

export interface Session {
  user: User
  expires: string
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value) as Session

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email.toLowerCase()).single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      added_date: data.added_date,
      last_login: data.last_login,
    }
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

export function isAuthorized(user: User | null, requiredRole?: "admin" | "super_admin"): boolean {
  if (!user) return false

  if (!requiredRole) {
    // Any authenticated user is authorized
    return true
  }

  if (requiredRole === "admin") {
    return user.role === "admin" || user.role === "super_admin"
  }

  if (requiredRole === "super_admin") {
    return user.role === "super_admin"
  }

  return false
}

export async function addUser(name: string, email: string, role: "investor" | "admin"): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email: email.toLowerCase(),
        role,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding user:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      added_date: data.added_date,
    }
  } catch (error) {
    console.error("Error adding user:", error)
    return null
  }
}

export async function removeUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("users").delete().eq("id", id)

    return !error
  } catch (error) {
    console.error("Error removing user:", error)
    return false
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").order("added_date", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      added_date: user.added_date,
      last_login: user.last_login,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await supabaseAdmin.from("users").update({ last_login: new Date().toISOString() }).eq("id", userId)
  } catch (error) {
    console.error("Error updating last login:", error)
  }
}

export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
    })
  } catch (error) {
    console.error("Error logging audit event:", error)
  }
}
