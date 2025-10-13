import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, X, Edit, Trash2 } from "lucide-react";
import { Quote, QuoteFilters } from "@/types/quote";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// React Query hooks
import {
  useBookings,
  useUpdateBooking,
  useDeleteBooking,
} from "@/hooks/useBookings";

// Components
import { QuotesHeader } from "@/components/quotes/QuotesHeader";
import { QuotesFilter } from "@/components/quotes/QuotesFilter";

// Helper function to map backend status to display status
const getDisplayStatus = (status: string, validUntil?: Date): Quote['status'] => {
  // Check if expired first
  if (validUntil && new Date(validUntil) < new Date()) {
    return "expired";
  }

  // Map status values
  switch (status?.toLowerCase()) {
    case "pending":
      return "pending";
    case "draft":
      return "draft";
    case "sent":
      return "sent";
    case "confirmed":
    case "approved":
      return "approved";
    case "converted":
      return "converted";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "draft";
  }
};

// Helper function to convert BookingResponse to Quote format
const convertBookingToQuote = (booking: any): Quote => {
  // Use the ID from the booking (backend returns proper UUID)
  const uniqueId = booking.id;

  // Generate quote number based on tours data
  const primaryTour = booking.tours && booking.tours[0];
  const quoteNumber = primaryTour?.tourCode
    ? `${primaryTour.tourCode}-${uniqueId.slice(0, 8)}`
    : `B-${uniqueId.slice(0, 8)}`;

  return {
    id: uniqueId,
    quoteNumber: quoteNumber,
    customer: {
      name: booking.customer?.name || "Unknown Customer",
      email: booking.customer?.email || "",
      phone: booking.customer?.phone || "",
      company: booking.customer?.company || "",
    },
    tourDetails: {
      destination: booking.tourDetails?.destination || "Unknown Destination",
      tourType: booking.tourDetails?.tourType || "unknown",
      startDate: new Date(booking.tourDetails?.startDate || Date.now()),
      endDate: new Date(booking.tourDetails?.endDate || Date.now()),
      passengers: booking.tourDetails?.passengers || 0,
      passengerBreakdown: booking.tourDetails?.passengerBreakdown || {
        adults: 0,
        children: 0,
        infants: 0,
      },
      description: booking.additionalNotes || booking.quotationComments || "",
    },
    pricing: {
      amount: booking.pricing?.amount || 0,
      currency: booking.pricing?.currency || "USD",
      breakdown: booking.pricing?.breakdown || [],
    },
    status: getDisplayStatus(booking.status, booking.validUntil),
    leadSource: booking.leadSource || "unknown",
    assignedTo: booking.assignedTo || "Unassigned",
    agency: booking.agency || null,
    validUntil: new Date(booking.validUntil || Date.now()),
    shareableLink: "",
    notes: booking.additionalNotes || booking.quotationComments || "",
    termsAccepted: {
      accepted: booking.termsAccepted?.accepted || false,
      acceptedBy: booking.termsAccepted?.acceptedBy,
      acceptedAt: booking.termsAccepted?.acceptedAt
        ? new Date(booking.termsAccepted.acceptedAt)
        : undefined,
    },
    metadata: {
      createdAt: new Date(booking.createdAt || Date.now()),
      updatedAt: new Date(booking.updatedAt || Date.now()),
      createdBy: booking.createdBy?.fullName || booking.assignedTo || "Unknown",
    },
  };
};

