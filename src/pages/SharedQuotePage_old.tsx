import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { format } from "date-fns"
import { useBooking } from "@/hooks/useBookings"
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
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  Building,
  Clock,
  Check,
  Download,
  Share2,
  FileText,
  CheckCircle,
  Cake,
  Baby,
  UserPlus
} from "lucide-react"

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed": case "approved": return "bg-green-100 text-green-800 border-green-200"
    case "pending": case "draft": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "cancelled": case "canceled": return "bg-red-100 text-red-800 border-red-200"
    case "expired": return "bg-gray-100 text-gray-800 border-gray-200"
    default: return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

export function SharedQuotePage() {
  const { shareId } = useParams()
  const { toast } = useToast()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")

  // Use the booking hook to fetch data
  const { data: booking, isLoading: loading, error } = useBooking(shareId!)

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
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Travel Quote',
          text: `Check out this travel quote for ${quote?.tourDetails.destination}`,
          url: url
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
      if (error instanceof Error && !error.message.includes('abort')) {
        toast({
          title: "Failed to share",
          description: "Please try copying the link manually.",
          variant: "destructive",
          duration: 3000,
        })
      }
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quote Not Found</h3>
            <p className="text-gray-600">
              This quote link is invalid or has expired. Please contact your travel agent for assistance.
            </p>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">✈️</span>
            </div>
            <h1 className="text-4xl font-bold">TravelBook</h1>
          </div>
          <p className="text-xl text-white/90">Your Personal Travel Quote</p>
          <div className="mt-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg font-semibold">
              Quote #{booking.bookingNumber || booking.id}
            </Badge>
          </div>
        </div>
      </div>

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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  Prepared For
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Guest Name</p>
                    <p className="text-lg font-semibold text-gray-800">{booking.customer?.name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-lg font-medium text-gray-700">{booking.customer?.email || 'Not provided'}</p>
                  </div>
                  {booking.customer?.phone && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Tour Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium text-lg">{quote.tourDetails.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tour Type</p>
                  <p className="font-medium">
                    {quote.tourDetails.tourType.split("-").map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(" ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Travel Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(quote.tourDetails.startDate, "MMMM d, yyyy")}
                    {quote.tourDetails.endDate && (
                      <> - {format(quote.tourDetails.endDate, "MMMM d, yyyy")}</>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Travelers</p>
                  {quote.tourDetails.passengerBreakdown ? (
                    <div className="space-y-1">
                      {quote.tourDetails.passengerBreakdown.adults > 0 && (
                        <p className="font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {quote.tourDetails.passengerBreakdown.adults} {quote.tourDetails.passengerBreakdown.adults === 1 ? 'Adult' : 'Adults'}
                        </p>
                      )}
                      {quote.tourDetails.passengerBreakdown.children > 0 && (
                        <p className="font-medium flex items-center gap-1">
                          <UserPlus className="w-4 h-4" />
                          {quote.tourDetails.passengerBreakdown.children} {quote.tourDetails.passengerBreakdown.children === 1 ? 'Child' : 'Children'}
                        </p>
                      )}
                      {quote.tourDetails.passengerBreakdown.infants > 0 && (
                        <p className="font-medium flex items-center gap-1">
                          <Baby className="w-4 h-4" />
                          {quote.tourDetails.passengerBreakdown.infants} {quote.tourDetails.passengerBreakdown.infants === 1 ? 'Infant' : 'Infants'}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground pt-1">
                        Total: {quote.tourDetails.passengers} PAX
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {quote.tourDetails.passengers} PAX
                    </p>
                  )}
                </div>
              </div>
              {quote.tourDetails.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Tour Description</p>
                  <p className="text-sm leading-relaxed">{quote.tourDetails.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Investment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.pricing.breakdown && quote.pricing.breakdown.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Item/Service</th>
                          <th className="text-center py-2 text-sm font-medium text-muted-foreground">Quantity</th>
                          <th className="text-right py-2 text-sm font-medium text-muted-foreground">Unit Price</th>
                          <th className="text-right py-2 text-sm font-medium text-muted-foreground">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.pricing.breakdown.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3">
                              <p className="font-medium">{item.item}</p>
                            </td>
                            <td className="text-center py-3">
                              <p>{item.quantity}</p>
                            </td>
                            <td className="text-right py-3">
                              <p>{quote.pricing.currency} ${item.unitPrice.toLocaleString()}</p>
                            </td>
                            <td className="text-right py-3">
                              <p className="font-medium">
                                {quote.pricing.currency} ${item.total.toLocaleString()}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary/5">
                          <td colSpan={3} className="py-3 px-2">
                            <p className="text-lg font-semibold">GRAND TOTAL</p>
                            <p className="text-sm text-muted-foreground">Total Investment</p>
                          </td>
                          <td className="text-right py-3 px-2">
                            <p className="text-xl font-bold text-primary">
                              {quote.pricing.currency} ${quote.pricing.amount.toLocaleString()}
                            </p>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">Total Investment</p>
                      <p className="text-sm text-muted-foreground">Per person prices may apply</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {quote.pricing.currency} ${quote.pricing.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms Acceptance */}
          {!isExpired && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Accept Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quote.termsAccepted?.accepted ? (
                  <Alert className="bg-success/10 border-success/20">
                    <Check className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success-foreground">
                      Quote accepted on {format(quote.termsAccepted.acceptedAt!, "MMMM d, yyyy 'at' h:mm a")}
                      <br />Our team will contact you shortly to finalize your booking.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <AlertDescription className="text-sm">
                        By accepting this quote, you agree to our terms and conditions. 
                        Our travel consultant will contact you to proceed with the booking.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          I have read and accept the terms and conditions. I understand that this quote 
                          is subject to availability and final confirmation.
                        </label>
                      </div>
                      
                      <Button 
                        onClick={handleAcceptTerms} 
                        disabled={!termsAccepted || acceptingTerms}
                        className="w-full"
                        size="lg"
                      >
                        {acceptingTerms ? "Processing..." : "Accept Quote & Start Booking Process"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Quote
            </Button>
          </div>

          {/* Quote Validity */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  This quote is valid until
                </p>
                <p className="text-lg font-semibold">
                  {format(quote.validUntil, "MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prepared by {quote.assignedTo} • {quote.agency || "TravelBook"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-8" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              Our travel experts are here to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
              <a 
                href="mailto:info@travelbook.com" 
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Mail className="w-4 h-4" />
                info@travelbook.com
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Phone className="w-4 h-4" />
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}