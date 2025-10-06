import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import ViewReservationModal from '@/components/ViewReservationModal'
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
  Eye,
  Edit,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Building2,
  UserCheck,
  Car,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { reservationService } from '@/services/reservationService'
import { Reservation, ReservationFilters } from '@/types/reservation'
import { useToast } from '@/components/ui/use-toast'
import { useReservations } from '@/hooks/useReservations'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const AllReservationsPage = () => {
  const { t } = useLanguage()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState<ReservationFilters>({
    dateType: 'operation',
    searchTerm: ''
  })
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  
  // Single React Query hook - only makes one API call
  const { data: allReservations = [], isLoading: reservationsLoading, error: reservationsError } = useReservations()

  // Compute filter options from API response (users and tours)
  const filterOptions = useMemo(() => {
    const options = reservationService.getFilterOptions()

    return {
      salespersons: options.salespersons.map((u: any) => ({
        id: u.id,
        name: u.fullName
      })),
      operators: [], // Not available in current API
      guides: options.guides.map((u: any) => ({
        id: u.id,
        name: u.fullName
      })),
      drivers: options.drivers.map((u: any) => ({
        id: u.id,
        name: u.fullName
      })),
      agencies: options.agencies.map((u: any) => ({
        id: u.id,
        name: u.fullName
      })),
      tours: options.tours.map((t: any) => ({
        id: t.id,
        name: t.name
      }))
    }
  }, [allReservations])

  // Compute filtered reservations (client-side)
  const filteredReservations = useMemo(() => {
    if (allReservations.length === 0) return []
    
    let filtered = [...allReservations]
    
    // Date range filter
    if (dateRange.from && dateRange.to) {
      const dateField = filters.dateType === 'operation' ? 'operationDate' : 'saleDate'
      filtered = filtered.filter(r => {
        const date = r[dateField]
        return date >= dateRange.from! && date <= dateRange.to!
      })
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }
    
    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(r => r.paymentStatus === filters.paymentStatus)
    }
    
    // Salesperson filter
    if (filters.salesperson && filters.salesperson !== 'all') {
      filtered = filtered.filter(r => r.salesperson === filters.salesperson)
    }
    
    // Tour filter
    if (filters.tour && filters.tour !== 'all') {
      filtered = filtered.filter(r => r.tour.id === filters.tour)
    }
    
    // Guide filter
    if (filters.guide && filters.guide !== 'all') {
      filtered = filtered.filter(r => r.guide === filters.guide)
    }
    
    // Driver filter
    if (filters.driver && filters.driver !== 'all') {
      filtered = filtered.filter(r => r.driver === filters.driver)
    }
    
    // Operator filter
    if (filters.operator && filters.operator !== 'all') {
      filtered = filtered.filter(r => r.operator === filters.operator)
    }
    
    // External agency filter
    if (filters.externalAgency && filters.externalAgency !== 'all') {
      filtered = filtered.filter(r => r.externalAgency === filters.externalAgency)
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.reservationNumber.toLowerCase().includes(search) ||
        r.client.name.toLowerCase().includes(search) ||
        r.client.email.toLowerCase().includes(search) ||
        r.tour.name.toLowerCase().includes(search) ||
        r.purchaseOrderNumber?.toLowerCase().includes(search)
      )
    }
    
    // Sort by operation date descending
    filtered.sort((a, b) => b.operationDate.getTime() - a.operationDate.getTime())
    
    return filtered
  }, [allReservations, filters, dateRange])
  
  const loading = reservationsLoading
  
  // Show error toast if there's an error
  useEffect(() => {
    if (reservationsError) {
      toast({
        title: t('allReservations.error'),
        description: t('allReservations.failedToLoad'),
        variant: 'destructive'
      })
    }
  }, [reservationsError, toast, t])
  
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const clearFilters = () => {
    setFilters({
      dateType: 'operation',
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
  
  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { className: string; labelKey: string }> = {
      confirmed: { className: 'bg-green-100 text-green-800', labelKey: 'allReservations.confirmed' },
      pending: { className: 'bg-yellow-100 text-yellow-800', labelKey: 'allReservations.pending' },
      cancelled: { className: 'bg-red-100 text-red-800', labelKey: 'allReservations.cancelled' },
      completed: { className: 'bg-blue-100 text-blue-800', labelKey: 'allReservations.completed' },
      'no-show': { className: 'bg-gray-100 text-gray-800', labelKey: 'allReservations.noShow' }
    }
    
    const variant = variants[status]
    return <Badge className={cn(variant.className, 'text-xs')}>{t(variant.labelKey)}</Badge>
  }
  
  const getPaymentBadge = (status: Reservation['paymentStatus']) => {
    const variants: Record<Reservation['paymentStatus'], { className: string; labelKey: string }> = {
      paid: { className: 'bg-green-100 text-green-800', labelKey: 'allReservations.paid' },
      pending: { className: 'bg-yellow-100 text-yellow-800', labelKey: 'allReservations.pending' },
      partial: { className: 'bg-orange-100 text-orange-800', labelKey: 'allReservations.partial' },
      refunded: { className: 'bg-purple-100 text-purple-800', labelKey: 'allReservations.refunded' },
      overdue: { className: 'bg-red-100 text-red-800', labelKey: 'allReservations.overdue' }
    }
    
    const variant = variants[status]
    return <Badge className={cn(variant.className, 'text-xs')}>{t(variant.labelKey)}</Badge>
  }
  
  const exportToCSV = () => {
    const headers = [
      'Reservation Number',
      'Operation Date',
      'Sale Date',
      'Status',
      'Payment Status',
      'Client Name',
      'Email',
      'Phone',
      'Country',
      'Tour',
      'Adults',
      'Children',
      'Infants',
      'Total Amount',
      'Currency',
      'Salesperson',
      'Operator',
      'Guide',
      'Driver',
      'Agency'
    ]
    
    const rows = filteredReservations.map(r => [
      r.reservationNumber,
      format(r.operationDate, 'dd/MM/yyyy'),
      format(r.saleDate, 'dd/MM/yyyy'),
      r.status,
      r.paymentStatus,
      r.client.name,
      r.client.email,
      r.client.phone,
      r.client.country,
      r.tour.name,
      r.passengers.adults,
      r.passengers.children,
      r.passengers.infants,
      r.pricing.totalAmount,
      r.pricing.currency,
      r.salesperson,
      r.operator || '',
      r.guide || '',
      r.driver || '',
      r.externalAgency || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: t('allReservations.exportSuccessful'),
      description: t('allReservations.exportedReservations').replace('{count}', filteredReservations.length.toString())
    })
  }
  
  const getTotalSummary = () => {
    const totals = filteredReservations.reduce((acc, r) => {
      acc.passengers += r.passengers.adults + r.passengers.children + r.passengers.infants
      acc.adults += r.passengers.adults
      acc.children += r.passengers.children
      acc.infants += r.passengers.infants
      
      const rates: { [key: string]: number } = {
        CLP: 0.0012,
        ARS: 0.0034,
        BRL: 0.20,
        EUR: 1.09,
        USD: 1
      }
      
      acc.revenue += r.pricing.totalAmount * (rates[r.pricing.currency] || 1)
      return acc
    }, { passengers: 0, adults: 0, children: 0, infants: 0, revenue: 0 })
    
    return totals
  }
  
  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setViewModalOpen(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    navigate(`/reservations/${reservation.id}/edit`)
  }

  
  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{t('allReservations.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('allReservations.subtitle')}</p>
        </div>
        <Button 
          onClick={exportToCSV} 
          disabled={filteredReservations.length === 0}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="sm:inline">{t('allReservations.exportCSV')}</span>
        </Button>
      </div>
      
      {/* Collapsible Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:no-underline">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t('allReservations.searchFilters')}
              </CardTitle>
              {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Date Range and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs">{t('allReservations.dateType')}</Label>
                  <Select value={filters.dateType} onValueChange={(value) => handleFilterChange('dateType', value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operation">{t('allReservations.operationDate')}</SelectItem>
                      <SelectItem value="sale">{t('allReservations.saleDate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{t('allReservations.startDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        <span className="text-xs truncate">
                          {dateRange.from ? format(dateRange.from, "dd/MM/yy") : t('allReservations.select')}
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
                  <Label className="text-xs">{t('allReservations.endDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        <span className="text-xs truncate">
                          {dateRange.to ? format(dateRange.to, "dd/MM/yy") : t('allReservations.select')}
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
              </div>
              
              {/* Status Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs">{t('allReservations.reservationStatus')}</Label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allStatuses')}</SelectItem>
                      <SelectItem value="confirmed">{t('allReservations.confirmed')}</SelectItem>
                      <SelectItem value="pending">{t('allReservations.pending')}</SelectItem>
                      <SelectItem value="cancelled">{t('allReservations.cancelled')}</SelectItem>
                      <SelectItem value="completed">{t('allReservations.completed')}</SelectItem>
                      <SelectItem value="no-show">{t('allReservations.noShow')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">{t('allReservations.paymentStatus')}</Label>
                  <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => handleFilterChange('paymentStatus', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allPayments')}</SelectItem>
                      <SelectItem value="paid">{t('allReservations.paid')}</SelectItem>
                      <SelectItem value="pending">{t('allReservations.pending')}</SelectItem>
                      <SelectItem value="partial">{t('allReservations.partial')}</SelectItem>
                      <SelectItem value="refunded">{t('allReservations.refunded')}</SelectItem>
                      <SelectItem value="overdue">{t('allReservations.overdue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">{t('allReservations.tour')}</Label>
                  <Select value={filters.tour || 'all'} onValueChange={(value) => handleFilterChange('tour', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allTours')}</SelectItem>
                      {filterOptions.tours.map((tour: any) => (
                        <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">{t('allReservations.salesperson')}</Label>
                  <Select value={filters.salesperson || 'all'} onValueChange={(value) => handleFilterChange('salesperson', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allSalespersons')}</SelectItem>
                      {filterOptions.salespersons.map((sp: any) => (
                        <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Additional Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs">{t('allReservations.operator')}</Label>
                  <Select value={filters.operator || 'all'} onValueChange={(value) => handleFilterChange('operator', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allOperators')}</SelectItem>
                      {filterOptions.operators.map((operator: any) => (
                        <SelectItem key={operator.id} value={operator.id}>{operator.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{t('allReservations.guide')}</Label>
                  <Select value={filters.guide || 'all'} onValueChange={(value) => handleFilterChange('guide', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allGuides')}</SelectItem>
                      {filterOptions.guides.map((guide: any) => (
                        <SelectItem key={guide.id} value={guide.id}>{guide.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{t('allReservations.driver')}</Label>
                  <Select value={filters.driver || 'all'} onValueChange={(value) => handleFilterChange('driver', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allDrivers')}</SelectItem>
                      {filterOptions.drivers.map((driver: any) => (
                        <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">{t('allReservations.agency')}</Label>
                  <Select value={filters.externalAgency || 'all'} onValueChange={(value) => handleFilterChange('externalAgency', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allAgencies')}</SelectItem>
                      {filterOptions.agencies.map((agency: any) => (
                        <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {t('allReservations.clearFilters')}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{t('allReservations.reservations')}</p>
                <p className="text-lg sm:text-xl font-bold">{filteredReservations.length}</p>
              </div>
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{t('allReservations.passengers')}</p>
                <p className="text-lg sm:text-xl font-bold">{getTotalSummary().passengers}</p>
              </div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{t('allReservations.adults')}</p>
                <p className="text-lg sm:text-xl font-bold">{getTotalSummary().adults}</p>
              </div>
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{t('allReservations.childrenInf')}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {getTotalSummary().children + getTotalSummary().infants}
                </p>
              </div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{t('allReservations.revenue')}</p>
                <p className="text-lg sm:text-xl font-bold truncate">
                  ${Math.round(getTotalSummary().revenue).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-medium">
            {t('allReservations.reservationDetails')} ({filteredReservations.length} {t('allReservations.results')})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('allReservations.loading')}
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('allReservations.noReservationsFound')}
            </div>
          ) : (
            <>
              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden lg:block">
                <TooltipProvider>
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead className="w-[120px] bg-white">{t('allReservations.reservation')}</TableHead>
                        <TableHead className="w-[100px] bg-white">{t('allReservations.date')}</TableHead>
                        <TableHead className="w-[150px] bg-white">{t('allReservations.client')}</TableHead>
                        <TableHead className="w-[180px] bg-white">{t('allReservations.tour')}</TableHead>
                        <TableHead className="w-[60px] text-center bg-white">{t('allReservations.pax')}</TableHead>
                        <TableHead className="w-[100px] text-right bg-white">{t('allReservations.total')}</TableHead>
                        <TableHead className="w-[80px] bg-white">{t('allReservations.status')}</TableHead>
                        <TableHead className="w-[80px] bg-white">{t('allReservations.payment')}</TableHead>
                        <TableHead className="w-[80px] text-center bg-white">{t('allReservations.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.slice(0, 50).map((reservation) => (
                        <React.Fragment key={reservation.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRowExpansion(reservation.id)}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <div className="text-xs font-semibold">{reservation.reservationNumber}</div>
                                {reservation.purchaseOrderNumber && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('allReservations.po')}: {reservation.purchaseOrderNumber}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-xs font-medium">
                                  {format(reservation.operationDate, 'dd/MM/yy')}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {reservation.tour.pickupTime}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <div className="text-xs font-medium truncate max-w-[140px]">
                                      {reservation.client.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {reservation.client.country}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>
                                    <p>{reservation.client.name}</p>
                                    <p className="text-xs">{reservation.client.email}</p>
                                    <p className="text-xs">{reservation.client.phone}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <div className="text-xs font-medium truncate max-w-[170px]">
                                      {reservation.tour.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {reservation.tour.code}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>
                                    <p>{reservation.tour.name}</p>
                                    <p className="text-xs flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {reservation.tour.pickupAddress}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="text-xs">
                                <span className="font-medium">{reservation.passengers.adults}</span>
                                {(reservation.passengers.children > 0 || reservation.passengers.infants > 0) && (
                                  <>
                                    +{reservation.passengers.children + reservation.passengers.infants}
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-xs font-semibold">
                                {reservationService.formatCurrency(
                                  reservation.pricing.totalAmount,
                                  reservation.pricing.currency
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell>{getPaymentBadge(reservation.paymentStatus)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewReservation(reservation)
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditReservation(reservation)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(reservation.id) && (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-muted/30 p-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <p className="font-semibold mb-1">{t('allReservations.passengerDetails')}</p>
                                    <p>{t('allReservations.adults')}: {reservation.passengers.adults} × {reservationService.formatCurrency(reservation.pricing.adultPrice, reservation.pricing.currency)}</p>
                                    {reservation.passengers.children > 0 && (
                                      <p>{t('allReservations.children')}: {reservation.passengers.children} × {reservationService.formatCurrency(reservation.pricing.childPrice, reservation.pricing.currency)}</p>
                                    )}
                                    {reservation.passengers.infants > 0 && (
                                      <p>{t('allReservations.infants')}: {reservation.passengers.infants} × {reservationService.formatCurrency(reservation.pricing.infantPrice, reservation.pricing.currency)}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-1">{t('allReservations.operations')}</p>
                                    <p>{t('allReservations.salesperson')}: {reservation.salesperson}</p>
                                    {reservation.operator && <p>{t('allReservations.operator')}: {reservation.operator}</p>}
                                    {reservation.guide && <p>{t('allReservations.guide')}: {reservation.guide}</p>}
                                    {reservation.driver && <p>{t('allReservations.driver')}: {reservation.driver}</p>}
                                    {reservation.externalAgency && <p>{t('allReservations.externalAgency')}: {reservation.externalAgency}</p>}
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-1">{t('allReservations.pickupDetails')}</p>
                                    <p className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {reservation.tour.pickupAddress}
                                    </p>
                                    <p>{t('allReservations.time')}: {reservation.tour.pickupTime}</p>
                                    {reservation.notes && <p className="mt-1">{t('allReservations.notes')}: {reservation.notes}</p>}
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

              {/* Mobile Card View (visible on mobile and tablet) */}
              <div className="lg:hidden space-y-3 p-3 sm:p-4">
                {filteredReservations.slice(0, 50).map((reservation) => (
                  <Card key={reservation.id} className="overflow-hidden shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      {/* Header with Reservation Number and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{reservation.reservationNumber}</div>
                          {reservation.purchaseOrderNumber && (
                            <div className="text-xs text-muted-foreground">
                              {t('allReservations.po')}: {reservation.purchaseOrderNumber}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          {getStatusBadge(reservation.status)}
                          {getPaymentBadge(reservation.paymentStatus)}
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="mb-3">
                        <div className="text-sm font-medium truncate">{reservation.client.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{reservation.client.country}</span>
                          <span>•</span>
                          <span className="truncate">{reservation.client.email}</span>
                        </div>
                      </div>

                      {/* Tour and Date Info */}
                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">{t('allReservations.tour')}</div>
                          <div className="font-medium text-sm truncate">{reservation.tour.name}</div>
                          <div className="text-xs text-muted-foreground">{reservation.tour.code}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">{t('allReservations.date')}</div>
                            <div className="font-medium text-sm">{format(reservation.operationDate, 'dd/MM/yyyy')}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reservation.tour.pickupTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">{t('allReservations.total')}</div>
                            <div className="font-semibold text-sm text-primary">
                              {reservationService.formatCurrency(
                                reservation.pricing.totalAmount,
                                reservation.pricing.currency
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Passengers Info */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t('allReservations.passengers')}</div>
                          <div className="font-medium text-sm">
                            {reservation.passengers.adults} PAX
                            {(reservation.passengers.children > 0 || reservation.passengers.infants > 0) && (
                              <span className="text-muted-foreground">
                                {' '}(+{reservation.passengers.children + reservation.passengers.infants})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('allReservations.salesperson')}: {reservation.salesperson}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <Collapsible open={expandedRows.has(reservation.id)} onOpenChange={() => toggleRowExpansion(reservation.id)}>
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-1 justify-center h-8">
                              <span className="text-xs mr-2">{t('allReservations.details')}</span>
                              {expandedRows.has(reservation.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </Button>
                          </CollapsibleTrigger>
                          <div className="flex gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewReservation(reservation)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditReservation(reservation)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <CollapsibleContent>
                          <div className="pt-3 space-y-3 text-xs">
                            <div>
                              <p className="font-semibold mb-1">{t('allReservations.passengerDetails')}</p>
                              <p>{t('allReservations.adults')}: {reservation.passengers.adults} × {reservationService.formatCurrency(reservation.pricing.adultPrice, reservation.pricing.currency)}</p>
                              {reservation.passengers.children > 0 && (
                                <p>{t('allReservations.children')}: {reservation.passengers.children} × {reservationService.formatCurrency(reservation.pricing.childPrice, reservation.pricing.currency)}</p>
                              )}
                              {reservation.passengers.infants > 0 && (
                                <p>{t('allReservations.infants')}: {reservation.passengers.infants} × {reservationService.formatCurrency(reservation.pricing.infantPrice, reservation.pricing.currency)}</p>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold mb-1">{t('allReservations.operations')}</p>
                              <p>{t('allReservations.salesperson')}: {reservation.salesperson}</p>
                              {reservation.operator && <p>{t('allReservations.operator')}: {reservation.operator}</p>}
                              {reservation.guide && <p>{t('allReservations.guide')}: {reservation.guide}</p>}
                              {reservation.driver && <p>{t('allReservations.driver')}: {reservation.driver}</p>}
                              {reservation.externalAgency && <p>{t('allReservations.externalAgency')}: {reservation.externalAgency}</p>}
                            </div>
                            <div>
                              <p className="font-semibold mb-1">{t('allReservations.pickupDetails')}</p>
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {reservation.tour.pickupAddress}
                              </p>
                              <p>{t('allReservations.time')}: {reservation.tour.pickupTime}</p>
                              {reservation.notes && <p className="mt-1">{t('allReservations.notes')}: {reservation.notes}</p>}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {filteredReservations.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              {t('allReservations.showingFirst')} {filteredReservations.length} {t('allReservations.totalReservations')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewReservationModal
        reservation={selectedReservation}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </div>
  )
}

export default AllReservationsPage