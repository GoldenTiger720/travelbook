import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Search,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  DollarSign,
  X
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { QuoteFilters } from "@/types/quote"

interface QuotesFilterProps {
  filters: QuoteFilters
  onFiltersChange: (filters: QuoteFilters) => void
  sortBy: 'date' | 'amount' | 'customer'
  onSortByChange: (value: 'date' | 'amount' | 'customer') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (value: 'asc' | 'desc') => void
  uniqueValues: {
    statuses: string[]
    tourTypes: string[]
    leadSources: string[]
    assignees: string[]
    agencies: string[]
  }
}

export function QuotesFilter({
  filters,
  onFiltersChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  uniqueValues
}: QuotesFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== ''
    if (key === 'dateFrom' || key === 'dateTo') return value !== undefined
    if (key === 'minAmount' || key === 'maxAmount') return value !== undefined
    return value !== 'all'
  }).length

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      tourType: 'all',
      leadSource: 'all',
      assignedTo: 'all',
      agency: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined
    })
  }

  return (
    <Card>
      <CardContent className="p-4 sm:pt-6">
        <div className="space-y-4">
          {/* Search Bar and Filter Toggle */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search quotes..." 
                className="pl-10 text-sm sm:text-base"
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-[120px] sm:w-[150px]">
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
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="shrink-0"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("flex-1 sm:flex-none", activeFilterCount > 0 && "border-primary")}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                    onValueChange={(value) => onFiltersChange({ ...filters, leadSource: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.leadSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
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
                    onValueChange={(value) => onFiltersChange({ ...filters, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All salespersons" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.assignees.map(person => (
                        <SelectItem key={person} value={person}>
                          {person === 'all' ? 'All Salespersons' : person}
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
                    onValueChange={(value) => onFiltersChange({ ...filters, agency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All agencies" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.agencies.map(agency => (
                        <SelectItem key={agency} value={agency}>
                          {agency === 'all' ? 'All Agencies' : agency}
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
                    onValueChange={(value) => onFiltersChange({ ...filters, tourType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.tourTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'all' ? 'All Types' : type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
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
                        onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
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
                      value={filters.minAmount || ''}
                      onChange={(e) => onFiltersChange({ 
                        ...filters, 
                        minAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
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
                      value={filters.maxAmount || ''}
                      onChange={(e) => onFiltersChange({ 
                        ...filters, 
                        maxAmount: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
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
  )
}

import { useState } from 'react'