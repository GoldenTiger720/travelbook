import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/signup">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">TravelBook</h1>
          <h2 className="text-2xl font-semibold mt-2">Terms and Conditions</h2>
          <p className="text-muted-foreground mt-1">Last updated: January 2025</p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using TravelBook, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Permission is granted to temporarily use TravelBook for personal, non-commercial transitory purposes only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on TravelBook</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">3. User Account</h3>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features of TravelBook, you must register for an account. When you register for an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access</li>
              <li>Notify us immediately if you discover or suspect any security breaches</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">4. Privacy Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your use of TravelBook is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices. We respect your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">5. Bookings and Reservations</h3>
            <p className="text-muted-foreground leading-relaxed">
              All bookings made through TravelBook are subject to availability and confirmation. We reserve the right to refuse or cancel any booking for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Unavailability of travel services</li>
              <li>Errors in pricing or service descriptions</li>
              <li>Suspected fraudulent transactions</li>
              <li>Violation of these Terms and Conditions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">6. Payment Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              All payments must be made in full at the time of booking unless otherwise specified. We accept various payment methods as indicated on our platform. You agree to pay all charges incurred by you or on your behalf through TravelBook, including applicable taxes and fees.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">7. Cancellation and Refund Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cancellation policies vary depending on the specific travel service booked. Please review the cancellation policy for each booking carefully before confirming. Refunds, if applicable, will be processed according to the specific cancellation policy of the booked service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">8. User Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              By posting content on TravelBook, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content. You are responsible for the content you post and must ensure it does not violate any laws or infringe on any third-party rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">9. Prohibited Uses</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are prohibited from using the site or its content:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">10. Disclaimer</h3>
            <p className="text-muted-foreground leading-relaxed">
              The materials on TravelBook are provided on an 'as is' basis. TravelBook makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">11. Limitations</h3>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall TravelBook or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use TravelBook, even if TravelBook or a TravelBook authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">12. Indemnification</h3>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless TravelBook, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the platform or violation of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">13. Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which TravelBook operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">14. Changes to Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              TravelBook reserves the right to update or modify these Terms and Conditions at any time without prior notice. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms and Conditions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">15. Contact Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p>Email: legal@travelbook.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Travel Street, Suite 100, City, State 12345</p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button variant="outline">
              Return to Sign Up
            </Button>
          </Link>
          <Link to="/signin">
            <Button>
              I Accept - Continue to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TermsPage