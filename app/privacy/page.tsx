import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
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
          <Link href="/privacy" className="text-ivote-primary font-semibold">
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Privacy <span className="text-ivote-primary">Policy</span>
            </h1>
            <p className="text-lg text-gray-600">Last updated: September {new Date().getFullYear()}</p>
          </div>

          {/* Privacy Policy Content */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="prose prose-gray max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  SEE-Evote System ("we," "our," or "us") is committed to protecting your privacy and ensuring the
                  security of your personal information. This Privacy Policy describes how we collect, use, disclose,
                  and safeguard your information when you use our online voting platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Information We Collect</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We collect personal information that you voluntarily provide when registering for an account,
                    including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Full name and contact information</li>
                    <li>Email address</li>
                    <li>Organization or club affiliation</li>
                    <li>Voting credentials and tokens</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">Voting Data</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We collect and process voting-related information to ensure election integrity:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Vote choices and preferences</li>
                    <li>Voting timestamps</li>
                    <li>Election participation records</li>
                    <li>Authentication and verification data</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>To provide and maintain our voting services</li>
                  <li>To verify voter eligibility and prevent fraud</li>
                  <li>To process and record votes securely</li>
                  <li>To generate election results and reports</li>
                  <li>To communicate with users about their accounts and elections</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations and regulations</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement robust security measures to protect your personal information and voting data:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>End-to-end encryption for all voting data</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Compliance with industry-standard security practices</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Information Sharing</h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the
                  following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>With your explicit consent</li>
                  <li>To election administrators within your organization</li>
                  <li>When required by law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Your Rights</h2>
                <p className="text-gray-600 leading-relaxed">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Access to your personal data</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your account and data</li>
                  <li>Objection to processing of your data</li>
                  <li>Data portability where applicable</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> mubas-see@gmail.com
                    <br />
                    <strong>Subject:</strong> Privacy Policy Inquiry
                  </p>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </main>

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
