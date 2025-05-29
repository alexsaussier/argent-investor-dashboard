"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, Calendar, Download, DollarSign, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"

export default function InvestorDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2024")
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/quarterly-data?quarter=${selectedQuarter}`, {
          credentials: "include", // Ensure cookies are included
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Let AuthGuard handle the redirect
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error("Could not fetch data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedQuarter])

  const handleDownload = (docName: string) => {
    // In a real app, this would trigger an actual download
    alert(`Downloading: ${docName}`)
  }

  const handleCallToAction = () => {
    // In a real app, this would open a form or redirect
    alert("Opening contact form...")
  }

  return (
    <AuthGuard>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 bg-blue-600 rounded animate-pulse mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      ) : !data ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p>No data available for {selectedQuarter}</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b bg-white">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-blue-600 rounded"></div>
                  <div>
                    <h1 className="text-2xl font-bold">Argent Investor Portal</h1>
                    <p className="text-sm text-muted-foreground">Quarterly Updates & Metrics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8 space-y-8">
            {/* Key Metrics */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In-App Swap Volume</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.metrics.swapVolume}</div>
                    <p className="text-xs text-muted-foreground">+15.7% from last quarter</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Argent Card Spending</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.metrics.cardSpending}</div>
                    <p className="text-xs text-muted-foreground">+43.9% from last quarter</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Transacting Accounts</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.metrics.weeklyTransactingAccounts.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+24.8% from last quarter</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Financial Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{data.financial.cash}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{data.financial.monthlyBurn}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Runway</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.financial.runwayMonths} months</div>
                    <Progress value={(data.financial.runwayMonths / 36) * 100} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{data.financial.monthlyRevenue}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Headcount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.financial.headcount}</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Progress Highlights */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Progress Highlights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CEO Update</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.highlights.ceoUpdate}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Key Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.highlights.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Badge variant="secondary" className="mt-0.5 bg-green-100 text-green-800">
                            ✓
                          </Badge>
                          <span className="text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Key Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.highlights.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Badge variant="secondary" className="mt-0.5 bg-yellow-100 text-yellow-800">
                            !
                          </Badge>
                          <span className="text-sm">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Next Quarter Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.highlights.nextQuarterMilestones.map((milestone, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Badge variant="secondary" className="mt-0.5 bg-blue-100 text-blue-800">
                            →
                          </Badge>
                          <span className="text-sm">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Downloads Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Downloads
              </h2>
              <Card>
                <CardHeader>
                  <CardTitle>Available Documents</CardTitle>
                  <CardDescription>Board decks, financial reports, and other materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Download className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Call to Action */}
            <section>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">{data.callToAction.title}</CardTitle>
                  <CardDescription className="text-blue-700">{data.callToAction.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleCallToAction} className="bg-blue-600 hover:bg-blue-700">
                    {data.callToAction.actionText}
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
