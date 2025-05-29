import { type NextRequest, NextResponse } from "next/server"
import { getSession, isAuthorized, logAuditEvent } from "@/lib/auth"
import { getQuarterlyData, getAllQuarters, saveQuarterlyData } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quarter = searchParams.get("quarter")

    if (quarter) {
      const data = await getQuarterlyData(quarter)
      if (!data) {
        return NextResponse.json({ error: "Quarter not found" }, { status: 404 })
      }

      // Log data access
      await logAuditEvent(session.user.id, "VIEW_QUARTERLY_DATA", "quarterly_data", data.id, { quarter }, request.ip)

      return NextResponse.json(data)
    } else {
      const quarters = await getAllQuarters()
      return NextResponse.json({ quarters })
    }
  } catch (error) {
    console.error("Error fetching quarterly data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAuthorized(session.user, "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()
    const savedData = await saveQuarterlyData(data)

    if (!savedData) {
      return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
    }

    // Log data update
    await logAuditEvent(
      session.user.id,
      "UPDATE_QUARTERLY_DATA",
      "quarterly_data",
      savedData.id,
      { quarter: data.quarter },
      request.ip,
    )

    return NextResponse.json(savedData)
  } catch (error) {
    console.error("Error saving quarterly data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
