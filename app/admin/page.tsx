"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Calendar,
  Upload,
  Save,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  Trash2,
  Plus,
  UserPlus,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { LogoutButton } from "@/components/logout-button"

export default function AdminDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2024")
  const [achievements, setAchievements] = useState([
    "Launched DeFi vault products with $5M TVL in first month",
    "Argent card transactions increased 45% QoQ",
  ])
  const [challenges, setChallenges] = useState([
    "Regulatory uncertainty in key markets",
    "Increased competition in the wallet space",
  ])
  const [milestones, setMilestones] = useState([
    "Launch institutional custody solution",
    "Expand to 2 new geographical markets",
  ])
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "Q4 2024 Board Deck.pdf", type: "Board Deck", date: "2024-12-15" },
    { name: "Q4 Financial Report.xlsx", type: "Financial Report", date: "2024-12-20" },
  ])

  const [newItem, setNewItem] = useState("")

  const [whitelistedInvestors, setWhitelistedInvestors] = useState([])

  const [adminUsers, setAdminUsers] = useState([])

  const [newInvestor, setNewInvestor] = useState({ name: "", email: "" })
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "Admin" })

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        const investors = data.users.filter((user) => user.role === "investor")
        const admins = data.users.filter((user) => user.role === "admin" || user.role === "super_admin")
        setWhitelistedInvestors(investors)
        setAdminUsers(admins)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const addItem = (type: "achievement" | "challenge" | "milestone") => {
    if (!newItem.trim()) return

    switch (type) {
      case "achievement":
        setAchievements([...achievements, newItem])
        break
      case "challenge":
        setChallenges([...challenges, newItem])
        break
      case "milestone":
        setMilestones([...milestones, newItem])
        break
    }
    setNewItem("")
  }

  const removeItem = (type: "achievement" | "challenge" | "milestone", index: number) => {
    switch (type) {
      case "achievement":
        setAchievements(achievements.filter((_, i) => i !== index))
        break
      case "challenge":
        setChallenges(challenges.filter((_, i) => i !== index))
        break
      case "milestone":
        setMilestones(milestones.filter((_, i) => i !== index))
        break
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const newFile = {
          name: file.name,
          type: "Document",
          date: new Date().toISOString().split("T")[0],
        }
        setUploadedFiles([...uploadedFiles, newFile])
      })
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      // Call the quarterly data API
      const response = await fetch("/api/quarterly-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quarter: selectedQuarter,
          // Include other data you want to save
        }),
      })

      if (response.ok) {
        alert("Data saved successfully!")
      } else {
        alert("Failed to save data.")
      }
    } catch (error) {
      console.error("Error saving data:", error)
      alert("An error occurred while saving data.")
    }
  }

  const addInvestor = async () => {
    if (!newInvestor.name.trim() || !newInvestor.email.trim()) return

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newInvestor.name,
          email: newInvestor.email,
          role: "investor",
        }),
      })

      if (response.ok) {
        setNewInvestor({ name: "", email: "" })
        fetchUsers() // Refresh user list
      } else {
        const error = await response.json()
        alert(`Failed to add investor: ${error.error}`)
      }
    } catch (error) {
      console.error("Error adding investor:", error)
      alert("An error occurred while adding the investor.")
    }
  }

  const removeInvestor = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUsers() // Refresh user list
      } else {
        alert("Failed to remove investor.")
      }
    } catch (error) {
      console.error("Error removing investor:", error)
      alert("An error occurred while removing the investor.")
    }
  }

  const addAdmin = async () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim()) return

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role.toLowerCase().replace(" ", "_"),
        }),
      })

      if (response.ok) {
        setNewAdmin({ name: "", email: "", role: "Admin" })
        fetchUsers() // Refresh user list
      } else {
        const error = await response.json()
        alert(`Failed to add admin: ${error.error}`)
      }
    } catch (error) {
      console.error("Error adding admin:", error)
      alert("An error occurred while adding the admin.")
    }
  }

  const removeAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchUsers() // Refresh user list
      } else {
        alert("Failed to remove admin.")
      }
    } catch (error) {
      console.error("Error removing admin:", error)
      alert("An error occurred while removing the admin.")
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-blue-600 rounded"></div>
                <div>
                  <h1 className="text-2xl font-bold">Argent Admin Portal</h1>
                  <p className="text-sm text-muted-foreground">Update Investor Dashboard Data</p>
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
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="metrics">Metrics & Financial</TabsTrigger>
              <TabsTrigger value="highlights">Progress Highlights</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="cta">Call to Action</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Key Metrics
                  </CardTitle>
                  <CardDescription>Update the key business metrics for {selectedQuarter}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="swapVolume">In-App Swap Volume</Label>
                    <Input id="swapVolume" placeholder="e.g., $12.5M" defaultValue="$12.5M" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardSpending">Argent Card Spending</Label>
                    <Input id="cardSpending" placeholder="e.g., $8.2M" defaultValue="$8.2M" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactingAccounts">Weekly Transacting Accounts</Label>
                    <Input id="transactingAccounts" placeholder="e.g., 15420" defaultValue="15420" />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Financial Information
                  </CardTitle>
                  <CardDescription>Update financial data for {selectedQuarter}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cash">Cash Position</Label>
                    <Input id="cash" placeholder="e.g., $45.2M" defaultValue="$45.2M" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="burn">Monthly Burn</Label>
                    <Input id="burn" placeholder="e.g., $2.1M" defaultValue="$2.1M" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runway">Runway (Months)</Label>
                    <Input id="runway" placeholder="e.g., 21" defaultValue="21" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Monthly Revenue</Label>
                    <Input id="revenue" placeholder="e.g., $890K" defaultValue="$890K" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headcount">Headcount</Label>
                    <Input id="headcount" placeholder="e.g., 67" defaultValue="67" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlights" className="space-y-6">
              {/* CEO Update */}
              <Card>
                <CardHeader>
                  <CardTitle>CEO Update</CardTitle>
                  <CardDescription>Quarterly message from the CEO</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter CEO's quarterly update message..."
                    className="min-h-[100px]"
                    defaultValue="Q4 has been transformational for Argent. We've successfully launched our new DeFi vault products and seen exceptional growth in card adoption. Our focus on institutional clients is paying off with several major partnerships in the pipeline."
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Achievements</CardTitle>
                    <CardDescription>Add achievements for this quarter</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">{achievement}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeItem("achievement", index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add new achievement..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />
                      <Button size="sm" onClick={() => addItem("achievement")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Challenges */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Challenges</CardTitle>
                    <CardDescription>Add challenges faced this quarter</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {challenges.map((challenge, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm">{challenge}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeItem("challenge", index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add new challenge..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />
                      <Button size="sm" onClick={() => addItem("challenge")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Quarter Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Next Quarter Milestones</CardTitle>
                    <CardDescription>Set goals for next quarter</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">{milestone}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeItem("milestone", index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add new milestone..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                      />
                      <Button size="sm" onClick={() => addItem("milestone")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Documents
                  </CardTitle>
                  <CardDescription>
                    Upload board decks, financial reports, and other documents for investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <Button asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Uploaded Documents
                  </CardTitle>
                  <CardDescription>Manage documents available to investors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.type} • {file.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeFile(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cta" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action</CardTitle>
                  <CardDescription>Set up requests for your investors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaTitle">Title</Label>
                    <Input
                      id="ctaTitle"
                      placeholder="e.g., Partnership Opportunities"
                      defaultValue="Partnership Opportunities"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaDescription">Description</Label>
                    <Textarea
                      id="ctaDescription"
                      placeholder="Describe what you're asking from investors..."
                      defaultValue="We're seeking strategic partnerships with institutional players. If you have connections in traditional finance or enterprise crypto, we'd love an introduction."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaButton">Button Text</Label>
                    <Input
                      id="ctaButton"
                      placeholder="e.g., Make an Introduction"
                      defaultValue="Make an Introduction"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* Whitelisted Investors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Whitelisted Investors
                  </CardTitle>
                  <CardDescription>Manage who can access the investor portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Investor */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="investorName">Investor Name</Label>
                      <Input
                        id="investorName"
                        placeholder="e.g., John Smith"
                        value={newInvestor.name}
                        onChange={(e) => setNewInvestor({ ...newInvestor, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investorEmail">Email Address</Label>
                      <Input
                        id="investorEmail"
                        type="email"
                        placeholder="e.g., john@example.com"
                        value={newInvestor.email}
                        onChange={(e) => setNewInvestor({ ...newInvestor, email: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addInvestor} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Investor
                      </Button>
                    </div>
                  </div>

                  {/* Investors List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">
                      Current Whitelisted Investors ({whitelistedInvestors.length})
                    </h4>
                    {whitelistedInvestors.map((investor) => (
                      <div
                        key={investor.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{investor.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {investor.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">Added {investor.addedDate}</Badge>
                          <Button variant="destructive" size="sm" onClick={() => removeInvestor(investor.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Admin Users
                  </CardTitle>
                  <CardDescription>Manage who can access the admin portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Admin */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Name</Label>
                      <Input
                        id="adminName"
                        placeholder="e.g., Jane Doe"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email Address</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="e.g., jane@argent.xyz"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminRole">Role</Label>
                      <Select
                        value={newAdmin.role}
                        onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                          <SelectItem value="Read Only">Read Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addAdmin} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Admin
                      </Button>
                    </div>
                  </div>

                  {/* Admins List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Current Admin Users ({adminUsers.length})</h4>
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {admin.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"}>{admin.role}</Badge>
                          <Badge variant="outline">Added {admin.addedDate}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAdmin(admin.id)}
                            disabled={admin.role === "Super Admin"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Access Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Access Settings</CardTitle>
                  <CardDescription>Configure portal access and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Require Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        New users must verify their email before accessing the portal
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-muted-foreground">Automatically log out users after inactivity</p>
                    </div>
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Download Tracking</p>
                      <p className="text-sm text-muted-foreground">Track when investors download documents</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
