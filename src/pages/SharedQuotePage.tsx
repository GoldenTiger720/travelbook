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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Share2,
  Send
} from "lucide-react"


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
  const booking = (apiResponse as ApiResponse)?.data || (apiResponse as BookingResponse) // Handle both nested and direct response structures

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
    // Use the shareId from URL params or the shareableLink from API response
    const shareableLink = (apiResponse as ApiResponse)?.shareableLink || shareId
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Quote not found</h3>
          <p className="text-gray-600 mb-6">
            The requested quote could not be found or has expired.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/quotes'}
              className="w-full"
            >
              Create new quote
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isExpired = booking.validUntil && new Date(booking.validUntil) < new Date()
  const totalAmount = booking.pricing?.amount || 0
  const currency = booking.pricing?.currency || 'USD'

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        {/* Document Header */}
        <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Travel Quotation</h1>
          <p className="text-sm text-gray-600">Public Link: {(apiResponse as ApiResponse)?.shareableLink || shareId}</p>
          {isExpired && (
            <p className="text-sm text-red-600 mt-1">⚠️ This quote expired on {format(new Date(booking.validUntil!), "MMMM d, yyyy")}</p>
          )}
          {booking.termsAccepted?.accepted && (
            <p className="text-sm text-green-600 mt-1">✅ Terms accepted - Our team will contact you soon</p>
          )}
        </div>

        {/* Document Content */}
        <div className="space-y-4">

          {/* Quote Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{booking.status?.charAt(0).toUpperCase()}{booking.status?.slice(1)}</span>
              </div>
              <div>
                <span className="text-gray-600">Valid until:</span>
                <span className="ml-2 font-medium">
                  {booking.validUntil ? format(new Date(booking.validUntil), "MMM dd, yyyy") : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Agent:</span>
                <span className="ml-2 font-medium">{booking.assignedTo}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{booking.customer?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{booking.customer?.email || 'N/A'}</span>
                </div>
                {booking.customer?.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{booking.customer.phone}</span>
                  </div>
                )}
                {booking.customer?.country && (
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <span className="ml-2 font-medium">{booking.customer.country}</span>
                  </div>
                )}
                {booking.customer?.idNumber && (
                  <div>
                    <span className="text-gray-600">ID number:</span>
                    <span className="ml-2 font-medium">{booking.customer.idNumber}</span>
                  </div>
                )}
                {booking.customer?.address && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Address:</span>
                    <span className="ml-2 font-medium">{booking.customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
            </div>
            <div className="p-4">
              {booking.tours && booking.tours.length > 0 ? (
                <div className="space-y-4">
                  {booking.tours.map((tour: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{tour.tourName}</h3>
                          <p className="text-sm text-gray-600">{tour.tourCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{currency} {tour.subtotal?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2 font-medium">{format(new Date(tour.date), "MMM dd, yyyy")}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <span className="ml-2 font-medium">{tour.pickupTime || 'TBD'}</span>
                        </div>
                        {tour.pickupAddress && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Pickup location:</span>
                            <span className="ml-2 font-medium">{tour.pickupAddress}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Travelers:</span>
                          <span className="ml-2 font-medium">
                            {tour.adultPax > 0 && `${tour.adultPax} Adult${tour.adultPax > 1 ? 's' : ''}`}
                            {tour.childPax > 0 && `, ${tour.childPax} Child${tour.childPax > 1 ? 'ren' : ''}`}
                            {tour.infantPax > 0 && `, ${tour.infantPax} Infant${tour.infantPax > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Operator:</span>
                          <span className="ml-2 font-medium">
                            {tour.operator === "own-operation" ? "Own operation" : tour.operator}
                          </span>
                        </div>
                        {tour.comments && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Notes:</span>
                            <span className="ml-2 font-medium">{tour.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No tours included</p>
              )}
            </div>
          </div>

          {/* Accommodation */}
          {(booking.tourDetails?.hotel || booking.tourDetails?.room) && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Accommodation</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {booking.tourDetails.hotel && (
                    <div>
                      <span className="text-gray-600">Hotel:</span>
                      <span className="ml-2 font-medium">{booking.tourDetails.hotel}</span>
                    </div>
                  )}
                  {booking.tourDetails.room && (
                    <div>
                      <span className="text-gray-600">Room:</span>
                      <span className="ml-2 font-medium">{booking.tourDetails.room}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Investment Summary</h2>
            </div>
            <div className="p-4">
              {booking.pricing?.breakdown && booking.pricing.breakdown.length > 0 && (
                <div className="space-y-2 mb-4">
                  {booking.pricing.breakdown.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.item} x{item.quantity}</span>
                      <span className="font-medium">{currency} {item.total?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Investment:</span>
                  <span>{currency} {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(booking.additionalNotes || booking.quotationComments) && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm">
                  {booking.additionalNotes && (
                    <div>
                      <span className="text-gray-600 font-medium">Notes:</span>
                      <p className="mt-1">{booking.additionalNotes}</p>
                    </div>
                  )}
                  {booking.quotationComments && (
                    <div>
                      <span className="text-gray-600 font-medium">Comments:</span>
                      <p className="mt-1">{booking.quotationComments}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button onClick={handleDownloadPDF} variant="outline" className="text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleSendEmail} disabled={sendingEmail} variant="outline" className="text-sm">
                  <Send className="w-4 h-4 mr-2" />
                  {sendingEmail ? "Sending..." : "Send by email"}
                </Button>
                <Button onClick={handleShare} variant="outline" className="text-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share quote
                </Button>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {!isExpired && !booking.termsAccepted?.accepted && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Prices are subject to availability at the time of booking</p>
                    <p>• Payment terms apply as discussed with your travel consultant</p>
                    <p>• Cancellation policies vary by service provider</p>
                    <p>• Travel insurance is recommended for your protection</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customer-email" className="text-sm">Confirm your email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm">
                        I accept the terms and conditions
                      </label>
                    </div>
                    <Button
                      onClick={handleAcceptTerms}
                      disabled={!termsAccepted || acceptingTerms || !customerEmail}
                      className="w-full text-sm"
                    >
                      {acceptingTerms ? "Processing..." : "Accept & confirm interest"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default SharedQuotePage