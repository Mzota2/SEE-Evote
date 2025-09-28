import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedText } from "@/components/animated-text"
import { VotingAnimation } from "@/components/voting-animation"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/see-evote-logo-transparent.png" alt="SEE-Evote Logo" className="h-12 w-auto" />
        </div>
        <div className="flex items-center gap-4">
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
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-gray-800 leading-tight">
                  <span className="text-ivote-primary">SEE-Evote</span> System
                </h1>
                <div className="text-xl text-gray-600 leading-relaxed">
                  <p className="mb-2">A rental-based solution designed to provide</p>
                  <p className="font-semibold text-ivote-primary">
                    <AnimatedText
                      texts={[
                        "secure, transparent, and scalable voting services",
                        "modern digital democracy solutions",
                        "trusted election management systems",
                        "innovative voting technology",
                      ]}
                    />
                  </p>
                </div>
              </div>

              <Link href="/register">
                <Button size="lg" className="bg-ivote-primary hover:bg-ivote-primary/90 text-white px-8 py-4 text-lg">
                  GET STARTED
                </Button>
              </Link>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 cursor-pointer">
                  <span className="text-gray-600">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 cursor-pointer">
                  <span className="text-gray-600">📘</span>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 cursor-pointer">
                  <span className="text-gray-600">🐦</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <VotingAnimation />
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className="mt-20 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Our Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide an online voting system that exceeds expectations, from secure polling software to the
              management of complex virtual voting events.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-ivote-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Secured Platform</h3>
              <p className="text-gray-600">With our system, your data is secured</p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-ivote-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Vote Online</h3>
              <p className="text-gray-600">In just few clicks, you can vote your preferred candidates</p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-ivote-primary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Real Time Results</h3>
              <p className="text-gray-600">View real time voting results and scores of each candidates</p>
            </Card>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-20">
          <Card className="p-12 bg-ivote-gradient text-white">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">SIGN UP</h3>
                <p className="text-white/90">Create an account on this system to vote</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">VOTE</h3>
                <p className="text-white/90">Vote for your preferred candidate</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">VIEW ELECTION RESULTS</h3>
                <p className="text-white/90">View election results of various candidates</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Partners Section */}
        <div className="mt-20 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-800">Partners & Organizations</h2>
            <p className="text-gray-600">Trusted by leading organizations and clubs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-lg">SEE</span>
              </div>
              <p className="text-sm text-gray-600">SEE</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-sm">MSIH</span>
              </div>
              <p className="text-sm text-gray-600">MSIH</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-xs">UCC</span>
              </div>
              <p className="text-sm text-gray-600">MUBAS UCC</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-xs">SOBES</span>
              </div>
              <p className="text-sm text-gray-600">SOBES</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-xs">SOCAS</span>
              </div>
              <p className="text-sm text-gray-600">SOCAS</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-ivote-primary font-bold text-xs">CCAPSO</span>
              </div>
              <p className="text-sm text-gray-600">CCAPSO</p>
            </div>
          </div>
        </div>

        {/* Special Thanks Section */}
        <div className="mt-20">
          <Card className="p-12 bg-gradient-to-r from-ivote-primary/10 to-ivote-secondary/10">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Special Thanks</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                In a special way, we acknowledge the following individuals for their remarkable contribution to the
                software
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-ivote-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-lg">EC</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">Emmanuel Chirambo</h3>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-ivote-secondary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold text-lg">PS</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">Pemphero Siliya</h3>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Make your decision-making process more modern, safe, and efficient.
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Upgrade from manual ballot counting to an online election system without jeopardizing the integrity of your
            vote.
          </p>
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
