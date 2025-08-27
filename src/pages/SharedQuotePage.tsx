import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { format } from "date-fns"
import { quoteService } from "@/services/quoteService"
import { Quote } from "@/types/quote"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
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
  CheckCircle
} from "lucide-react"

export function SharedQuotePage() {
  const { shareId } = useParams()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")

  useEffect(() => {
    if (shareId) {
      loadQuoteByShareId()
    }
  }, [shareId])

  const loadQuoteByShareId = async () => {
    setLoading(true)
    try {
      const shareableLink = `https://travelbook.com/quotes/share/${shareId}`
      const data = await quoteService.getQuoteByShareableLink(shareableLink)
      setQuote(data)
      if (data?.termsAccepted?.accepted) {
        setTermsAccepted(true)
      }
      if (data?.customer?.email) {
        setCustomerEmail(data.customer.email)
      }
    } catch (error) {
      console.error("Failed to load quote:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTerms = async () => {
    if (!quote || !termsAccepted) return
    
    setAcceptingTerms(true)
    try {
      const acceptedBy = customerEmail || quote.customer.email
      const success = await quoteService.acceptTerms(quote.id, acceptedBy)
      if (success) {
        await loadQuoteByShareId()
        alert("Terms accepted successfully! Our team will contact you soon.")
      }
    } catch (error) {
      console.error("Failed to accept terms:", error)
      alert("Failed to accept terms. Please try again.")
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
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Failed to share:", error)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quote Not Found</h3>
            <p className="text-muted-foreground">
              This quote link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = quote.validUntil < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">TravelBook</h1>
          <p className="text-primary-foreground/80">Your Travel Quote</p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Status Alert */}
        {isExpired && (
          <Alert className="mb-6 border-destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This quote expired on {format(quote.validUntil, "MMMM d, yyyy")}
            </AlertDescription>
          </Alert>
        )}

        {/* Quote Number */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="text-lg px-4 py-1">
            Quote #{quote.quoteNumber}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Prepared For
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{quote.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{quote.customer.email}</p>
                </div>
                {quote.customer.company && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{quote.customer.company}</p>
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
                  <p className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quote.tourDetails.passengers} PAX
                  </p>
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
                  <div className="space-y-3">
                    {quote.pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-start py-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.item}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.quantity > 1 ? 'units' : 'unit'} × {quote.pricing.currency} ${item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium ml-4">
                          {quote.pricing.currency} ${item.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </>
              ) : null}
              
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