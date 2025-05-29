import { supabaseAdmin } from "./supabase"

export interface QuarterlyData {
  id: string
  quarter: string
  metrics: {
    swapVolume: string
    cardSpending: string
    weeklyTransactingAccounts: number
  }
  financial: {
    cash: string
    monthlyBurn: string
    runwayMonths: number
    monthlyRevenue: string
    headcount: number
  }
  highlights: {
    ceoUpdate: string
    achievements: string[]
    challenges: string[]
    nextQuarterMilestones: string[]
  }
  documents: Array<{
    id: string
    name: string
    type: string
    date: string
    url?: string
  }>
  callToAction: {
    title: string
    description: string
    actionText: string
  }
  createdAt: string
  updatedAt: string
  isPublished: boolean
}

export async function getQuarterlyData(quarter: string): Promise<QuarterlyData | null> {
  try {
    // Get quarter info
    const { data: quarterData, error: quarterError } = await supabaseAdmin
      .from("quarters")
      .select("*")
      .eq("quarter_name", quarter)
      .single()

    if (quarterError || !quarterData) {
      return null
    }

    // Get metrics
    const { data: metricsData } = await supabaseAdmin
      .from("metrics")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .single()

    // Get financials
    const { data: financialsData } = await supabaseAdmin
      .from("financials")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .single()

    // Get CEO update
    const { data: ceoUpdateData } = await supabaseAdmin
      .from("ceo_updates")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .single()

    // Get achievements
    const { data: achievementsData } = await supabaseAdmin
      .from("achievements")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .order("display_order")

    // Get challenges
    const { data: challengesData } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .order("display_order")

    // Get milestones
    const { data: milestonesData } = await supabaseAdmin
      .from("milestones")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .order("display_order")

    // Get documents
    const { data: documentsData } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .order("upload_date", { ascending: false })

    // Get call to action
    const { data: ctaData } = await supabaseAdmin
      .from("call_to_actions")
      .select("*")
      .eq("quarter_id", quarterData.id)
      .single()

    return {
      id: quarterData.id,
      quarter: quarterData.quarter_name,
      metrics: {
        swapVolume: metricsData?.swap_volume || "$0",
        cardSpending: metricsData?.card_spending || "$0",
        weeklyTransactingAccounts: metricsData?.weekly_transacting_accounts || 0,
      },
      financial: {
        cash: financialsData?.cash_position || "$0",
        monthlyBurn: financialsData?.monthly_burn || "$0",
        runwayMonths: financialsData?.runway_months || 0,
        monthlyRevenue: financialsData?.monthly_revenue || "$0",
        headcount: financialsData?.headcount || 0,
      },
      highlights: {
        ceoUpdate: ceoUpdateData?.update_text || "",
        achievements: achievementsData?.map((a) => a.description) || [],
        challenges: challengesData?.map((c) => c.description) || [],
        nextQuarterMilestones: milestonesData?.map((m) => m.description) || [],
      },
      documents:
        documentsData?.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          date: doc.upload_date.split("T")[0],
          url: doc.file_path,
        })) || [],
      callToAction: {
        title: ctaData?.title || "",
        description: ctaData?.description || "",
        actionText: ctaData?.action_text || "",
      },
      createdAt: quarterData.created_at,
      updatedAt: quarterData.updated_at,
      isPublished: quarterData.is_published,
    }
  } catch (error) {
    console.error("Error fetching quarterly data:", error)
    return null
  }
}

export async function getAllQuarters(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("quarters")
      .select("quarter_name")
      .eq("is_published", true)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching quarters:", error)
      return []
    }

    return data.map((q) => q.quarter_name)
  } catch (error) {
    console.error("Error fetching quarters:", error)
    return []
  }
}

