import { type NextRequest, NextResponse } from "next/server"
import { getSession, logAuditEvent } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (session) {
      await logAuditEvent(session.user.id, "LOGOUT", "user", session.user.id, {}, request.ip)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
