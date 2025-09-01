import React, { useState, useEffect } from 'react'
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
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<any>({
    salespersons: [],
    operators: [],
    guides: [],
    drivers: [],
    agencies: [],
    tours: []
  })
  
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
  
  useEffect(() => {
    loadInitialData()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [filters, dateRange, reservations])
  
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [allReservations, uniqueValues] = await Promise.all([
        reservationService.getAllReservations(),
        reservationService.getUniqueValues()
      ])
      
      setReservations(allReservations)
      setFilterOptions(uniqueValues)
    } catch (error) {
      toast({
        title: t('allReservations.error'),
        description: t('allReservations.failedToLoad'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const applyFilters = async () => {
    const filterCriteria: ReservationFilters = {
      ...filters,
      startDate: dateRange.from,
      endDate: dateRange.to
    }
    
    const filtered = await reservationService.getFilteredReservations(filterCriteria)
    setFilteredReservations(filtered)
  }
  
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('allReservations.title')}</h1>
          <p className="text-muted-foreground">{t('allReservations.subtitle')}</p>
        </div>
        <Button 
          onClick={exportToCSV} 
          disabled={filteredReservations.length === 0}
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          {t('allReservations.exportCSV')}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                
                <div>
                  <Label className="text-xs">{t('allReservations.search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder={t('allReservations.searchPlaceholder')}
                      className="pl-7 h-9 text-sm"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Status Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      {filterOptions.salespersons.map((sp: string) => (
                        <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">{t('allReservations.operator')}</Label>
                  <Select value={filters.operator || 'all'} onValueChange={(value) => handleFilterChange('operator', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allOperators')}</SelectItem>
                      {filterOptions.operators.map((operator: string) => (
                        <SelectItem key={operator} value={operator}>{operator}</SelectItem>
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
                      {filterOptions.guides.map((guide: string) => (
                        <SelectItem key={guide} value={guide}>{guide}</SelectItem>
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
                      {filterOptions.drivers.map((driver: string) => (
                        <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">{t('allReservations.externalAgency')}</Label>
                  <Select value={filters.externalAgency || 'all'} onValueChange={(value) => handleFilterChange('externalAgency', value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allReservations.allAgencies')}</SelectItem>
                      {filterOptions.agencies.map((agency: string) => (
                        <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  size="sm"
                >
                  {t('allReservations.clearFilters')}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('allReservations.reservations')}</p>
                <p className="text-xl font-bold">{filteredReservations.length}</p>
              </div>
              <Filter className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('allReservations.passengers')}</p>
                <p className="text-xl font-bold">{getTotalSummary().passengers}</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('allReservations.adults')}</p>
                <p className="text-xl font-bold">{getTotalSummary().adults}</p>
              </div>
              <UserCheck className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('allReservations.childrenInf')}</p>
                <p className="text-xl font-bold">
                  {getTotalSummary().children + getTotalSummary().infants}
                </p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('allReservations.revenue')}</p>
                <p className="text-xl font-bold">
                  ${Math.round(getTotalSummary().revenue).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {t('allReservations.reservationDetails')} ({filteredReservations.length} {t('allReservations.results')})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">{t('allReservations.reservation')}</TableHead>
                  <TableHead className="w-[100px]">{t('allReservations.date')}</TableHead>
                  <TableHead className="w-[150px]">{t('allReservations.client')}</TableHead>
                  <TableHead className="w-[180px]">{t('allReservations.tour')}</TableHead>
                  <TableHead className="w-[60px] text-center">{t('allReservations.pax')}</TableHead>
                  <TableHead className="w-[100px] text-right">{t('allReservations.total')}</TableHead>
                  <TableHead className="w-[80px]">{t('allReservations.status')}</TableHead>
                  <TableHead className="w-[80px]">{t('allReservations.payment')}</TableHead>
                  <TableHead className="w-[80px] text-center">{t('allReservations.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {t('allReservations.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {t('allReservations.noReservationsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.slice(0, 50).map((reservation) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
          
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