export async function saveQuarterlyData(
  data: Omit<QuarterlyData, "id" | "createdAt" | "updatedAt">,
): Promise<QuarterlyData | null> {
  try {
    // Start a transaction-like operation
    let quarterId: string

    // Check if quarter exists
    const { data: existingQuarter } = await supabaseAdmin
      .from("quarters")
      .select("id")
      .eq("quarter_name", data.quarter)
      .single()

    if (existingQuarter) {
      quarterId = existingQuarter.id

      // Update quarter
      await supabaseAdmin
        .from("quarters")
        .update({
          updated_at: new Date().toISOString(),
          is_published: data.isPublished,
        })
        .eq("id", quarterId)
    } else {
      // Create new quarter
      const { data: newQuarter, error } = await supabaseAdmin
        .from("quarters")
        .insert({
          quarter_name: data.quarter,
          start_date: getQuarterStartDate(data.quarter),
          end_date: getQuarterEndDate(data.quarter),
          is_published: data.isPublished,
        })
        .select("id")
        .single()

      if (error || !newQuarter) {
        throw new Error("Failed to create quarter")
      }

      quarterId = newQuarter.id
    }

    // Update or insert metrics
    await supabaseAdmin.from("metrics").upsert({
      quarter_id: quarterId,
      swap_volume: data.metrics.swapVolume,
      card_spending: data.metrics.cardSpending,
      weekly_transacting_accounts: data.metrics.weeklyTransactingAccounts,
      updated_at: new Date().toISOString(),
    })

    // Update or insert financials
    await supabaseAdmin.from("financials").upsert({
      quarter_id: quarterId,
      cash_position: data.financial.cash,
      monthly_burn: data.financial.monthlyBurn,
      runway_months: data.financial.runwayMonths,
      monthly_revenue: data.financial.monthlyRevenue,
      headcount: data.financial.headcount,
      updated_at: new Date().toISOString(),
    })

    // Update or insert CEO update
    await supabaseAdmin.from("ceo_updates").upsert({
      quarter_id: quarterId,
      update_text: data.highlights.ceoUpdate,
      updated_at: new Date().toISOString(),
    })

    // Delete existing achievements, challenges, milestones and re-insert
    await supabaseAdmin.from("achievements").delete().eq("quarter_id", quarterId)
    await supabaseAdmin.from("challenges").delete().eq("quarter_id", quarterId)
    await supabaseAdmin.from("milestones").delete().eq("quarter_id", quarterId)

    // Insert achievements
    if (data.highlights.achievements.length > 0) {
      await supabaseAdmin.from("achievements").insert(
        data.highlights.achievements.map((achievement, index) => ({
          quarter_id: quarterId,
          description: achievement,
          display_order: index,
        })),
      )
    }

    // Insert challenges
    if (data.highlights.challenges.length > 0) {
      await supabaseAdmin.from("challenges").insert(
        data.highlights.challenges.map((challenge, index) => ({
          quarter_id: quarterId,
          description: challenge,
          display_order: index,
        })),
      )
    }

    // Insert milestones
    if (data.highlights.nextQuarterMilestones.length > 0) {
      await supabaseAdmin.from("milestones").insert(
        data.highlights.nextQuarterMilestones.map((milestone, index) => ({
          quarter_id: quarterId,
          description: milestone,
          display_order: index,
        })),
      )
    }

    // Update or insert call to action
    await supabaseAdmin.from("call_to_actions").upsert({
      quarter_id: quarterId,
      title: data.callToAction.title,
      description: data.callToAction.description,
      action_text: data.callToAction.actionText,
      updated_at: new Date().toISOString(),
    })

    // Return the saved data
    return await getQuarterlyData(data.quarter)
  } catch (error) {
    console.error("Error saving quarterly data:", error)
    return null
  }
}

export async function deleteQuarterlyData(quarter: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("quarters").delete().eq("quarter_name", quarter)

    return !error
  } catch (error) {
    console.error("Error deleting quarterly data:", error)
    return false
  }
}

function getQuarterStartDate(quarter: string): string {
  const [q, year] = quarter.split(" ")
  const yearNum = Number.parseInt(year)

  switch (q) {
    case "Q1":
      return `${yearNum}-01-01`
    case "Q2":
      return `${yearNum}-04-01`
    case "Q3":
      return `${yearNum}-07-01`
    case "Q4":
      return `${yearNum}-10-01`
    default:
      return `${yearNum}-01-01`
  }
}

function getQuarterEndDate(quarter: string): string {
  const [q, year] = quarter.split(" ")
  const yearNum = Number.parseInt(year)

  switch (q) {
    case "Q1":
      return `${yearNum}-03-31`
    case "Q2":
      return `${yearNum}-06-30`
    case "Q3":
      return `${yearNum}-09-30`
    case "Q4":
      return `${yearNum}-12-31`
    default:
      return `${yearNum}-12-31`
  }
}

export async function trackDocumentDownload(documentId: string, userId: string): Promise<void> {
  try {
    await supabaseAdmin.from("document_downloads").insert({
      document_id: documentId,
      user_id: userId,
    })
  } catch (error) {
    console.error("Error tracking document download:", error)
  }
}
