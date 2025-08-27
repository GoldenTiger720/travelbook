import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { QuoteModal } from "@/components/QuoteModal"
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
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock quotes data with more details
const mockQuotes = [
  {
    id: "Q001",
    customer: "Maria González",
    email: "maria@example.com",
    destination: "Buenos Aires City Tour",
    tourType: "city-tour",
    date: new Date(2024, 0, 15),
    passengers: 2,
    amount: 2450,
    currency: "USD",
    status: "pending",
    validUntil: new Date(2024, 0, 30),
    responsible: "Carlos Mendez",
    agency: "Direct",
    createdAt: new Date(2024, 0, 1)
  },
  {
    id: "Q002",
    customer: "João Silva",
    email: "joao@example.com",
    destination: "Rio de Janeiro Beach Package",
    tourType: "beach-tour",
    date: new Date(2024, 0, 18), 
    passengers: 4,
    amount: 3890,
    currency: "USD",
    status: "approved",
    validUntil: new Date(2024, 1, 1),
    responsible: "Ana Costa",
    agency: "Brazil Tours",
    createdAt: new Date(2024, 0, 3)
  },
  {
    id: "Q003",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    destination: "Patagonia Adventure",
    tourType: "adventure",
    date: new Date(2024, 0, 22),
    passengers: 2,
    amount: 4200,
    currency: "USD",
    status: "sent",
    validUntil: new Date(2024, 1, 5),
    responsible: "Diego Ramirez",
    agency: "Adventure Seekers",
    createdAt: new Date(2024, 0, 5)
  },
  {
    id: "Q004",
    customer: "Carlos Rodriguez",
    email: "carlos@example.com",
    destination: "Iguazu Falls Experience",
    tourType: "nature",
    date: new Date(2024, 0, 25),
    passengers: 3,
    amount: 1650,
    currency: "USD",
    status: "draft",
    validUntil: new Date(2024, 1, 10),
    responsible: "Carlos Mendez",
    agency: "Direct",
    createdAt: new Date(2024, 0, 8)
  },
  {
    id: "Q005",
    customer: "Emma Williams",
    email: "emma@example.com",
    destination: "Wine Tour Mendoza",
    tourType: "wine-tour",
    date: new Date(2024, 1, 5),
    passengers: 6,
    amount: 5200,
    currency: "USD",
    status: "converted",
    validUntil: new Date(2024, 1, 20),
    responsible: "Ana Costa",
    agency: "Wine Lovers",
    createdAt: new Date(2024, 0, 10)
  },
  {
    id: "Q006",
    customer: "Liu Wei",
    email: "liu@example.com",
    destination: "Buenos Aires & Tango Experience",
    tourType: "cultural",
    date: new Date(2024, 1, 15),
    passengers: 8,
    amount: 8900,
    currency: "USD",
    status: "expired",
    validUntil: new Date(2024, 0, 20),
    responsible: "Diego Ramirez",
    agency: "China Tours",
    createdAt: new Date(2023, 11, 20)
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-success text-success-foreground"
    case "pending": return "bg-warning text-warning-foreground"
    case "sent": return "bg-primary text-primary-foreground"
    case "draft": return "bg-secondary text-secondary-foreground"
    case "converted": return "bg-purple-500 text-white"
    case "expired": return "bg-destructive text-destructive-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

const getTourTypeColor = (type: string) => {
  switch (type) {
    case "city-tour": return "bg-primary text-primary-foreground"
    case "beach-tour": return "bg-accent text-accent-foreground"
    case "adventure": return "bg-success text-success-foreground"
    case "wine-tour": return "bg-purple-500 text-white"
    case "nature": return "bg-green-500 text-white"
    case "cultural": return "bg-orange-500 text-white"
    default: return "bg-muted text-muted-foreground"
  }
}

interface FilterState {
  search: string
  status: string
  tourType: string
  responsible: string
  agency: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  minAmount: string
  maxAmount: string
}

const QuotesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    tourType: "all",
    responsible: "all",
    agency: "all",
    dateFrom: undefined,
    dateTo: undefined,
    minAmount: "",
    maxAmount: ""
  })

  // Sort state
  const [sortBy, setSortBy] = useState<"date" | "amount" | "customer">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Get unique values for filters
  const statuses = ["all", ...Array.from(new Set(mockQuotes.map(q => q.status)))]
  const tourTypes = ["all", ...Array.from(new Set(mockQuotes.map(q => q.tourType)))]
  const responsibles = ["all", ...Array.from(new Set(mockQuotes.map(q => q.responsible)))]
  const agencies = ["all", ...Array.from(new Set(mockQuotes.map(q => q.agency)))]

  // Filter quotes
  const filteredQuotes = mockQuotes.filter(quote => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!quote.customer.toLowerCase().includes(searchLower) &&
          !quote.destination.toLowerCase().includes(searchLower) &&
          !quote.id.toLowerCase().includes(searchLower) &&
          !quote.email.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Status filter
    if (filters.status !== "all" && quote.status !== filters.status) {
      return false
    }

    // Tour type filter
    if (filters.tourType !== "all" && quote.tourType !== filters.tourType) {
      return false
    }

    // Responsible filter
    if (filters.responsible !== "all" && quote.responsible !== filters.responsible) {
      return false
    }

    // Agency filter
    if (filters.agency !== "all" && quote.agency !== filters.agency) {
      return false
    }

    // Date range filter
    if (filters.dateFrom && quote.date < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && quote.date > filters.dateTo) {
      return false
    }

    // Amount range filter
    if (filters.minAmount && quote.amount < parseFloat(filters.minAmount)) {
      return false
    }
    if (filters.maxAmount && quote.amount > parseFloat(filters.maxAmount)) {
      return false
    }

    return true
  })

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "date":
        comparison = a.date.getTime() - b.date.getTime()
        break
      case "amount":
        comparison = a.amount - b.amount
        break
      case "customer":
        comparison = a.customer.localeCompare(b.customer)
        break
    }
    
    return sortOrder === "asc" ? comparison : -comparison
  })

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      tourType: "all",
      responsible: "all",
      agency: "all",
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: "",
      maxAmount: ""
    })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== ""
    if (key === "dateFrom" || key === "dateTo") return value !== undefined
    if (key === "minAmount" || key === "maxAmount") return value !== ""
    return value !== "all"
  }).length

  const handleCreateQuote = () => {
    setModalMode("create")
    setSelectedQuote(null)
    setIsModalOpen(true)
  }

  const handleEditQuote = (quote: any) => {
    setModalMode("edit")
    setSelectedQuote(quote)
    setIsModalOpen(true)
  }

  const handleQuoteSubmit = (data: any) => {
    console.log("Quote submitted:", data)
    // Handle quote creation/update
  }

  const exportQuotes = (format: "excel" | "pdf") => {
    console.log(`Exporting quotes as ${format}`)
    // Implement export functionality
  }

  const printQuotes = () => {
    window.print()
    // Implement print functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes Management</h1>
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
                  <FileText className="w-4 h-4 mr-2" />
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
                  placeholder="Search quotes by customer, destination, ID, or email..." 
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
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
                        {tourTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? "All Types" : type.split("-").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Responsible Filter */}
                  <div>
                    <Label>Responsible</Label>
                    <Select 
                      value={filters.responsible} 
                      onValueChange={(value) => setFilters({ ...filters, responsible: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All team members" />
                      </SelectTrigger>
                      <SelectContent>
                        {responsibles.map(person => (
                          <SelectItem key={person} value={person}>
                            {person === "all" ? "All Team Members" : person}
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
                        {agencies.map(agency => (
                          <SelectItem key={agency} value={agency}>
                            {agency === "all" ? "All Agencies" : agency}
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
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
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
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
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
          Showing {sortedQuotes.length} of {mockQuotes.length} quotes
        </p>
        <p>
          Total value: ${sortedQuotes.reduce((sum, quote) => sum + quote.amount, 0).toLocaleString()}
        </p>
      </div>

      {/* Quotes List */}
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
                      <h3 className="font-semibold text-foreground">{quote.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {quote.customer} • {quote.email}
                      </p>
                    </div>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                    <Badge className={getTourTypeColor(quote.tourType)} variant="outline">
                      {quote.tourType.split("-").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{quote.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{format(quote.date, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{quote.passengers} passengers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        {quote.currency} ${quote.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {quote.agency} • {quote.responsible}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Valid until: {format(quote.validUntil, "MMM dd, yyyy")}
                        {quote.validUntil < new Date() && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Expired
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {format(quote.createdAt, "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditQuote(quote)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
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

      {/* Empty State */}
      {sortedQuotes.length === 0 && (
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