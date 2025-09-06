import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, X } from "lucide-react"
import { Quote, QuoteFilters } from "@/types/quote"
import { exportToExcel, exportToPDF } from "@/utils/exportUtils"

// React Query hooks
import { 
  useQuotes, 
  useUpdateQuote, 
  useDeleteQuote, 
  useDuplicateQuote, 
  useGenerateShareableLink, 
  useSendQuoteByEmail 
} from "@/hooks/useQuotes"
import { useConvertQuoteToBooking } from "@/hooks/useBookings"

// Components
import { QuotesHeader } from "@/components/quotes/QuotesHeader"
import { QuotesFilter } from "@/components/quotes/QuotesFilter"
import { QuoteCard } from "@/components/quotes/QuoteCard"

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

  // React Query hooks
  const { data: quotes = [], isLoading } = useQuotes(filters)
  const updateQuoteMutation = useUpdateQuote()
  const deleteQuoteMutation = useDeleteQuote()
  const duplicateQuoteMutation = useDuplicateQuote()
  const generateLinkMutation = useGenerateShareableLink()
  const sendEmailMutation = useSendQuoteByEmail()
  const convertToBookingMutation = useConvertQuoteToBooking()

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
    duplicateQuoteMutation.mutate(quote.id)
  }

  const handleDeleteQuote = (quote: Quote) => {
    if (confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      deleteQuoteMutation.mutate(quote.id)
    }
  }

  const handleConvertToBooking = async (quote: Quote) => {
    const bookingData = {
      customer: {
        name: quote.customer.name,
        email: quote.customer.email,
        phone: quote.customer.phone || "",
        company: quote.customer.company || "",
        language: "en",
        country: "",
        idNumber: "",
        cpf: "",
        address: ""
      },
      tours: [],
      tourDetails: {
        destination: quote.tourDetails.destination,
        tourType: quote.tourDetails.tourType,
        startDate: quote.tourDetails.startDate,
        endDate: quote.tourDetails.endDate || quote.tourDetails.startDate,
        passengers: quote.tourDetails.passengers,
        passengerBreakdown: quote.tourDetails.passengerBreakdown || {
          adults: quote.tourDetails.passengers,
          children: 0,
          infants: 0
        },
        hotel: "",
        room: ""
      },
      pricing: {
        amount: quote.pricing.amount,
        currency: quote.pricing.currency,
        breakdown: quote.pricing.breakdown || []
      },
      leadSource: quote.leadSource,
      assignedTo: quote.assignedTo,
      agency: quote.agency,
      status: "confirmed",
      validUntil: quote.validUntil,
      additionalNotes: quote.notes || "",
      hasMultipleAddresses: false,
      termsAccepted: quote.termsAccepted || { accepted: false },
      quotationComments: "",
      includePayment: false,
      copyComments: true,
      sendPurchaseOrder: true,
      sendQuotationAccess: true
    }

    // Convert to booking
    convertToBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        // Update quote status to converted
        updateQuoteMutation.mutate({ 
          id: quote.id, 
          data: { ...quote, status: 'converted' } 
        })
      }
    })
  }

  const handleGenerateLink = (quote: Quote) => {
    generateLinkMutation.mutate(quote.id)
  }

  const handleSendEmail = (quote: Quote) => {
    sendEmailMutation.mutate({ id: quote.id, email: quote.customer.email })
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