"use client"
import { Menu, X } from "lucide-react"
import type React from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      
      {/* Header */}
      <header className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href='/' className="flex items-center gap-3">
            <img src="/see-evote-logo-transparent.png" alt="SEE-Evote Logo" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/about" className="text-gray-600 hover:text-gray-800">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-800">
              Contact Us
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-800">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-800">
              Terms
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-ivote-primary text-ivote-primary hover:bg-ivote-primary hover:text-white bg-transparent"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-ivote-primary hover:bg-ivote-primary/90 text-white">Register</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link href="/about" className="text-gray-600 hover:text-gray-800 py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-800 py-2">
                Contact Us
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-800 py-2">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-800 py-2">
                Terms
              </Link>
              <Link href="/login" className="py-2">
                <Button
                  variant="outline"
                  className="w-full border-ivote-primary text-ivote-primary hover:bg-ivote-primary hover:text-white bg-transparent"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register" className="py-2">
                <Button className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white">Register</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">
              Contact <span className="text-ivote-primary">SEE-Evote</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get in touch with us for any questions, support, or inquiries about our voting system.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white">
                    Send Message
                  </Button>
                </form>
              </div>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-ivote-primary">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <p className="text-gray-600">mubas-see@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Follow Us</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600">📱</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">WhatsApp</p>
                        <p className="text-gray-600">Connect with us on WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">📘</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Facebook</p>
                        <p className="text-gray-600">Follow us on Facebook</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">💼</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">LinkedIn</p>
                        <p className="text-gray-600">Connect professionally</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-pink-600">📷</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Instagram</p>
                        <p className="text-gray-600">Follow our updates</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600">🌐</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Website</p>
                        <p className="text-gray-600">Visit our main website</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-ivote-gradient text-white">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Need Help?</h3>
                  <p className="text-white/90">
                    Our support team is here to help you with any questions about the SEE-Evote system.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-white/80">Response time: Within 24 hours</p>
                    <p className="text-sm text-white/80">Support hours: Monday - Friday, 9 AM - 5 PM</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 text-center">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">How do I rent the voting system?</h3>
                  <p className="text-gray-600 text-sm">
                    Contact us through this form or email to discuss your voting needs and receive a unique voting token
                    for your organization.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Is the system secure?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, our system is built with security and transparency as core principles, ensuring fair and
                    trustworthy elections.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Can multiple organizations use it simultaneously?</h3>
                  <p className="text-gray-600 text-sm">
                    Our rental-based system supports multiple organizations conducting elections at the same time.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">What support do you provide?</h3>
                  <p className="text-gray-600 text-sm">
                    We provide full technical support, training, and assistance throughout your voting process.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ivote-primary text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/see-evote-logo.png" alt="SEE-Evote Logo" className="h-8 w-auto brightness-0 invert" />
            </div>
            <p className="text-white/80">© Copyright 2024 SEE-Evote System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
