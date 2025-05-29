import { type NextRequest, NextResponse } from "next/server"
import { getSession, isAuthorized, addUser, removeUser, getAllUsers, logAuditEvent } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAuthorized(session.user, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAuthorized(session.user, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, role } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    const newUser = await addUser(name, email, role)

    if (!newUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Log user creation
    await logAuditEvent(session.user.id, "CREATE_USER", "user", newUser.id, { name, email, role }, request.ip)

    return NextResponse.json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAuthorized(session.user, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await removeUser(userId)

    if (!success) {
      return NextResponse.json({ error: "User not found or could not be deleted" }, { status: 404 })
    }

    // Log user deletion
    await logAuditEvent(session.user.id, "DELETE_USER", "user", userId, {}, request.ip)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
