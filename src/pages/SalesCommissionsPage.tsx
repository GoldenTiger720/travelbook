import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  CalendarIcon, 
  Search, 
  Filter,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Calculator,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  XCircle,
  Percent,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { commissionService } from '@/services/commissionService'
import { Commission, CommissionFilters, CommissionSummary } from '@/types/commission'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SalesCommissionsPage = () => {
  const { toast } = useToast()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<any>({
    salespersons: [],
    agencies: [],
    tours: []
  })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  const [filters, setFilters] = useState<CommissionFilters>({
    dateType: 'sale',
    searchTerm: ''
  })
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  
  useEffect(() => {
    loadInitialData()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [filters, dateRange, commissions])
  
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [allCommissions, uniqueValues] = await Promise.all([
        commissionService.getAllCommissions(),
        commissionService.getUniqueValues()
      ])
      
      setCommissions(allCommissions)
      setFilterOptions(uniqueValues)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load commission data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const applyFilters = async () => {
    const filterCriteria: CommissionFilters = {
      ...filters,
      startDate: dateRange.from,
      endDate: dateRange.to
    }
    
    const filtered = await commissionService.getFilteredCommissions(filterCriteria)
    setFilteredCommissions(filtered)
    
    const summaryData = await commissionService.getCommissionSummary(filtered)
    setSummary(summaryData)
  }
  
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const clearFilters = () => {
    setFilters({
      dateType: 'sale',
      searchTerm: ''
    })
    setDateRange({
      from: undefined,
      to: undefined
    })
  }

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }
  
  const getStatusBadge = (status: Commission['commission']['status']) => {
    const variants: Record<Commission['commission']['status'], { className: string; label: string; icon: any }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pend', icon: Clock },
      approved: { className: 'bg-blue-100 text-blue-800', label: 'Appr', icon: CheckCircle },
      paid: { className: 'bg-green-100 text-green-800', label: 'Paid', icon: CheckCircle },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Canc', icon: XCircle }
    }
    
    const variant = variants[status]
    const Icon = variant.icon
    return (
      <Badge className={cn(variant.className, 'text-xs px-1 py-0')}>
        {variant.label}
      </Badge>
    )
  }

  const formatCompactCurrency = (amount: number, currency: string): string => {
    const symbols: { [key: string]: string } = {
      CLP: '$',
      USD: '$',
      EUR: '€',
      BRL: 'R$',
      ARS: '$'
    }
    
    // For large numbers, format more compactly
    if (amount >= 1000000) {
      return `${symbols[currency]}${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 10000) {
      return `${symbols[currency]}${Math.round(amount / 1000)}k`
    }
    return `${symbols[currency]}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  
  const exportToCSV = () => {
    const headers = [
      'Reservation #',
      'Sale Date',
      'Operation Date',
      'Tour',
      'Client',
      'Country',
      'Salesperson',
      'Agency',
      'Adults',
      'Children',
      'Infants',
      'Total PAX',
      'Gross Total',
      'Costs',
      'Net Received',
      'Commission %',
      'Commission Amount',
      'Currency',
      'Status',
      'Payment Date'
    ]
    
    const rows = filteredCommissions.map(c => [
      c.reservationNumber,
      format(c.saleDate, 'dd/MM/yyyy'),
      format(c.operationDate, 'dd/MM/yyyy'),
      c.tour.name,
      c.client.name,
      c.client.country,
      c.salesperson || '',
      c.externalAgency || '',
      c.passengers.adults,
      c.passengers.children,
      c.passengers.infants,
      c.passengers.total,
      c.pricing.grossTotal,
      c.pricing.costs,
      c.pricing.netReceived,
      c.commission.percentage,
      c.commission.amount,
      c.pricing.currency,
      c.commission.status,
      c.commission.paymentDate ? format(c.commission.paymentDate, 'dd/MM/yyyy') : ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Successful',
      description: `Exported ${filteredCommissions.length} commission records to CSV`
    })
  }
  
  const exportToExcel = () => {
    const headers = [
      'Reservation #',
      'Sale Date',
      'Operation Date', 
      'Tour',
      'Client',
      'Salesperson/Agency',
      'Passengers',
      'Gross Total',
      'Costs',
      'Net Received',
      'Commission %',
      'Commission Amount',
      'Status'
    ]
    
    const rows = filteredCommissions.map(c => [
      c.reservationNumber,
      format(c.saleDate, 'dd/MM/yyyy'),
      format(c.operationDate, 'dd/MM/yyyy'),
      c.tour.name,
      c.client.name,
      c.salesperson || c.externalAgency || '-',
      c.passengers.total,
      commissionService.formatCurrency(c.pricing.grossTotal, c.pricing.currency),
      commissionService.formatCurrency(c.pricing.costs, c.pricing.currency),
      commissionService.formatCurrency(c.pricing.netReceived, c.pricing.currency),
      `${c.commission.percentage}%`,
      commissionService.formatCurrency(c.commission.amount, c.pricing.currency),
      c.commission.status
    ])
    
    const content = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n')
    
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions_${format(new Date(), 'yyyyMMdd_HHmmss')}.xls`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Successful',
      description: `Exported ${filteredCommissions.length} commission records to Excel`
    })
  }
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Commissions</h1>
          <p className="text-sm text-muted-foreground">Calculate and track sales commissions</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={exportToCSV} 
            disabled={filteredCommissions.length === 0}
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
          <Button 
            onClick={exportToExcel} 
            disabled={filteredCommissions.length === 0}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            Excel
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Date Range and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Date Type</Label>
              <Select value={filters.dateType} onValueChange={(value) => handleFilterChange('dateType', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale Date</SelectItem>
                  <SelectItem value="operation">Operation Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-8 justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span className="text-xs">
                      {dateRange.from ? format(dateRange.from, "dd/MM") : "Select"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-8 justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    <span className="text-xs">
                      {dateRange.to ? format(dateRange.to, "dd/MM") : "Select"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-7 h-8 text-xs"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Tour</Label>
              <Select value={filters.tour || 'all'} onValueChange={(value) => handleFilterChange('tour', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tours</SelectItem>
                  {filterOptions.tours.map((tour: any) => (
                    <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Salesperson</Label>
              <Select value={filters.salesperson || 'all'} onValueChange={(value) => handleFilterChange('salesperson', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filterOptions.salespersons.map((sp: string) => (
                    <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Agency</Label>
              <Select value={filters.externalAgency || 'all'} onValueChange={(value) => handleFilterChange('externalAgency', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filterOptions.agencies.map((agency: string) => (
                    <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filters.commissionStatus || 'all'} onValueChange={(value) => handleFilterChange('commissionStatus', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                size="sm"
                className="w-full h-8 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Count</p>
                <p className="text-sm font-bold">{summary.reservationCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="text-sm font-bold">${(summary.totalSales / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Costs</p>
                <p className="text-sm font-bold">${(summary.totalCosts / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Net</p>
                <p className="text-sm font-bold">${(summary.totalNet / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-sm font-bold">{summary.averageCommissionRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-green-600">
                  ${(summary.totalCommissions / 1000).toFixed(0)}k
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Pend</p>
                <p className="text-sm font-bold text-yellow-600">
                  ${(summary.pendingCommissions / 1000).toFixed(0)}k
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-bold text-blue-600">
                  ${(summary.paidCommissions / 1000).toFixed(0)}k
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Commission Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Commission Details ({filteredCommissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6 text-xs">
              Loading commission data...
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-6 text-xs">
              No commission records found
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on mobile */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[70px] text-xs">Date</TableHead>
                        <TableHead className="w-[90px] text-xs">Reservation</TableHead>
                        <TableHead className="w-[140px] text-xs">Tour</TableHead>
                        <TableHead className="w-[100px] text-xs">Client</TableHead>
                        <TableHead className="w-[100px] text-xs">Sales</TableHead>
                        <TableHead className="w-[35px] text-center text-xs">PAX</TableHead>
                        <TableHead className="w-[70px] text-right text-xs">Gross</TableHead>
                        <TableHead className="w-[70px] text-right text-xs">Net</TableHead>
                        <TableHead className="w-[35px] text-center text-xs">%</TableHead>
                        <TableHead className="w-[80px] text-right text-xs">Comm</TableHead>
                        <TableHead className="w-[50px] text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.slice(0, 100).map((commission) => (
                        <React.Fragment key={commission.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRowExpansion(commission.id)}
                          >
                            <TableCell className="text-xs">
                              <div className="text-xs">
                                {format(commission.saleDate, 'dd/MM')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(commission.operationDate, 'dd/MM')}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {commission.reservationNumber.slice(-7)}
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-xs">
                                    <div className="truncate max-w-[130px] font-medium">
                                      {commission.tour.name}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                      {commission.tour.code}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{commission.tour.name}</p>
                                  <p className="text-xs">{commission.tour.destination}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-xs">
                                    <div className="truncate max-w-[90px] font-medium">
                                      {commission.client.name.split(' ')[0]}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                      {commission.client.country}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{commission.client.name}</p>
                                  <p className="text-xs">{commission.client.email}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-xs truncate max-w-[90px]">
                              {commission.salesperson || commission.externalAgency || '-'}
                            </TableCell>
                            <TableCell className="text-center text-xs font-medium">
                              {commission.passengers.total}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium">
                              {formatCompactCurrency(commission.pricing.grossTotal, commission.pricing.currency)}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {formatCompactCurrency(commission.pricing.netReceived, commission.pricing.currency)}
                            </TableCell>
                            <TableCell className="text-center text-xs font-medium">
                              {commission.commission.percentage}
                            </TableCell>
                            <TableCell className="text-right text-xs font-bold text-green-600">
                              {formatCompactCurrency(commission.commission.amount, commission.pricing.currency)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(commission.commission.status)}
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(commission.id) && (
                            <TableRow>
                              <TableCell colSpan={11} className="bg-muted/30 p-2">
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <p className="font-semibold mb-1">Passenger Details</p>
                                    <p>Adults: {commission.passengers.adults}</p>
                                    {commission.passengers.children > 0 && (
                                      <p>Children: {commission.passengers.children}</p>
                                    )}
                                    {commission.passengers.infants > 0 && (
                                      <p>Infants: {commission.passengers.infants}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-1">Financial Details</p>
                                    <p>Gross: {commissionService.formatCurrency(commission.pricing.grossTotal, commission.pricing.currency)}</p>
                                    <p>Costs: {commissionService.formatCurrency(commission.pricing.costs, commission.pricing.currency)}</p>
                                    <p>Net: {commissionService.formatCurrency(commission.pricing.netReceived, commission.pricing.currency)}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-1">Commission Info</p>
                                    <p>Rate: {commission.commission.percentage}%</p>
                                    <p>Amount: {commissionService.formatCurrency(commission.commission.amount, commission.pricing.currency)}</p>
                                    {commission.commission.paymentDate && (
                                      <p>Paid: {format(commission.commission.paymentDate, 'dd/MM/yyyy')}</p>
                                    )}
                                    {commission.notes && <p>Note: {commission.notes}</p>}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </div>

              {/* Mobile Cards - Visible on mobile only */}
              <div className="md:hidden space-y-2 p-2">
                {filteredCommissions.slice(0, 100).map((commission) => (
                  <Card key={commission.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => toggleRowExpansion(commission.id)}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Header Row */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{commission.reservationNumber.slice(-7)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(commission.saleDate, 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(commission.commission.status)}
                          </div>
                        </div>
                        
                        {/* Tour and Client */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="font-medium truncate">{commission.tour.name}</p>
                            <p className="text-muted-foreground">{commission.tour.code}</p>
                          </div>
                          <div>
                            <p className="font-medium truncate">{commission.client.name}</p>
                            <p className="text-muted-foreground">{commission.client.country}</p>
                          </div>
                        </div>
                        
                        {/* Financial Summary */}
                        <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2">
                          <div>
                            <p className="text-muted-foreground">PAX</p>
                            <p className="font-semibold">{commission.passengers.total}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gross</p>
                            <p className="font-semibold">
                              {formatCompactCurrency(commission.pricing.grossTotal, commission.pricing.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Commission</p>
                            <p className="font-bold text-green-600">
                              {formatCompactCurrency(commission.commission.amount, commission.pricing.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">{commission.commission.percentage}%</p>
                          </div>
                        </div>
                        
                        {/* Salesperson/Agency */}
                        {(commission.salesperson || commission.externalAgency) && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Sales: </span>
                            <span className="font-medium">{commission.salesperson || commission.externalAgency}</span>
                          </div>
                        )}
                        
                        {/* Expand Icon */}
                        <div className="flex justify-center pt-1">
                          {expandedRows.has(commission.id) ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedRows.has(commission.id) && (
                          <div className="border-t pt-2 mt-2 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Passengers</p>
                                <p>Adults: {commission.passengers.adults}</p>
                                {commission.passengers.children > 0 && (
                                  <p>Children: {commission.passengers.children}</p>
                                )}
                                {commission.passengers.infants > 0 && (
                                  <p>Infants: {commission.passengers.infants}</p>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Dates</p>
                                <p>Sale: {format(commission.saleDate, 'dd/MM/yyyy')}</p>
                                <p>Operation: {format(commission.operationDate, 'dd/MM/yyyy')}</p>
                                {commission.commission.paymentDate && (
                                  <p>Payment: {format(commission.commission.paymentDate, 'dd/MM/yyyy')}</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Financial Breakdown</p>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Gross Total:</span>
                                  <span>{commissionService.formatCurrency(commission.pricing.grossTotal, commission.pricing.currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Costs:</span>
                                  <span>{commissionService.formatCurrency(commission.pricing.costs, commission.pricing.currency)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Net Received:</span>
                                  <span>{commissionService.formatCurrency(commission.pricing.netReceived, commission.pricing.currency)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-600 border-t pt-1">
                                  <span>Commission ({commission.commission.percentage}%):</span>
                                  <span>{commissionService.formatCurrency(commission.commission.amount, commission.pricing.currency)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {commission.notes && (
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Notes</p>
                                <p className="italic">{commission.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {filteredCommissions.length > 100 && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t">
              Showing first 100 of {filteredCommissions.length} records
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesCommissionsPage