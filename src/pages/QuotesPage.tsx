import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, X, Eye, Edit, Trash2 } from "lucide-react"
import { Quote, QuoteFilters } from "@/types/quote"
import { BookingResponse } from "@/services/bookingService"
import { exportToExcel, exportToPDF } from "@/utils/exportUtils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// React Query hooks
import { 
  useBookings,
  useUpdateBooking, 
  useDeleteBooking
} from "@/hooks/useBookings"

// Components
import { QuotesHeader } from "@/components/quotes/QuotesHeader"
import { QuotesFilter } from "@/components/quotes/QuotesFilter"

// Helper function to convert BookingResponse to Quote format
const convertBookingToQuote = (booking: any): Quote => {
  // Ensure we always have a unique ID - fallback to timestamp + random if needed
  const uniqueId = booking.id || `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Generate quote number based on tours data
  const primaryTour = booking.tours && booking.tours[0]
  const quoteNumber = primaryTour?.tourCode ? `${primaryTour.tourCode}-${uniqueId.slice(0, 8)}` : `B-${uniqueId.slice(0, 8)}`
  
  return {
    id: uniqueId,
    quoteNumber: quoteNumber,
    customer: {
      name: booking.customer?.name || 'Unknown Customer',
      email: booking.customer?.email || '',
      phone: booking.customer?.phone || '',
      company: booking.customer?.company || ''
    },
    tourDetails: {
      destination: booking.tourDetails?.destination || 'Unknown Destination',
      tourType: booking.tourDetails?.tourType || 'unknown',
      startDate: new Date(booking.tourDetails?.startDate || Date.now()),
      endDate: new Date(booking.tourDetails?.endDate || Date.now()),
      passengers: booking.tourDetails?.passengers || 0,
      passengerBreakdown: booking.tourDetails?.passengerBreakdown || {
        adults: 0,
        children: 0,
        infants: 0
      },
      description: booking.additionalNotes || booking.quotationComments || ''
    },
    pricing: {
      amount: booking.pricing?.amount || 0,
      currency: booking.pricing?.currency || 'USD',
      breakdown: booking.pricing?.breakdown || []
    },
    status: booking.status || 'pending',
    leadSource: booking.leadSource || 'unknown',
    assignedTo: booking.assignedTo || 'Unassigned',
    agency: booking.agency || null,
    validUntil: new Date(booking.validUntil || Date.now()),
    shareableLink: '',
    notes: booking.additionalNotes || booking.quotationComments || '',
    termsAccepted: {
      accepted: booking.termsAccepted?.accepted || false,
      acceptedBy: booking.termsAccepted?.acceptedBy,
      acceptedAt: booking.termsAccepted?.acceptedAt ? new Date(booking.termsAccepted.acceptedAt) : undefined
    },
    metadata: {
      createdAt: new Date(booking.createdAt || Date.now()),
      updatedAt: new Date(booking.updatedAt || Date.now()),
      createdBy: booking.createdBy?.fullName || booking.assignedTo || 'Unknown'
    }
  }
}

const QuotesPage = () => {
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState<QuoteFilters>({
    search: "",
    status: "all",
    tourType: "all",
    leadSource: "all",
    assignedTo: "all",
    agency: "all",
    dateFrom: undefined,
    dateTo: undefined,
    minAmount: undefined,
    maxAmount: undefined
  })

  const [sortBy, setSortBy] = useState<"date" | "amount" | "customer">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // React Query hooks - fetch bookings and convert to quotes for UI
  const { data: bookings = [], isLoading } = useBookings()
  const updateBookingMutation = useUpdateBooking()
  const deleteBookingMutation = useDeleteBooking()

  // Convert bookings to quotes format for the UI
  const quotes = bookings.map(convertBookingToQuote)

  // Derived values
  const uniqueValues = {
    statuses: ["all", ...Array.from(new Set(quotes.map(q => q.status)))],
    tourTypes: ["all", ...Array.from(new Set(quotes.map(q => q.tourDetails.tourType)))],
    leadSources: ["all", ...Array.from(new Set(quotes.map(q => q.leadSource)))],
    assignees: ["all", ...Array.from(new Set(quotes.map(q => q.assignedTo)))],
    agencies: ["all", ...Array.from(new Set(quotes.filter(q => q.agency).map(q => q.agency!)))]
  }

  const sortedQuotes = [...quotes].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "date":
        comparison = a.tourDetails.startDate.getTime() - b.tourDetails.startDate.getTime()
        break
      case "amount":
        comparison = a.pricing.amount - b.pricing.amount
        break
      case "customer":
        comparison = a.customer.name.localeCompare(b.customer.name)
        break
    }
    
    return sortOrder === "asc" ? comparison : -comparison
  })

  const totalValue = sortedQuotes.reduce((sum, quote) => {
    if (quote.pricing.currency === 'USD') {
      return sum + quote.pricing.amount
    }
    return sum
  }, 0)

  // Handlers
  const handleEditQuote = (quote: Quote) => {
    navigate(`/quotes/${quote.id}/edit`)
  }

  const handleViewQuote = (quote: Quote) => {
    window.open(`/quotes/${quote.id}`, '_blank')
  }

  const handleDuplicateQuote = (quote: Quote) => {
    // Duplicate booking functionality
    console.log('Duplicate booking clicked:', quote.id)
  }

  const handleDeleteQuote = (quote: Quote) => {
    if (confirm(`Are you sure you want to delete booking ${quote.quoteNumber}?`)) {
      deleteBookingMutation.mutate(quote.id)
    }
  }

  const handleConvertToBooking = async (quote: Quote) => {
    // This function is not needed since we're already showing bookings
    // But we'll keep it for compatibility - maybe convert to a different status
    console.log('Convert to booking clicked - already a booking:', quote.id)
  }

  const handleGenerateLink = (quote: Quote) => {
    // Generate shareable link functionality
    console.log('Generate link clicked for booking:', quote.id)
  }

  const handleSendEmail = (quote: Quote) => {
    // Send email functionality  
    console.log('Send email clicked for booking:', quote.id)
  }


  const exportQuotes = (format: "excel" | "pdf") => {
    try {
      const exportData = { quotes: sortedQuotes, filters }
      
      if (format === "excel") {
        exportToExcel(exportData)
      } else {
        exportToPDF(exportData)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }


  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      tourType: "all",
      leadSource: "all",
      assignedTo: "all",
      agency: "all",
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined
    })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== ""
    if (key === "dateFrom" || key === "dateTo") return value !== undefined
    if (key === "minAmount" || key === "maxAmount") return value !== undefined
    return value !== "all"
  }).length

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <QuotesHeader
        onExport={exportQuotes}
      />

      {/* Search and Filters */}
      <QuotesFilter
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        uniqueValues={uniqueValues}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground px-2 sm:px-0">
        <p>
          Showing {sortedQuotes.length} quotes
        </p>
        <p className="font-medium">
          Total: ${totalValue.toLocaleString()} USD
        </p>
      </div>

      {/* Quotes Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading quotes...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Quote #</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Destination</th>
                    <th className="text-left p-4 font-medium">Tour Date</th>
                    <th className="text-left p-4 font-medium">PAX</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Assigned To</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{quote.quoteNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.leadSource}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{quote.customer.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {quote.customer.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{quote.tourDetails.destination}</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.tourDetails.tourType}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {format(quote.tourDetails.startDate, "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.tourDetails.startDate !== quote.tourDetails.endDate && 
                            `- ${format(quote.tourDetails.endDate, "MMM dd, yyyy")}`
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{quote.tourDetails.passengers}</div>
                        <div className="text-sm text-muted-foreground">
                          A:{quote.tourDetails.passengerBreakdown.adults} 
                          C:{quote.tourDetails.passengerBreakdown.children} 
                          I:{quote.tourDetails.passengerBreakdown.infants}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {quote.pricing.currency} {quote.pricing.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={cn(
                          "text-xs",
                          quote.status === 'confirmed' && "bg-green-100 text-green-800",
                          quote.status === 'pending' && "bg-yellow-100 text-yellow-800",
                          quote.status === 'cancelled' && "bg-red-100 text-red-800"
                        )}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{quote.assignedTo}</div>
                        {quote.agency && (
                          <div className="text-sm text-muted-foreground">{quote.agency}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {format(quote.metadata.createdAt, "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {quote.metadata.createdBy}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View details"
                            onClick={() => handleViewQuote(quote)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit quote"
                            onClick={() => handleEditQuote(quote)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            title="Delete quote"
                            onClick={() => handleDeleteQuote(quote)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && sortedQuotes.length === 0 && (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No quotes found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
              {filters.search || activeFilterCount > 0
                ? "Try adjusting your filters or search terms"
                : "Start by creating your first quote"}
            </p>
            {filters.search || activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} size="sm" className="sm:size-default">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default QuotesPage