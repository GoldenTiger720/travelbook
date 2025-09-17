import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
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
  Globe,
  CheckCircle,
  Cake,
  Baby,
  UserPlus
} from "lucide-react"

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-success text-success-foreground"
    case "pending": return "bg-warning text-warning-foreground"
    case "sent": return "bg-primary text-primary-foreground"
    case "draft": return "bg-secondary text-secondary-foreground"
    case "converted": return "bg-purple-500 text-white"
    case "expired": return "bg-destructive text-destructive-foreground"
    case "cancelled": return "bg-muted text-muted-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

export function QuoteDetailPage() {
  const { quoteId } = useParams()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)

  // Use the booking hook to fetch data
  const { data: booking, isLoading: loading, error } = useBooking(quoteId!)

  // Get shareable link from URL params
  const shareableLink = searchParams.get('shareLink') || `${window.location.origin}/quotes/share/${quoteId}`

  useEffect(() => {
    if (booking?.termsAccepted?.accepted) {
      setTermsAccepted(true)
    }
  }, [booking])

  const handleAcceptTerms = async () => {
    if (!booking || !termsAccepted) return

    setAcceptingTerms(true)
    try {
      // Update this to use booking service when available
      // const success = await bookingService.acceptTerms(booking.id, booking.customer.name)
      // For now, just show success
      toast({
        title: "✅ Terms Accepted!",
        description: "Terms have been accepted successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to accept terms:", error)
    } finally {
      setAcceptingTerms(false)
    }
  }

  const handleShare = async () => {
    if (!booking) return

    try {
      await navigator.clipboard.writeText(shareableLink)
      toast({
        title: "✨ Link Copied!",
        description: "The shareable quote link has been copied to your clipboard.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleDownloadPDF = () => {
    if (!booking) return
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quote Not Found</h3>
            <p className="text-muted-foreground">
              The quote you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = booking.validUntil && new Date(booking.validUntil) < new Date()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Travel Quote</h1>
          <p className="text-muted-foreground">Quote #{booking.bookingNumber || booking.id}</p>
        </div>

        {/* Shareable Link Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Shareable Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this link with your customer to let them view the quote details.
            </p>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {isExpired && (
          <Alert className="mb-6 border-destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This quote expired on {format(new Date(booking.validUntil!), "MMMM d, yyyy")}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </span>
                <Badge className={getStatusColor(booking.status || 'draft')}>
                  {booking.status || 'draft'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{booking.customer?.name || 'No name provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {booking.customer?.email || 'No email provided'}
                  </p>
                </div>
                {booking.customer?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {booking.customer.phone}
                    </p>
                  </div>
                )}
                {booking.customer?.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {booking.customer.company}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tours Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Tour Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.tours && booking.tours.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Tour</th>
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-center py-2 text-sm font-medium text-muted-foreground">Adults</th>
                        <th className="text-center py-2 text-sm font-medium text-muted-foreground">Children</th>
                        <th className="text-center py-2 text-sm font-medium text-muted-foreground">Infants</th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.tours.map((tour, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{tour.tourName}</p>
                              <p className="text-sm text-muted-foreground">{tour.tourCode}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(tour.date), "MMM dd, yyyy")}
                            </p>
                          </td>
                          <td className="py-3 text-center">
                            <p className="font-medium">{tour.adultPax}</p>
                            <p className="text-xs text-muted-foreground">${tour.adultPrice.toLocaleString()}</p>
                          </td>
                          <td className="py-3 text-center">
                            <p className="font-medium">{tour.childPax}</p>
                            <p className="text-xs text-muted-foreground">${tour.childPrice.toLocaleString()}</p>
                          </td>
                          <td className="py-3 text-center">
                            <p className="font-medium">{tour.infantPax}</p>
                            <p className="text-xs text-muted-foreground">${tour.infantPrice.toLocaleString()}</p>
                          </td>
                          <td className="py-3 text-right">
                            <p className="font-semibold">${tour.subtotal.toLocaleString()}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No tours added to this quote</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    {booking.pricing?.currency || 'USD'} ${(booking.pricing?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {booking.pricing?.breakdown && booking.pricing.breakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Price Breakdown:</p>
                  {booking.pricing.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-muted/20 last:border-b-0">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}</p>
                      </div>
                      <p className="font-medium">${item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quote Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Created On</p>
                <p className="text-sm">{format(new Date(booking.createdAt || Date.now()), "MMMM d, yyyy")}</p>
              </div>
              {booking.validUntil && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="text-sm font-medium">
                    {format(new Date(booking.validUntil), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Prepared By</p>
                <p className="text-sm">{booking.assignedTo || 'Travel Agent'}</p>
              </div>
              {booking.agency && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Agency</p>
                  <p className="text-sm">{booking.agency}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms Acceptance */}
          {!isExpired && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.termsAccepted?.accepted ? (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Terms accepted by {booking.termsAccepted.acceptedBy} on{" "}
                      {booking.termsAccepted.acceptedAt ? format(new Date(booking.termsAccepted.acceptedAt), "MMMM d, yyyy 'at' h:mm a") : 'Unknown date'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Prices are subject to availability at the time of booking</p>
                      <p>• Payment terms apply as discussed with your travel consultant</p>
                      <p>• Cancellation policies vary by service provider</p>
                      <p>• Travel insurance is recommended</p>
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
                    <Button 
                      onClick={handleAcceptTerms} 
                      disabled={!termsAccepted || acceptingTerms}
                      className="w-full"
                    >
                      {acceptingTerms ? "Processing..." : "Accept Terms & Conditions"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Share Link
                </Button>
                {!isExpired && !booking.termsAccepted?.accepted && (
                  <Button className="flex-1 bg-primary">
                    <Check className="w-4 h-4 mr-2" />
                    Book This Tour
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>For questions about this quote, please contact us</p>
          <p className="mt-1">
            <a href="mailto:info@travelbook.com" className="hover:underline">
              info@travelbook.com
            </a>
            {" • "}
            <a href="tel:+1234567890" className="hover:underline">
              +1 234 567 890
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}