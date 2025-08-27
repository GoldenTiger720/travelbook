import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { QuoteModal } from "@/components/QuoteModal"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  MapPin,
  Download,
  Printer,
  Mail,
  X,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Edit,
  Send,
  Copy,
  Trash2,
  Link2,
  FileSpreadsheet,
  FilePlus
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Quote, QuoteFilters } from "@/types/quote"
import { quoteService } from "@/services/quoteService"
import { exportToExcel, exportToPDF } from "@/utils/exportUtils"

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

const getSourceIcon = (source: string) => {
  switch (source) {
    case "instagram": return "📷"
    case "whatsapp": return "💬"
    case "website": return "🌐"
    case "email": return "✉️"
    case "referral": return "🤝"
    case "direct": return "🏢"
    default: return "📌"
  }
}

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  
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

  useEffect(() => {
    loadQuotes()
  }, [filters])

  const loadQuotes = async () => {
    setLoading(true)
    try {
      const data = await quoteService.getQuotes(filters)
      setQuotes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateQuote = () => {
    setModalMode("create")
    setSelectedQuote(null)
    setIsModalOpen(true)
  }

  const handleEditQuote = (quote: Quote) => {
    setModalMode("edit")
    setSelectedQuote(quote)
    setIsModalOpen(true)
  }

  const handleViewQuote = (quote: Quote) => {
    window.open(`/quotes/${quote.id}`, '_blank')
  }

  const handleDuplicateQuote = async (quote: Quote) => {
    try {
      const newQuote = await quoteService.duplicateQuote(quote.id)
      if (newQuote) {
        await loadQuotes()
        toast({
          title: "Success",
          description: "Quote duplicated successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate quote",
        variant: "destructive"
      })
    }
  }

  const handleDeleteQuote = async (quote: Quote) => {
    if (confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      try {
        const success = await quoteService.deleteQuote(quote.id)
        if (success) {
          await loadQuotes()
          toast({
            title: "Success",
            description: "Quote deleted successfully"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quote",
          variant: "destructive"
        })
      }
    }
  }

  const handleGenerateLink = async (quote: Quote) => {
    try {
      const link = await quoteService.generateShareableLink(quote.id)
      await navigator.clipboard.writeText(link)
      await loadQuotes()
      toast({
        title: "Link Generated",
        description: "Shareable link copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate link",
        variant: "destructive"
      })
    }
  }

  const handleSendEmail = async (quote: Quote) => {
    try {
      await quoteService.sendQuoteByEmail(quote.id, quote.customer.email)
      toast({
        title: "Email Sent",
        description: `Quote sent to ${quote.customer.email}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    }
  }

  const handleQuoteSubmit = async (data: any) => {
    try {
      if (modalMode === "create") {
        await quoteService.createQuote(data)
        toast({
          title: "Success",
          description: "Quote created successfully"
        })
      } else if (selectedQuote) {
        await quoteService.updateQuote(selectedQuote.id, data)
        toast({
          title: "Success",
          description: "Quote updated successfully"
        })
      }
      await loadQuotes()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${modalMode} quote`,
        variant: "destructive"
      })
    }
  }

  const exportQuotes = (format: "excel" | "pdf") => {
    try {
      const exportData = { quotes: sortedQuotes, filters }
      
      if (format === "excel") {
        exportToExcel(exportData)
      } else {
        exportToPDF(exportData)
      }
      
      toast({
        title: "Export Successful",
        description: `Quotes exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export quotes",
        variant: "destructive"
      })
    }
  }

  const printQuotes = () => {
    window.print()
  }

  const totalValue = sortedQuotes.reduce((sum, quote) => {
    if (quote.pricing.currency === 'USD') {
      return sum + quote.pricing.amount
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage travel quotes for your customers
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportQuotes("excel")}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => exportQuotes("pdf")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={printQuotes}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateQuote}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar and Filter Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by client name, quote number, lead source, or creation date..." 
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(activeFilterCount > 0 && "border-primary")}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2" variant="secondary">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Status Filter */}
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueValues.statuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead Source Filter */}
                  <div>
                    <Label>Lead Source</Label>
                    <Select 
                      value={filters.leadSource} 
                      onValueChange={(value) => setFilters({ ...filters, leadSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueValues.leadSources.map(source => (
                          <SelectItem key={source} value={source}>
                            {source === "all" ? "All Sources" : source.charAt(0).toUpperCase() + source.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned To Filter */}
                  <div>
                    <Label>Salesperson</Label>
                    <Select 
                      value={filters.assignedTo} 
                      onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All salespersons" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueValues.assignees.map(person => (
                          <SelectItem key={person} value={person}>
                            {person === "all" ? "All Salespersons" : person}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agency Filter */}
                  <div>
                    <Label>Agency</Label>
                    <Select 
                      value={filters.agency} 
                      onValueChange={(value) => setFilters({ ...filters, agency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All agencies" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueValues.agencies.map(agency => (
                          <SelectItem key={agency} value={agency}>
                            {agency === "all" ? "All Agencies" : agency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tour Type Filter */}
                  <div>
                    <Label>Tour Type</Label>
                    <Select 
                      value={filters.tourType} 
                      onValueChange={(value) => setFilters({ ...filters, tourType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueValues.tourTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? "All Types" : type.split("-").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <Label>Date From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Date To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                          disabled={(date) => filters.dateFrom ? date < filters.dateFrom : false}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Amount Range */}
                  <div>
                    <Label>Min Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={filters.minAmount || ""}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Max Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="10000"
                        className="pl-10"
                        value={filters.maxAmount || ""}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {sortedQuotes.length} quotes
        </p>
        <p>
          Total value: ${totalValue.toLocaleString()} USD
        </p>
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="text-center py-8">Loading quotes...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{quote.quoteNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quote.customer.name} • {quote.customer.email}
                        </p>
                      </div>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                      <span className="text-xl" title={quote.leadSource}>
                        {getSourceIcon(quote.leadSource)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{quote.tourDetails.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {format(quote.tourDetails.startDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {quote.tourDetails.passengers} PAX
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {quote.pricing.currency} ${quote.pricing.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {quote.assignedTo} • {quote.agency || "Direct"}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Created: {format(quote.metadata.createdAt, "MMM dd, yyyy")}
                          {" • "}
                          Expires: {format(quote.validUntil, "MMM dd, yyyy")}
                          {quote.validUntil < new Date() && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Expired
                            </Badge>
                          )}
                        </p>
                        {quote.termsAccepted?.accepted && (
                          <p className="text-xs text-green-600">
                            ✓ Terms accepted by {quote.termsAccepted.acceptedBy} on{" "}
                            {format(quote.termsAccepted.acceptedAt!, "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
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
                          title="Duplicate quote"
                          onClick={() => handleDuplicateQuote(quote)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Generate shareable link"
                          onClick={() => handleGenerateLink(quote)}
                        >
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Send by email"
                          onClick={() => handleSendEmail(quote)}
                        >
                          <Send className="w-4 h-4" />
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedQuotes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || activeFilterCount > 0
                ? "Try adjusting your filters or search terms"
                : "Start by creating your first quote"}
            </p>
            {filters.search || activeFilterCount > 0 ? (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleCreateQuote}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quote
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleQuoteSubmit}
        mode={modalMode}
        initialData={selectedQuote}
      />
    </div>
  )
}

export default QuotesPage