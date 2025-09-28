import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src="/see-evote-logo.png" alt="SEE-Evote Logo" className="h-12 w-auto cursor-pointer" />
          </Link>
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
          <Link href="/terms" className="text-ivote-primary font-semibold">
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Terms of <span className="text-ivote-primary">Service</span>
            </h1>
            <p className="text-lg text-gray-600">Last updated: September {new Date().getFullYear()}</p>
          </div>

          {/* Terms of Service Content */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="prose prose-gray max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Agreement to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using the SEE-Evote System, you agree to be bound by these Terms of Service and all
                  applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
                  using or accessing this service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Service Description</h2>
                <p className="text-gray-600 leading-relaxed">
                  SEE-Evote System is a rental-based online voting platform designed to provide secure, transparent, and
                  scalable voting services for organizations, clubs, and individuals. The service includes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Secure online voting capabilities</li>
                  <li>Election management tools</li>
                  <li>Real-time results and analytics</li>
                  <li>User authentication and verification</li>
                  <li>Administrative oversight and controls</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">User Responsibilities</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">Account Registration</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Users must provide accurate, current, and complete information during registration and maintain the
                    security of their account credentials.
                  </p>

                  <h3 className="text-lg font-medium text-gray-800">Voting Conduct</h3>
                  <p className="text-gray-600 leading-relaxed">Users agree to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Vote only once per election unless otherwise specified</li>
                    <li>Not attempt to manipulate or interfere with the voting process</li>
                    <li>Respect the confidentiality of voting tokens and credentials</li>
                    <li>Report any suspected security breaches or irregularities</li>
                    <li>Comply with all election rules and guidelines</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Administrator Responsibilities</h2>
                <p className="text-gray-600 leading-relaxed">
                  Organizations renting the system and their designated administrators agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Use the system only for legitimate voting purposes</li>
                  <li>Ensure fair and transparent election processes</li>
                  <li>Properly verify voter eligibility before approval</li>
                  <li>Maintain the confidentiality of voter information</li>
                  <li>Comply with applicable laws and regulations</li>
                  <li>Pay all fees associated with system rental</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Prohibited Activities</h2>
                <p className="text-gray-600 leading-relaxed">Users are strictly prohibited from:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Attempting to hack, compromise, or breach system security</li>
                  <li>Creating multiple accounts to vote more than once</li>
                  <li>Sharing voting credentials with unauthorized persons</li>
                  <li>Using the system for illegal or fraudulent purposes</li>
                  <li>Interfering with other users' ability to vote</li>
                  <li>Reverse engineering or copying system components</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">System Availability</h2>
                <p className="text-gray-600 leading-relaxed">
                  While we strive to maintain continuous service availability, we do not guarantee uninterrupted access
                  to the system. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Perform scheduled maintenance and updates</li>
                  <li>Suspend service for security reasons</li>
                  <li>Modify or discontinue features with notice</li>
                  <li>Limit access during high-traffic periods</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  SEE-Evote System shall not be liable for any indirect, incidental, special, consequential, or punitive
                  damages resulting from your use of the service. Our total liability shall not exceed the amount paid
                  for system rental.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to terminate or suspend access to the service immediately, without prior notice,
                  for conduct that we believe violates these Terms of Service or is harmful to other users or the
                  service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes,
                  and continued use of the service constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> mubas-see@gmail.com
                    <br />
                    <strong>Subject:</strong> Terms of Service Inquiry
                  </p>
                </div>
              </section>
            </div>
          </Card>
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
