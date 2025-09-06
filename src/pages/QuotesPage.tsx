import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, X } from "lucide-react"
import { Quote, QuoteFilters } from "@/types/quote"
import { BookingResponse } from "@/services/bookingService"
import { exportToExcel, exportToPDF } from "@/utils/exportUtils"

// React Query hooks
import { 
  useBookings,
  useUpdateBooking, 
  useDeleteBooking
} from "@/hooks/useBookings"

// Components
import { QuotesHeader } from "@/components/quotes/QuotesHeader"
import { QuotesFilter } from "@/components/quotes/QuotesFilter"
import { QuoteCard } from "@/components/quotes/QuoteCard"

// Helper function to convert BookingResponse to Quote format
const convertBookingToQuote = (booking: any): Quote => {
  // Ensure we always have a unique ID - fallback to timestamp + random if needed
  const uniqueId = booking.id || `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id: uniqueId,
    quoteNumber: booking.bookingNumber || `B-${uniqueId}`,
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
      description: booking.additionalNotes || ''
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
    notes: booking.additionalNotes || '',
    termsAccepted: booking.termsAccepted || { accepted: false },
    metadata: {
      createdAt: new Date(booking.createdAt || Date.now()),
      updatedAt: new Date(booking.updatedAt || Date.now()),
      createdBy: booking.assignedTo || 'Unknown'
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

      {/* Quotes List */}
      {isLoading ? (
        <div className="text-center py-8">Loading quotes...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {sortedQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onView={handleViewQuote}
              onEdit={handleEditQuote}
              onDuplicate={handleDuplicateQuote}
              onConvertToBooking={handleConvertToBooking}
              onGenerateLink={handleGenerateLink}
              onSendEmail={handleSendEmail}
              onDelete={handleDeleteQuote}
            />
          ))}
        </div>
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