import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { bookingService, type BookingResponse } from "@/services/bookingService"

// API Response structure for public booking endpoint
interface ApiResponse {
  success: boolean
  message: string
  data: BookingResponse
  shareableLink: string
  timestamp: string
}
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
  MapPin,
  Calendar,
  Users,
  DollarSign,
  User,
  Building,
  Clock,
  Download,
  Share2,
  CheckCircle,
  Send
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
  const [sendingEmail, setSendingEmail] = useState(false)

  // Fetch quote data from backend API
  const { data: apiResponse, isLoading: loading, error } = useQuery<BookingResponse | ApiResponse>({
    queryKey: ['shared-booking', shareId],
    queryFn: async () => {
      if (!shareId) throw new Error('No share ID provided')

      console.log('Fetching booking data from API:', `/api/booking/${shareId}/`)

      // Try to get booking by share ID from the API
      const response = await bookingService.getSharedBooking(shareId)

      console.log('API Response:', response)
      return response
    },
    enabled: !!shareId,
    retry: (failureCount, error) => {
      console.log('Retry attempt:', failureCount, error)
      return failureCount < 2 // Only retry once
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })

  // Extract booking data from the API response structure
  // The API returns: { success: true, message: "...", data: { booking data }, shareableLink: "..." }
  const booking = apiResponse?.data || apiResponse // Handle both nested and direct response structures

  // Debug logging
  useEffect(() => {
    console.log('SharedQuotePage Debug:', {
      shareId,
      apiEndpoint: `/api/booking/${shareId}/`,
      rawApiResponse: apiResponse,
      extractedBookingData: booking,
      hasBookingData: !!booking,
      bookingId: booking?.id,
      loading,
      error: error?.message || error,
      dataSource: 'Backend API',
      apiSuccess: (apiResponse as ApiResponse)?.success,
      apiMessage: (apiResponse as ApiResponse)?.message
    })
  }, [shareId, apiResponse, booking, loading, error])

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
    // Use the shareId from URL params or the shareableLink from booking data
    const shareableLink = booking?.shareableLink || shareId
    const url = shareableLink ? `${window.location.origin}/quotes/share/${shareableLink}` : window.location.href
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
      // const shareableLink = booking?.shareableLink || shareId
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
                <p>API Endpoint: GET /api/booking/{shareId}/</p>
                <p>Has Booking Data: {booking ? 'Yes' : 'No'}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error?.message || (typeof error === 'string' ? error : 'Unknown error') || 'None'}</p>
                <p>Data Source: Backend API</p>
                {booking && (
                  <div className="mt-2 p-2 bg-green-100 rounded text-green-800">
                    <p>✅ Quote data loaded from API!</p>
                    <p>Customer: {booking.customer?.name}</p>
                    <p>Tours: {booking.tours?.length || 0}</p>
                    <p>Total: {booking.pricing?.currency} {booking.pricing?.amount?.toLocaleString()}</p>
                    <p>Status: {booking.status}</p>
                    <p>Created By: {booking.createdBy?.fullName}</p>
                    <p>API Success: {(apiResponse as ApiResponse)?.success ? 'Yes' : 'No'}</p>
                    <p>API Message: {(apiResponse as ApiResponse)?.message}</p>
                  </div>
                )}
                {error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-red-800">
                    <p>❌ API Error</p>
                    <p>{error?.message || (typeof error === 'string' ? error : 'Unknown error')}</p>
                  </div>
                )}
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

        {/* Complete Quote Information */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quote Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Guest Name</p>
                    <p className="text-lg font-semibold text-gray-800">{booking.customer?.name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-lg font-medium text-gray-700">{booking.customer?.email || 'Not provided'}</p>
                  </div>
                  {booking.customer?.phone && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.phone}</p>
                    </div>
                  )}
                  {booking.customer?.country && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Country</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.country}</p>
                    </div>
                  )}
                  {booking.customer?.language && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Language</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.language}</p>
                    </div>
                  )}
                  {booking.customer?.idNumber && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">ID Number</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.idNumber}</p>
                    </div>
                  )}
                  {booking.customer?.cpf && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">CPF</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.cpf}</p>
                    </div>
                  )}
                  {booking.customer?.address && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.address}</p>
                    </div>
                  )}
                  {booking.customer?.company && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Company</p>
                      <p className="text-lg font-medium text-gray-700">{booking.customer.company}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Booking ID</p>
                    <p className="text-lg font-medium text-gray-700 font-mono">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Lead Source</p>
                    <p className="text-lg font-medium text-gray-700">{booking.leadSource}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Assigned To</p>
                    <p className="text-lg font-medium text-gray-700">{booking.assignedTo}</p>
                  </div>
                  {booking.agency && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Agency</p>
                      <p className="text-lg font-medium text-gray-700">{booking.agency}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Created Date</p>
                    <p className="text-lg font-medium text-gray-700">
                      {format(new Date(booking.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  {booking.tourDetails?.hotel && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Hotel</p>
                      <p className="text-lg font-medium text-gray-700">{booking.tourDetails.hotel}</p>
                    </div>
                  )}
                  {booking.tourDetails?.room && (
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Room</p>
                      <p className="text-lg font-medium text-gray-700">{booking.tourDetails.room}</p>
                    </div>
                  )}
                  {booking.additionalNotes && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Additional Notes</p>
                      <p className="text-lg font-medium text-gray-700">{booking.additionalNotes}</p>
                    </div>
                  )}
                  {booking.quotationComments && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Quotation Comments</p>
                      <p className="text-lg font-medium text-gray-700">{booking.quotationComments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Options & Creator */}
            {(booking.bookingOptions || booking.createdBy) && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {booking.createdBy && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Created By</p>
                          <p className="text-lg font-medium text-gray-700">{booking.createdBy.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Creator Email</p>
                          <p className="text-lg font-medium text-gray-700">{booking.createdBy.email}</p>
                        </div>
                        {booking.createdBy.phone && (
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Creator Phone</p>
                            <p className="text-lg font-medium text-gray-700">{booking.createdBy.phone}</p>
                          </div>
                        )}
                        {booking.createdBy.company && (
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Creator Company</p>
                            <p className="text-lg font-medium text-gray-700">{booking.createdBy.company}</p>
                          </div>
                        )}
                      </>
                    )}
                    {booking.bookingOptions && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Include Payment</p>
                          <Badge variant={booking.includePayment ? "default" : "secondary"}>
                            {booking.includePayment ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Copy Comments</p>
                          <Badge variant={booking.copyComments ? "default" : "secondary"}>
                            {booking.copyComments ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Send Purchase Order</p>
                          <Badge variant={booking.sendPurchaseOrder ? "default" : "secondary"}>
                            {booking.sendPurchaseOrder ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Send Quotation Access</p>
                          <Badge variant={booking.sendQuotationAccess ? "default" : "secondary"}>
                            {booking.sendQuotationAccess ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </>
                    )}
                    {booking.shareableLink && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Shareable Link</p>
                        <p className="text-lg font-medium text-gray-700 font-mono break-all">{booking.shareableLink}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Included Items (Tours) */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  Included Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {booking.tours && booking.tours.length > 0 ? (
                  <div className="space-y-6">
                    {booking.tours.map((tour: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{tour.tourName}</h3>
                            <p className="text-sm text-gray-500">{tour.tourCode}</p>
                          </div>
                          <Badge className={getStatusColor('confirmed')}>
                            Included
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{format(new Date(tour.date), "MMM dd, yyyy")}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-500">Travelers</p>
                              <div className="flex flex-wrap gap-1">
                                {tour.adultPax > 0 && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {tour.adultPax} Adult{tour.adultPax > 1 ? 's' : ''}
                                  </span>
                                )}
                                {tour.childPax > 0 && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    {tour.childPax} Child{tour.childPax > 1 ? 'ren' : ''}
                                  </span>
                                )}
                                {tour.infantPax > 0 && (
                                  <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                                    {tour.infantPax} Infant{tour.infantPax > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-500">Item Price</p>
                              <p className="font-semibold text-green-600">${tour.subtotal?.toLocaleString() || '0'}</p>
                            </div>
                          </div>
                        </div>

                        {tour.pickupAddress && (
                          <div className="border-t pt-3">
                            <p className="text-sm text-gray-500">Pickup Location</p>
                            <p className="font-medium">{tour.pickupAddress}</p>
                            {tour.pickupTime && (
                              <p className="text-sm text-gray-600">Pickup Time: {tour.pickupTime}</p>
                            )}
                          </div>
                        )}

                        {tour.comments && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm text-gray-500">Special Notes</p>
                            <p className="text-sm text-gray-700">{tour.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No items included in this quote</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Total Price Summary */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  Total Price
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
                    {booking.pricing.breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.item} x{item.quantity}</span>
                        <span className="font-medium">${item.total?.toLocaleString() || '0'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quote Validity */}
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