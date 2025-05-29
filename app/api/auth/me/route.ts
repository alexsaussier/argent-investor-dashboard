import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if session is still valid
    if (new Date(session.expires) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