const QuotesPage = () => {
  const navigate = useNavigate();

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
    maxAmount: undefined,
  });

  const [sortBy, setSortBy] = useState<"date" | "amount" | "customer">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // React Query hooks - fetch bookings and convert to quotes for UI
  const { data: bookings = [], isLoading } = useBookings();
  const deleteBookingMutation = useDeleteBooking();

  // Convert bookings to quotes format for the UI
  const quotes = bookings.map(convertBookingToQuote);

  // Derived values
  const uniqueValues = {
    statuses: ["all", ...Array.from(new Set(quotes.map((q) => q.status)))],
    tourTypes: [
      "all",
      ...Array.from(new Set(quotes.map((q) => q.tourDetails.tourType))),
    ],
    leadSources: [
      "all",
      ...Array.from(new Set(quotes.map((q) => q.leadSource))),
    ],
    assignees: ["all", ...Array.from(new Set(quotes.map((q) => q.assignedTo)))],
    agencies: [
      "all",
      ...Array.from(
        new Set(quotes.filter((q) => q.agency).map((q) => q.agency!))
      ),
    ],
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          a.tourDetails.startDate.getTime() - b.tourDetails.startDate.getTime();
        break;
      case "amount":
        comparison = a.pricing.amount - b.pricing.amount;
        break;
      case "customer":
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalValue = sortedQuotes.reduce((sum, quote) => {
    if (quote.pricing.currency === "USD") {
      return sum + quote.pricing.amount;
    }
    return sum;
  }, 0);

  // Handlers
  const handleEditQuote = (quote: Quote) => {
    navigate(`/quotes/${quote.id}/edit`);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete booking ${quote.quoteNumber}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      deleteBookingMutation.mutate(quote.id);
    }
  };

  const exportQuotes = (format: "excel" | "pdf") => {
    try {
      const exportData = { quotes: sortedQuotes, filters };

      if (format === "excel") {
        exportToExcel(exportData);
      } else {
        exportToPDF(exportData);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

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
      maxAmount: undefined,
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== "";
    if (key === "dateFrom" || key === "dateTo") return value !== undefined;
    if (key === "minAmount" || key === "maxAmount") return value !== undefined;
    return value !== "all";
  }).length;


  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <QuotesHeader onExport={exportQuotes} />

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
        <p>Showing {sortedQuotes.length} quotes</p>
        <p className="font-medium">Total: ${totalValue.toLocaleString()} USD</p>
      </div>

      {/* Quotes List - Responsive Design */}
      {isLoading ? (
        <div className="text-center py-8">Loading quotes...</div>
      ) : (
        <>
          {/* Desktop Table View (hidden on mobile) */}
          <Card className="hidden lg:block">
            <CardContent className="p-0">
              <div className="w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-2 font-medium text-xs w-[20%]">
                        Customer
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Tour Date
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Created
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Expires
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[8%]">
                        PAX
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Total Value
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Status
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuotes.map((quote) => (
                      <tr
                        key={quote.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-2">
                          <div className="font-medium text-xs truncate">
                            {quote.customer.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {quote.customer.email}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs">
                            {format(quote.tourDetails.startDate, "MMM dd")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(quote.tourDetails.startDate, "yyyy")}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs">
                            {format(quote.metadata.createdAt, "MMM dd")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(quote.metadata.createdAt, "yyyy")}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs">
                            {format(quote.validUntil, "MMM dd")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(quote.validUntil, "yyyy")}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs">
                            {quote.tourDetails.passengers}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            A:{quote.tourDetails.passengerBreakdown.adults}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs">
                            {quote.pricing.currency}{" "}
                            {quote.pricing.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge
                            className={cn(
                              "text-[10px] px-1 py-0.5",
                              quote.status === "approved" &&
                                "bg-green-100 text-green-800",
                              quote.status === "draft" &&
                                "bg-yellow-100 text-yellow-800",
                              quote.status === "cancelled" &&
                                "bg-red-100 text-red-800",
                              quote.status === "expired" &&
                                "bg-gray-100 text-gray-800"
                            )}
                          >
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-1">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              title="Edit quote"
                              onClick={() => handleEditQuote(quote)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              title="Delete quote"
                              onClick={() => handleDeleteQuote(quote)}
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Tablet View (Medium screens) */}
          <Card className="hidden md:block lg:hidden">
            <CardContent className="p-0">
              <div className="w-full">
                <table className="w-full table-fixed">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-2 font-medium text-xs w-[25%]">
                        Customer
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[15%]">
                        Tour Date
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[15%]">
                        Expires
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[15%]">
                        Total
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[12%]">
                        Status
                      </th>
                      <th className="text-left p-2 font-medium text-xs w-[18%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuotes.map((quote) => (
                      <tr
                        key={quote.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-1.5">
                          <div className="font-medium text-xs truncate">
                            {quote.customer.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {quote.customer.email}
                          </div>
                        </td>
                        <td className="p-1.5">
                          <div className="font-medium text-xs">
                            {format(quote.tourDetails.startDate, "MMM dd")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(quote.tourDetails.startDate, "yyyy")}
                          </div>
                        </td>
                        <td className="p-1.5">
                          <div className="font-medium text-xs">
                            {format(quote.validUntil, "MMM dd")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(quote.validUntil, "yyyy")}
                          </div>
                        </td>
                        <td className="p-1.5">
                          <div className="font-medium text-xs">
                            {quote.pricing.currency}
                          </div>
                          <div className="text-[10px] font-semibold">
                            {quote.pricing.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-1.5">
                          <Badge
                            className={cn(
                              "text-[10px] px-1 py-0.5",
                              quote.status === "approved" &&
                                "bg-green-100 text-green-800",
                              quote.status === "draft" &&
                                "bg-yellow-100 text-yellow-800",
                              quote.status === "cancelled" &&
                                "bg-red-100 text-red-800",
                              quote.status === "expired" &&
                                "bg-gray-100 text-gray-800"
                            )}
                          >
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-1">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              title="Edit quote"
                              onClick={() => handleEditQuote(quote)}
                            >
                              <Edit className="w-2.5 h-2.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              title="Delete quote"
                              onClick={() => handleDeleteQuote(quote)}
                            >
                              <Trash2 className="w-2.5 h-2.5" />
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

          <div className="md:hidden space-y-3">
            {sortedQuotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header with Quote Number and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-base">
                        {quote.quoteNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quote.leadSource}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        quote.status === "approved" &&
                          "bg-green-100 text-green-800",
                        quote.status === "draft" &&
                          "bg-yellow-100 text-yellow-800",
                        quote.status === "cancelled" &&
                          "bg-red-100 text-red-800",
                        quote.status === "expired" &&
                          "bg-gray-100 text-gray-800"
                      )}
                    >
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="text-sm font-medium">
                      {quote.customer.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {quote.customer.email}
                    </div>
                  </div>

                  {/* Tour Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Destination
                      </div>
                      <div className="font-medium truncate">
                        {quote.tourDetails.destination}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quote.tourDetails.tourType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Tour Date
                      </div>
                      <div className="font-medium">
                        {format(quote.tourDetails.startDate, "MMM dd")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(quote.tourDetails.startDate, "yyyy")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Passengers
                      </div>
                      <div className="font-medium">
                        {quote.tourDetails.passengers} PAX
                      </div>
                      <div className="text-xs text-muted-foreground">
                        A:{quote.tourDetails.passengerBreakdown.adults}
                        C:{quote.tourDetails.passengerBreakdown.children}
                        I:{quote.tourDetails.passengerBreakdown.infants}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Amount
                      </div>
                      <div className="font-semibold text-primary">
                        {quote.pricing.currency}{" "}
                        {quote.pricing.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Assigned To
                      </div>
                      <div className="font-medium">{quote.assignedTo}</div>
                      {quote.agency && (
                        <div className="text-xs text-muted-foreground">
                          {quote.agency}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Created
                      </div>
                      <div className="font-medium">
                        {format(quote.metadata.createdAt, "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quote.metadata.createdBy}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditQuote(quote)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteQuote(quote)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && sortedQuotes.length === 0 && (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              No quotes found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
              {filters.search || activeFilterCount > 0
                ? "Try adjusting your filters or search terms"
                : "Start by creating your first quote"}
            </p>
            {filters.search ||
              (activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="sm"
                  className="sm:size-default"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotesPage;
