"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function AboutPage() {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">
              About <span className="text-ivote-primary">SEE-Evote System</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A Voting System meant for Society of Electrical Engineers that can be rented by other clubs and
              organisations to ensure a transparent voting experience.
            </p>
          </div>

          {/* Main Description */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  The SEE Voting System is a rental-based solution designed to provide secure, transparent, and scalable
                  voting services. Organisations, clubs, and individuals can simultaneously rent the system to conduct
                  their elections by being provided with a unique voting token.
                </p>
                <p>
                  Voters can create accounts, sign in, and join an election by submitting a voting token. After admin
                  approval, the voter is admitted into the voting section. The system is structured with Super Admins
                  and Admins: organisations or individuals that rent the system are assigned admin accounts, while the
                  platform managers function as Super Admins with overall oversight of all elections.
                </p>
                <p>
                  Super Admins have limited control over voting and results to maintain integrity and transparency.
                  Admins also hold authority to invoke or revoke a vote if the voter is found invalid.
                </p>
              </div>
            </div>
          </Card>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-ivote-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Secure & Transparent</h3>
              <p className="text-gray-600">
                Built with security and transparency at its core, ensuring fair and trustworthy elections for all
                participants.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-ivote-secondary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-ivote-secondary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Rental-Based Solution</h3>
              <p className="text-gray-600">
                Organizations can rent the system with unique voting tokens, allowing multiple simultaneous elections.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-ivote-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Admin Control</h3>
              <p className="text-gray-600">
                Structured admin system with Super Admins and regular Admins ensuring proper oversight and management.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-ivote-secondary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-ivote-secondary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Scalable Platform</h3>
              <p className="text-gray-600">
                Designed to handle multiple organizations and elections simultaneously with reliable performance.
              </p>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="p-8 bg-ivote-gradient text-white">
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold">Rent System</h3>
                  <p className="text-white/90 text-sm">
                    Organizations rent the system and receive unique voting tokens
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold">Voter Registration</h3>
                  <p className="text-white/90 text-sm">
                    Voters create accounts and submit voting tokens to join elections
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold">Admin Approval</h3>
                  <p className="text-white/90 text-sm">Admins review and approve voters for election participation</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <h3 className="font-semibold">Secure Voting</h3>
                  <p className="text-white/90 text-sm">Approved voters participate in secure, transparent elections</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Ready to Get Started?</h2>
            <p className="text-gray-600">Join the SEE-Evote system today and experience secure, transparent voting.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-ivote-primary hover:bg-ivote-primary/90 text-white">
                  Register Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-ivote-primary text-ivote-primary hover:bg-ivote-primary hover:text-white bg-transparent"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
        <footer className="bg-ivote-primary text-white mt-20">
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src="/see-evote-logo-transparent.png" alt="SEE-Evote Logo"  className="h-8 w-auto brightness-0 invert"/>
                    </div>
                    <p className="text-white/80">© Copyright {new Date().getFullYear()}</p>
                  </div>
      
                  <div className="space-y-4">
                    <h4 className="font-semibold">Product</h4>
                    <div className="space-y-2 text-white/80">
                      <div>Website</div>
                    </div>
                  </div>
      
                  <div className="space-y-4">
                    <h4 className="font-semibold">Legal</h4>
                    <div className="space-y-2 text-white/80">
                      <Link href="/terms" className="block hover:text-white">
                        Terms and Conditions
                      </Link>
                      <Link href="/privacy" className="block hover:text-white">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
      
                  <div className="space-y-4">
                    <h4 className="font-semibold">Contact Us</h4>
                    <div className="space-y-2 text-white/80">
                      <div>Email: mubas-see@gmail.com</div>
                      <div>WhatsApp</div>
                      <div>Facebook</div>
                      <div>LinkedIn</div>
                      <div>Instagram</div>
                    </div>
                  </div>
                </div>
              </div>
        </footer>
    </div>
  )
}
