"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  getElectionByToken,
  updateElection,
  generateElectionVoterIDs,
  getGeneratedVoterIDs,
  approveElectionResults,
  disapproveElectionResults,
  revokeNonOrganisationMembers,
} from "@/lib/database"
import type { Election, Role, VoterID } from "@/lib/types"
import { displayElectionToken } from "@/lib/utils"
import { canManageElection, openElection } from "@/lib/election-access"
import { electionScheduleLabel, toDateTimeLocalValue } from "@/lib/election-schedule"
import {
  Settings,
  Calendar,
  Users,
  Shield,
  Bell,
  Download,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { toFriendlyMessage } from "@/lib/user-messages"
import { DEFAULT_ORG_DOMAIN, electionOrganizationDomains, parseOrganizationDomains } from "@/lib/org-email"
import { ShareElectionDialog } from "@/components/elections/share-election-dialog"

export default function ElectionSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const electionToken = params.electionToken as string

  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [voterIDs, setVoterIDs] = useState<VoterID[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingVoterIDs, setGeneratingVoterIDs] = useState(false)
  const [voterCount, setVoterCount] = useState(50)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    resultsVisible: false,
    backgroundImage: "",
    orgMembersOnly: false,
    organizationDomains: [DEFAULT_ORG_DOMAIN] as string[],
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const access = await openElection(user.id, electionToken)
        if (!access.election || !canManageElection(access.role)) {
          router.push(`/dashboard/${electionToken}`)
          return
        }

        setVoterCount(access.election.totalVoters as number)
        setElection(access.election)
        setUserRole(access.role)
        setFormData({
          title: access.election.title,
          description: access.election.description,
          startDate: toDateTimeLocalValue(access.election.startDate || access.election.startTime),
          endDate: toDateTimeLocalValue(access.election.endDate || access.election.endTime),
          resultsVisible: access.election.resultsVisible || false,
          backgroundImage: access.election.backgroundImage || "",
          orgMembersOnly: !!access.election.orgMembersOnly,
          organizationDomains: electionOrganizationDomains(access.election),
        })

        const voterIDsResult = await getGeneratedVoterIDs(access.election.id)
        setVoterIDs(voterIDsResult.voterIDs)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load election settings",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }
    if (!loading && user) {
      fetchData()
    }

  }, [user, loading, electionToken, router, toast])

  const handleSaveBasicSettings = async () => {
    if (!election) return

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      toast({
        title: "Check the schedule",
        description: "The end date and time must be later than the start date and time.",
        variant: "destructive",
      })
      return
    }

    const enteredDomains = formData.organizationDomains.map((item) => item.trim()).filter(Boolean)
    const organizationDomains = parseOrganizationDomains(enteredDomains)
    if (enteredDomains.length !== organizationDomains.length || (formData.orgMembersOnly && organizationDomains.length === 0)) {
      toast({
        title: "Check the organisation domains",
        description: "Enter full domains such as mubas.ac.mw. Add another row for each extra domain.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const result = await updateElection(election.id, {
        title: formData.title,
        description: formData.description,
        startDate,
        endDate,
        startTime: startDate,
        endTime: endDate,
        backgroundImage: formData.backgroundImage,
        orgMembersOnly: formData.orgMembersOnly,
        organizationDomains,
        organizationDomain: organizationDomains.join(", "),
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        if (formData.orgMembersOnly) {
          const revocation = await revokeNonOrganisationMembers(election.id, organizationDomains)
          if (revocation.error) {
            toast({
              title: "Settings saved, revocation failed",
              description: revocation.error,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Settings Saved",
              description: `Organisation emails are required. ${revocation.revoked} member${revocation.revoked === 1 ? "" : "s"} with a different email ${revocation.revoked === 1 ? "was" : "were"} revoked.`,
            })
          }
        } else {
          toast({
            title: "Settings Saved",
            description: "Election settings have been updated successfully.",
          })
        }
        // Refresh election data
        const updatedElection = await getElectionByToken(electionToken)
        if (updatedElection.election) {
          setElection(updatedElection.election)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleResults = async () => {
    if (!election || !user) return

    try {
      const newVisibility = !formData.resultsVisible
      const result = newVisibility
        ? await approveElectionResults(election.id, user.id)
        : await disapproveElectionResults(election.id, user.id)

      if (result.success) {
        setFormData((prev) => ({ ...prev, resultsVisible: newVisibility }))
        toast({
          title: newVisibility ? "Results Published" : "Results Hidden",
          description: newVisibility
            ? "Election results are now visible to voters"
            : "Election results have been hidden from voters",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update results visibility",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update results visibility",
        variant: "destructive",
      })
    }
  }

  const handleGenerateVoterIDs = async () => {
    if (!election) return

    setGeneratingVoterIDs(true)
    try {
      const result = await generateElectionVoterIDs(election, voterCount)

      if (result.success) {
        toast({
          title: "Voter IDs Generated",
          description: `Successfully generated ${voterCount} voter IDs`,
        })
        // Refresh voter IDs
        const voterIDsResult = await getGeneratedVoterIDs(election.id)
        setVoterIDs(voterIDsResult.voterIDs)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate voter IDs",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate voter IDs",
        variant: "destructive",
      })
    } finally {
      setGeneratingVoterIDs(false)
    }
  }

  const handleExportVoterIDs = () => {
    if (voterIDs.length === 0) {
      toast({
        title: "No Data",
        description: "No voter IDs to export",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      "Voting ID,Election Token,Organization,Status,Expires At",
      ...voterIDs.map(
        (id) =>
          `${id.token},${id.electionToken},${id.organizationId},${id.isUsed ? "Used" : "Available"},${new Date(id.expiresAt).toLocaleDateString()}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voter-ids-${electionToken}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Voter IDs have been exported to CSV",
    })
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!election || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access election settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar electionToken={electionToken} userRole={userRole.role} />

      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-ivote-primary" />
              <h1 className="text-3xl font-bold text-gray-800">Election Settings</h1>
            </div>
            <p className="text-gray-600">Manage your election configuration and settings</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="voting">Voting</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-ivote-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Election Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter election title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Election code</Label>
                      <Input value={displayElectionToken(election.electionToken)} disabled className="font-mono" />
                      <ShareElectionDialog election={election} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter election description"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date & Time</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Election background picture</Label>
                    {formData.backgroundImage ? (
                      <div
                        className="aspect-video w-full rounded-xl bg-cover bg-center bg-no-repeat border"
                        style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                      />
                    ) : (
                      <div className="aspect-video w-full rounded-xl border border-dashed flex items-center justify-center text-sm text-gray-500">
                        No background yet. Use a wide landscape photo.
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingImage(true)
                        try {
                          const url = await uploadImageToCloudinary(file, "see-evote/elections")
                          setFormData((prev) => ({ ...prev, backgroundImage: url }))
                          toast({ title: "Picture uploaded", description: "Save changes to keep this background." })
                        } catch (error: any) {
                          toast({
                            title: "Upload failed",
                            description: toFriendlyMessage(error, "We could not upload that picture. Try a smaller image."),
                            variant: "destructive",
                          })
                        } finally {
                          setUploadingImage(false)
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      {uploadingImage ? "Uploading your picture..." : "A wide photo looks best on the election card."}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4 rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label>Organisation members only</Label>
                        
                      </div>
                      <Switch
                        checked={formData.orgMembersOnly}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, orgMembersOnly: checked }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organisation email domains</Label>
                      <p className="text-sm text-gray-600">
                        Voters can use an organisation email on any of these domains, such as bece22-yourname@mubas.ac.mw.
                      </p>
                      {formData.organizationDomains.map((domain, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={domain}
                            placeholder={DEFAULT_ORG_DOMAIN}
                            onChange={(event) => {
                              const organizationDomains = [...formData.organizationDomains]
                              organizationDomains[index] = event.target.value
                              setFormData((prev) => ({ ...prev, organizationDomains }))
                            }}
                          />
                          {formData.organizationDomains.length > 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  organizationDomains: prev.organizationDomains.filter((_, item) => item !== index),
                                }))
                              }
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, organizationDomains: [...prev.organizationDomains, ""] }))
                        }
                      >
                        Add domain
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {formData.resultsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <Label>Results Visibility</Label>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.resultsVisible
                          ? "Results are currently visible to voters"
                          : "Results are hidden from voters"}
                      </p>
                    </div>
                    <Switch checked={formData.resultsVisible} onCheckedChange={handleToggleResults} />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveBasicSettings}
                      disabled={saving}
                      className="bg-ivote-primary hover:bg-ivote-primary/90"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-ivote-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Election Status</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {election.approval === "approved" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="font-medium">Approval Status</span>
                    </div>
                    <Badge
                      variant={election.approval === "approved" ? "default" : "secondary"}
                      className={
                        election.approval === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {election.approval}
                    </Badge>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Election Status</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {electionScheduleLabel(election)}
                    </Badge>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Organization</span>
                    </div>
                    <p className="text-sm font-mono text-gray-700">{election.organizationId}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="voting" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-6 h-6 text-ivote-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Voter ID Management</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">{voterIDs.length}</h3>
                      <p className="text-sm text-blue-700">Total Generated</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-600">
                        {voterIDs.filter((id) => !id.isUsed).length}
                      </h3>
                      <p className="text-sm text-green-700">Available</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-red-600">{voterIDs.filter((id) => id.isUsed).length}</h3>
                      <p className="text-sm text-red-700">Used</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Generate New Voter IDs</h3>
                    <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="voterCount">Number of IDs to Generate</Label>
                        <Input
                          id="voterCount"
                          type="number"
                          min="1"
                          max="1000"
                          value={voterCount}
                          onChange={(e) => setVoterCount(Number.parseInt(e.target.value) || (election.totalVoters? (election.totalVoters as number ):50))}
                          className="w-32"
                        />
                      </div>
                      <Button
                        onClick={handleGenerateVoterIDs}
                        disabled={generatingVoterIDs}
                        className="bg-ivote-primary hover:bg-ivote-primary/90"
                      >
                        {generatingVoterIDs ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Generate IDs
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Export Voter IDs</h3>
                    <p className="text-sm text-gray-600">
                      Download all voter IDs as a CSV file for distribution to voters.
                    </p>
                    <Button onClick={handleExportVoterIDs} variant="outline" disabled={voterIDs.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      Export to CSV
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-ivote-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Security Notice</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Security settings are managed at the system level. Contact your super administrator for
                          security configuration changes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Current Security Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">Anonymous Voting</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">One-time Voter IDs</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">Audit Logging</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">Role-based Access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-ivote-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-800">Coming Soon</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Email notifications and voter reminders will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Planned Notification Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Election start/end reminders</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Voter registration notifications</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Results publication alerts</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Admin activity notifications</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
