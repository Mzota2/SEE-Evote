"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile, getUserRoles } from "@/lib/database"
import type { User, Role } from "@/lib/types"
import { UserIcon, Calendar, Shield, Edit2, Save, X } from "lucide-react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState<Partial<User>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        profileImage: user.profileImage,
      })

      // Load user roles
      loadUserRoles()
    }
  }, [user])

  const loadUserRoles = async () => {
    if (!user) return
    try {
      const roles = await getUserRoles(user.id)
      setUserRoles(roles)
    } catch (error) {
      console.error("Error loading user roles:", error)
    }
  }

  const handleSave = async () => {
    if (!user || !formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateUserProfile(user.id, formData)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        profileImage: user.profileImage,
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2 bg-transparent">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic account information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.profileImage || "/placeholder.svg"} alt={formData.name} />
                  <AvatarFallback className="text-2xl">{formData.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{formData.name}</h3>
                  <p className="text-gray-600">{formData.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {userRoles.length > 0 ? userRoles[0].role : "User"}
                  </Badge>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    value={formData.contactNumber || ""}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : ""}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={formData.address?.province || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, province: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address?.city || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, city: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                      id="barangay"
                      value={formData.address?.barangay || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address!, barangay: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>Your current roles and access levels across different elections</CardDescription>
            </CardHeader>
            <CardContent>
              {userRoles.length > 0 ? (
                <div className="space-y-4">
                  {userRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              role.role === "superAdmin" ? "default" : role.role === "admin" ? "secondary" : "outline"
                            }
                          >
                            {role.role}
                          </Badge>
                          <span className="font-medium">Election: {role.electionToken}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Status:{" "}
                          <span
                            className={`capitalize ${role.status === "approved" ? "text-green-600" : role.status === "pending" ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {role.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(role.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No roles assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Activity
              </CardTitle>
              <CardDescription>Your account creation and recent activity information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Account Created</Label>
                  <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Total Roles</Label>
                  <p className="text-lg">{userRoles.length}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Organization</Label>
                  <p className="text-lg">{user.organizationId ? "Member" : "No Organization"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
