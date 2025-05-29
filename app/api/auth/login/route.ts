import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, updateLastLogin, logAuditEvent } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)

    if (!user) {
      await logAuditEvent(
        null,
        "LOGIN_FAILED",
        "user",
        undefined,
        { email, reason: "Email not whitelisted" },
        request.ip,
      )
      return NextResponse.json({ error: "Access denied. Email not whitelisted." }, { status: 401 })
    }

    // Update last login
    await updateLastLogin(user.id)

    // Create session
    const session = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }

    // Log successful login
    await logAuditEvent(user.id, "LOGIN_SUCCESS", "user", user.id, { email }, request.ip)

    const response = NextResponse.json({
      user,
      success: true,
      message: "Login successful",
    })

    response.cookies.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/", // Ensure cookie is available site-wide
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
