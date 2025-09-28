"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signUp } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    birthday: "",
    region: "",
    street: "",
    city: "",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const userData = {
      name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
      contactNumber: formData.contactNumber,
      address: {
        region: formData.region,
        street: formData.street,
        city: formData.city,
      }
    }
    const { user, error } = await signUp(formData.email, formData.password, userData);
    console.log(error);
    if (error) {
      toast({
        title: "Registration Failed",
        description: error,
        variant: "destructive",
      })
    } else if (user) {
      toast({
        title: "Registration Successful",
        description: "Welcome to iVOTE!",
      })
      router.push("/post-registration")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 ">
          <Link href='/' className="inline-flex items-center gap-2 mb-6">
            <Image width={100} height={100} src="/see-evote-logo-transparent.png" alt="SEE-Evote Logo" className="h-12 w-auto" />
          </Link>
          {/* <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-ivote-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">VOTE</span>
          </Link> */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Welcome Card */}
          <Card className="p-8 bg-ivote-gradient text-white flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
  
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Welcome!</h2>
                <p className="text-white/90">
                  Welcome to iVOTE's Online Voting System, please register as a voter to vote in your preferred
                  candidate
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Voters ID No.</h3>
                  <Input
                    placeholder="Voters ID No..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Create password</h3>
                  <p className="text-sm text-white/80 mb-2">
                    Create a strong password with a mix of letters, numbers and symbols.
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <Input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Password"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.agreeToTerms} onCheckedChange={()=>{setFormData((prev)=>{
                    return {
                      ...prev,
                      agreeToTerms:!prev.agreeToTerms
                    }
                  })}} id="terms" className="border-white/20" />
                  <Label htmlFor="terms" className="text-sm text-white/90">
                    I agree to SEE-Evote's Terms and Service and Privacy Policy
                  </Label>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  
                className="w-full bg-white text-ivote-primary hover:bg-white/90">{loading ? "Creating Account..." : "REGISTER"}</Button>

                <p className="text-center text-white/80">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </Card>

          {/* Registration Form */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Fill out your information</h3>
                <p className="text-gray-600 mb-6">Please fill out your information below.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">FIRST NAME</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">MIDDLE NAME</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">LAST NAME</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">BIRTHDAY</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">CONTACT NUMBER</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+265"
                    
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">EMAIL</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">ORGANIZATION</Label>
                <Input
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="Organization"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">CURRENT ADDRESS</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">REGION</Label>
                    <Input
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder="Region"
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">STREET</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Street"
                     
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">CITY/MUNICIPALITY</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City/Municipality"
                   
                  />
                </div>
              </div>

              {/* <Button
                type="submit"
                disabled={loading}
                className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white"
              >
                {loading ? "Creating Account..." : "SUBMIT"}
              </Button> */}
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
