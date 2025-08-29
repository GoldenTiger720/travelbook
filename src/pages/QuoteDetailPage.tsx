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
  Globe,
  CheckCircle,
  Cake
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
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)

  useEffect(() => {
    if (quoteId) {
      loadQuote()
    }
  }, [quoteId])

  const loadQuote = async () => {
    setLoading(true)
    try {
      const data = await quoteService.getQuoteById(quoteId!)
      setQuote(data)
      if (data?.termsAccepted?.accepted) {
        setTermsAccepted(true)
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
      const success = await quoteService.acceptTerms(quote.id, quote.customer.name)
      if (success) {
        await loadQuote()
      }
    } catch (error) {
      console.error("Failed to accept terms:", error)
    } finally {
      setAcceptingTerms(false)
    }
  }

  const handleShare = async () => {
    if (!quote) return
    
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleDownloadPDF = () => {
    if (!quote) return
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

  if (!quote) {
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

  const isExpired = quote.validUntil < new Date()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Travel Quote</h1>
          <p className="text-muted-foreground">Quote #{quote.quoteNumber}</p>
        </div>

        {/* Status Alert */}
        {isExpired && (
          <Alert className="mb-6 border-destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This quote expired on {format(quote.validUntil, "MMMM d, yyyy")}
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
                <Badge className={getStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{quote.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {quote.customer.email}
                  </p>
                </div>
                {quote.customer.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {quote.customer.phone}
                    </p>
                  </div>
                )}
                {quote.customer.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {quote.customer.company}
                    </p>
                  </div>
                )}
                {quote.customer.birthday && (
                  <div>
                    <p className="text-sm text-muted-foreground">Birthday</p>
                    <p className="font-medium flex items-center gap-1">
                      <Cake className="w-4 h-4" />
                      {format(new Date(quote.customer.birthday), "PPP")}
                    </p>
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
                  <p className="font-medium">{quote.tourDetails.destination}</p>
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
                  <p className="text-sm text-muted-foreground">Passengers</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quote.tourDetails.passengers} PAX
                  </p>
                </div>
              </div>
              {quote.tourDetails.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{quote.tourDetails.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.pricing.breakdown && quote.pricing.breakdown.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {quote.pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <div>
                          <p className="font-medium">{item.item}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {quote.pricing.currency} ${item.unitPrice}
                          </p>
                        </div>
                        <p className="font-medium">
                          {quote.pricing.currency} ${item.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </>
              ) : null}
              
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {quote.pricing.currency} ${quote.pricing.amount.toLocaleString()}
                </p>
              </div>
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
                <p className="text-sm">{format(quote.metadata.createdAt, "MMMM d, yyyy")}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="text-sm font-medium">
                  {format(quote.validUntil, "MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Prepared By</p>
                <p className="text-sm">{quote.assignedTo}</p>
              </div>
              {quote.agency && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Agency</p>
                  <p className="text-sm">{quote.agency}</p>
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
                {quote.termsAccepted?.accepted ? (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Terms accepted by {quote.termsAccepted.acceptedBy} on{" "}
                      {format(quote.termsAccepted.acceptedAt!, "MMMM d, yyyy 'at' h:mm a")}
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
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Quote
                </Button>
                {!isExpired && !quote.termsAccepted?.accepted && (
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