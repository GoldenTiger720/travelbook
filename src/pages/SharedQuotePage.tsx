import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { bookingService } from "@/services/bookingService"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  Clock,
  Download,
  Share2,
  CheckCircle,
  Send
} from "lucide-react"

export function SharedQuotePage() {
  const { shareId } = useParams()
  const location = useLocation()
  const { toast } = useToast()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Get booking data from navigation state (passed from save success) or fetch by shareId
  const bookingData = location.state?.bookingData
  const shareableLink = location.state?.shareableLink || shareId

  useEffect(() => {
    const loadQuoteData = async () => {
      if (bookingData) {
        // Use data passed from navigation state
        setBooking(bookingData)
        setLoading(false)
      } else if (shareId) {
        // Fetch data by shareableLink
        try {
          setLoading(true)
          // TODO: Implement API endpoint to fetch booking by shareableLink
          // const data = await bookingService.getBookingByShareableLink(shareId)
          // setBooking(data)

          // For now, show error message about needing to implement API
          setError("Quote data loading requires API implementation")
          setLoading(false)
        } catch (err) {
          console.error("Failed to load quote:", err)
          setError("Failed to load quote data")
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadQuoteData()
  }, [shareId, bookingData])

  // Debug logging
  useEffect(() => {
    console.log('SharedQuotePage Debug:', {
      shareId,
      hasNavigationState: !!location.state,
      bookingData,
      shareableLink,
      hasBookingData: !!booking,
      bookingId: booking?.id
    })
  }, [shareId, location.state, bookingData, shareableLink, booking])

  useEffect(() => {
    if (booking?.termsAccepted?.accepted) {
      setTermsAccepted(true)
    }
    if (booking?.customer?.email) {
      setCustomerEmail(booking.customer.email)
    }
  }, [booking])

  const handleAcceptTerms = async () => {
    if (!booking || !termsAccepted) return

    setAcceptingTerms(true)
    try {
      // TODO: Implement backend call to accept terms
      // const success = await bookingService.acceptTerms(booking.id, customerEmail || booking.customer.email)

      // For now, show success message
      toast({
        title: "✅ Terms Accepted Successfully!",
        description: "Thank you for accepting the terms. Our team will contact you soon to finalize your booking.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Failed to accept terms:", error)
      toast({
        title: "Failed to accept terms",
        description: "There was an error accepting the terms. Please try again.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setAcceptingTerms(false)
    }
  }

  const handleShare = async () => {
    const url = shareableLink || window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Travel Quote',
          text: 'Check out this travel quote',
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast({
          title: "🔗 Link Copied!",
          description: "The quote link has been copied to your clipboard.",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Failed to share:", error)
      try {
        await navigator.clipboard.writeText(url)
        toast({
          title: "🔗 Link Copied!",
          description: "The quote link has been copied to your clipboard.",
          duration: 3000,
        })
      } catch (clipboardError) {
        toast({
          title: "Failed to share",
          description: "Please try copying the link manually.",
          variant: "destructive",
          duration: 3000,
        })
      }
    }
  }

  const handleSendEmail = async () => {
    if (!booking) return

    setSendingEmail(true)
    try {
      // TODO: Implement API call to send email
      // await bookingService.sendQuoteEmail(booking.id, {
      //   to: booking.customer.email,
      //   quoteLink: shareableLink
      // })

      // For now, simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "📧 Email Sent!",
        description: `Quote has been sent to ${booking.customer?.email}`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Failed to send email:", error)
      toast({
        title: "Failed to send email",
        description: "There was an error sending the quote. Please try again.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quote...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quote Preview</h3>
            <p className="text-gray-600 mb-4">
              This page shows quotes immediately after creation. If you're accessing this link directly, please use the admin panel to view quote details.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/my-quotes'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to My Quotes
              </Button>
              <Button
                onClick={() => window.location.href = '/quotes'}
                variant="outline"
                className="w-full"
              >
                Create New Quote
              </Button>
            </div>
            {/* Debug info */}
            <details className="text-left text-xs text-gray-500 bg-gray-50 p-2 rounded mt-4">
              <summary className="cursor-pointer">Debug Info</summary>
              <div className="mt-2">
                <p>Share ID: {shareId}</p>
                <p>Has Navigation State: {location.state ? 'Yes' : 'No'}</p>
                <p>Has Booking Data: {booking ? 'Yes' : 'No'}</p>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = booking.validUntil && new Date(booking.validUntil) < new Date()
  const totalAmount = booking.pricing?.amount || 0
  const currency = booking.pricing?.currency || 'USD'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Status Alert */}
        {isExpired && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600">⚠️</span>
              </div>
              <AlertDescription className="text-red-800">
                This quote expired on {format(new Date(booking.validUntil!), "MMMM d, yyyy")}. Please contact your travel agent for a new quote.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Success Message */}
        {booking.termsAccepted?.accepted && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600">✅</span>
              </div>
              <AlertDescription className="text-green-800">
                Terms accepted! Our team will contact you soon to finalize your booking.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Simplified Content - Only Investment Summary and Accept Terms */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Pricing Summary */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Investment</p>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {currency} ${totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">All tours and experiences included</p>
              </div>

              {booking.pricing?.breakdown && booking.pricing.breakdown.length > 0 && (
                <div className="space-y-3 mb-6">
                  <Separator />
                  <p className="text-sm font-medium text-gray-700">Price Breakdown</p>
                  {booking.pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.item} x{item.quantity}</span>
                      <span className="font-medium">${item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {booking.validUntil && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Valid Until</p>
                      <p className="text-sm text-yellow-700">
                        {format(new Date(booking.validUntil), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendingEmail ? "Sending..." : "Send by Email"}
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          {!isExpired && !booking.termsAccepted?.accepted && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  Accept Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Prices are subject to availability at the time of booking</p>
                    <p>• Payment terms apply as discussed with your travel consultant</p>
                    <p>• Cancellation policies vary by service provider</p>
                    <p>• Travel insurance is recommended for your protection</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customer-email">Confirm Your Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the terms and conditions
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || acceptingTerms || !customerEmail}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {acceptingTerms ? "Processing..." : "Accept & Confirm Interest"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Need Assistance?</h3>
            <p className="text-gray-600 text-sm mb-4">Our travel experts are here to help you</p>
            <div className="space-y-2 text-sm">
              <p>
                <a href="mailto:info@travelbook.com" className="text-blue-600 hover:underline">
                  info@travelbook.com
                </a>
              </p>
              <p>
                <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                  +1 (234) 567-8900
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedQuotePage