import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '@/config/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  CalendarIcon,
  Filter,
  Download,
  Settings,
  Eye,
  Edit,
  Users,
  Clock,
  MapPin,
  FileText,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Columns,
  RefreshCw,
  Save,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Reservation, ReservationFilters } from '@/types/reservation'
import { useToast } from '@/components/ui/use-toast'
import { useReservations } from '@/hooks/useReservations'
import { reservationService } from '@/services/reservationService'

// Column configuration interface
interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  editable: boolean
  required?: boolean
}

// Default column configuration
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'reservationNumber', label: 'Reservation ID', visible: true, editable: false, required: true },
  { id: 'client', label: 'Client', visible: true, editable: false, required: true },
  { id: 'tour', label: 'Tour', visible: true, editable: false, required: true },
  { id: 'operationDate', label: 'Date', visible: true, editable: true },
  { id: 'passengers', label: 'PAX (ADL/CHD/INF)', visible: true, editable: false },
  { id: 'hotel', label: 'Hotel', visible: true, editable: false },
  { id: 'pickupTime', label: 'Pickup Time', visible: true, editable: true },
  { id: 'pickupAddress', label: 'Pickup Point', visible: true, editable: true },
  { id: 'operator', label: 'Operator', visible: true, editable: true },
  { id: 'driver', label: 'Driver', visible: true, editable: true },
  { id: 'guide', label: 'Guide', visible: true, editable: true },
  { id: 'status', label: 'Status', visible: true, editable: true },
  { id: 'paymentStatus', label: 'Payment', visible: false, editable: false },
  { id: 'totalAmount', label: 'Total Amount', visible: false, editable: false },
  { id: 'salesperson', label: 'Salesperson', visible: false, editable: false },
  { id: 'actions', label: 'Actions', visible: true, editable: false, required: true },
]

const LogisticsOperationsPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  // State for filters - default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState<ReservationFilters>({
    dateType: 'operation',
    searchTerm: ''
  })

  // State for column customization
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    // Load saved column preferences from localStorage
    const saved = localStorage.getItem('logistics_column_preferences')
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS
  })
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  // State for inline editing
  const [editingCells, setEditingCells] = useState<Record<string, any>>({})
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<Reservation>>>({})

  // State for conflicts
  const [conflicts, setConflicts] = useState<any[]>([])

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [serviceOrderDialog, setServiceOrderDialog] = useState(false)
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set())
  const [confirmEmailDialog, setConfirmEmailDialog] = useState(false)

  // Fetch reservations using React Query
  const { data: allReservations = [], isLoading, refetch } = useReservations()

  // Get filter options
  const filterOptions = useMemo(() => {
    const options = reservationService.getFilterOptions()
    return {
      operators: [], // To be populated from backend
      guides: options.guides.map((u: any) => ({ id: u.id, name: u.fullName })),
      drivers: options.drivers.map((u: any) => ({ id: u.id, name: u.fullName })),
      tours: options.tours.map((t: any) => ({ id: t.id, name: t.name }))
    }
  }, [allReservations])

  // Filter reservations - show today's by default
  const filteredReservations = useMemo(() => {
    if (allReservations.length === 0) return []

    let filtered = [...allReservations]

    // Filter by selected date (default: today)
    filtered = filtered.filter(r => {
      const resDate = new Date(r.operationDate)
      return resDate.toDateString() === selectedDate.toDateString()
    })

    // Exclude PENDING status (only show CONFIRMED, RECONFIRMED, COMPLETED, etc.)
    filtered = filtered.filter(r => r.status !== 'pending')

    // Apply additional filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    if (filters.tour && filters.tour !== 'all') {
      filtered = filtered.filter(r => r.tour.id === filters.tour)
    }

    if (filters.guide && filters.guide !== 'all') {
      filtered = filtered.filter(r => r.guide === filters.guide)
    }

    if (filters.driver && filters.driver !== 'all') {
      filtered = filtered.filter(r => r.driver === filters.driver)
    }

    if (filters.operator && filters.operator !== 'all') {
      filtered = filtered.filter(r => r.operator === filters.operator)
    }

    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.reservationNumber.toLowerCase().includes(search) ||
        r.client.name.toLowerCase().includes(search) ||
        r.tour.name.toLowerCase().includes(search) ||
        r.client.hotel?.toLowerCase().includes(search)
      )
    }

    // Sort by pickup time
    filtered.sort((a, b) => {
      const timeA = a.tour.pickupTime || '00:00'
      const timeB = b.tour.pickupTime || '00:00'
      return timeA.localeCompare(timeB)
    })

    return filtered
  }, [allReservations, selectedDate, filters])

  // Detect conflicts (overlapping schedules for drivers/guides)
  useEffect(() => {
    const detected: any[] = []

    // Group by driver
    const byDriver: Record<string, Reservation[]> = {}
    const byGuide: Record<string, Reservation[]> = {}

    filteredReservations.forEach(r => {
      if (r.driver) {
        if (!byDriver[r.driver]) byDriver[r.driver] = []
        byDriver[r.driver].push(r)
      }
      if (r.guide) {
        if (!byGuide[r.guide]) byGuide[r.guide] = []
        byGuide[r.guide].push(r)
      }
    })

    // Check for time overlaps
    Object.entries(byDriver).forEach(([driver, reservations]) => {
      if (reservations.length > 1) {
        for (let i = 0; i < reservations.length - 1; i++) {
          for (let j = i + 1; j < reservations.length; j++) {
            const r1 = reservations[i]
            const r2 = reservations[j]
            // Simplified overlap check (you can enhance this with proper time parsing)
            detected.push({
              type: 'driver',
              resource: driver,
              reservations: [r1.reservationNumber, r2.reservationNumber],
              message: `Driver ${driver} assigned to multiple tours`
            })
          }
        }
      }
    })

    Object.entries(byGuide).forEach(([guide, reservations]) => {
      if (reservations.length > 1) {
        for (let i = 0; i < reservations.length - 1; i++) {
          for (let j = i + 1; j < reservations.length; j++) {
            const r1 = reservations[i]
            const r2 = reservations[j]
            detected.push({
              type: 'guide',
              resource: guide,
              reservations: [r1.reservationNumber, r2.reservationNumber],
              message: `Guide ${guide} assigned to multiple tours`
            })
          }
        }
      }
    })

    // Only update if conflicts actually changed
    if (JSON.stringify(detected) !== JSON.stringify(conflicts)) {
      setConflicts(detected)
    }
  }, [filteredReservations, conflicts])

  // Save column preferences
  const saveColumnPreferences = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns)
    localStorage.setItem('logistics_column_preferences', JSON.stringify(newColumns))
  }

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    saveColumnPreferences(newColumns)
  }

  // Handle inline editing
  const startEditing = (reservationId: string, field: string, currentValue: any) => {
    const column = columns.find(c => c.id === field)
    if (!column?.editable) return

    // Check if reservation is locked (RECONFIRMED or COMPLETED)
    const reservation = filteredReservations.find(r => r.id === reservationId)
    if (reservation && ['reconfirmed', 'completed'].includes(reservation.status)) {
      toast({
        title: 'Reservation Locked',
        description: 'Cannot edit reconfirmed or completed reservations',
        variant: 'destructive'
      })
      return
    }

    setEditingCells(prev => ({
      ...prev,
      [`${reservationId}-${field}`]: currentValue
    }))
  }

  const updateCell = (reservationId: string, field: string, value: any) => {
    setEditingCells(prev => ({
      ...prev,
      [`${reservationId}-${field}`]: value
    }))

    setPendingChanges(prev => ({
      ...prev,
      [reservationId]: {
        ...prev[reservationId],
        [field]: value
      }
    }))
  }

  const saveChanges = async (reservationId: string) => {
    const changes = pendingChanges[reservationId]
    if (!changes) return

    // Find the reservation to get the bookingId (without tour suffix)
    const reservation = filteredReservations.find(r => r.id === reservationId)
    if (!reservation) return

    try {
      // API call to update reservation logistics - use bookingId instead of id
      const response = await apiCall(`/api/reservations/${reservation.bookingId}/`, {
        method: 'PUT',
        body: JSON.stringify(changes)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update reservation')
      }

      toast({
        title: 'Changes Saved',
        description: 'Reservation updated successfully'
      })

      // Clear pending changes
      setPendingChanges(prev => {
        const newChanges = { ...prev }
        delete newChanges[reservationId]
        return newChanges
      })

      setEditingCells({})

      // Refresh data
      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save changes',
        variant: 'destructive'
      })
    }
  }

  // Reconfirm reservation (changes status to RECONFIRMED and locks it)
  const reconfirmReservation = async (reservationId: string) => {
    const reservation = filteredReservations.find(r => r.id === reservationId)
    if (!reservation) return

    // Validate required fields
    if (!reservation.operator || !reservation.driver || !reservation.guide) {
      toast({
        title: 'Missing Information',
        description: 'Please assign operator, driver, and guide before reconfirming',
        variant: 'destructive'
      })
      return
    }

    try {
      // Update status to RECONFIRMED - use bookingId instead of id
      const response = await apiCall(`/api/reservations/${reservation.bookingId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reconfirmed' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reconfirm reservation')
      }

      toast({
        title: 'Reservation Reconfirmed',
        description: 'This reservation is now locked and cannot be edited by sales staff'
      })

      refetch()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reconfirm reservation',
        variant: 'destructive'
      })
    }
  }

  // Generate service order
  const generateServiceOrder = async (reservationIds: string[]) => {
    try {
      const response = await apiCall('/api/reservations/service-orders/', {
        method: 'POST',
        body: JSON.stringify({ reservation_ids: reservationIds })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate service orders')
      }

      const data = await response.json()

      toast({
        title: 'Service Order Generated',
        description: `Generated service orders for ${reservationIds.length} reservation(s)`
      })

      setServiceOrderDialog(false)

      // If PDF URL is returned, open it
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate service orders',
        variant: 'destructive'
      })
    }
  }

  // Send confirmation emails
  const sendConfirmationEmails = async (reservationIds: string[]) => {
    try {
      const response = await apiCall('/api/reservations/send-confirmations/', {
        method: 'POST',
        body: JSON.stringify({ reservation_ids: reservationIds })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send confirmation emails')
      }

      toast({
        title: 'Emails Sent',
        description: `Confirmation emails sent for ${reservationIds.length} reservation(s)`
      })
      setConfirmEmailDialog(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send confirmation emails',
        variant: 'destructive'
      })
    }
  }

  // Get status badge
  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<string, { className: string; label: string; icon: any }> = {
      confirmed: { className: 'bg-blue-100 text-blue-800', label: 'Confirmed', icon: CheckCircle2 },
      reconfirmed: { className: 'bg-green-100 text-green-800', label: 'Reconfirmed', icon: Lock },
      completed: { className: 'bg-gray-100 text-gray-800', label: 'Completed', icon: CheckCircle2 },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled', icon: AlertTriangle },
      'no-show': { className: 'bg-orange-100 text-orange-800', label: 'No Show', icon: AlertTriangle }
    }

    const variant = variants[status] || variants.confirmed
    const Icon = variant.icon

    return (
      <Badge className={cn(variant.className, 'text-xs flex items-center gap-1')}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    )
  }

  // Render editable cell
  const renderEditableCell = (reservation: Reservation, field: string) => {
    const cellKey = `${reservation.id}-${field}`
    const isEditing = cellKey in editingCells
    const value = isEditing ? editingCells[cellKey] : getFieldValue(reservation, field)
    const isLocked = ['reconfirmed', 'completed'].includes(reservation.status)

    if (isLocked) {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Lock className="w-3 h-3" />
          <span>{value || '-'}</span>
        </div>
      )
    }

    if (!isEditing) {
      return (
        <div
          className="cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => startEditing(reservation.id, field, value)}
        >
          {value || <span className="text-gray-400">Click to edit</span>}
        </div>
      )
    }

    // Render appropriate input based on field type
    if (field === 'operator' || field === 'driver' || field === 'guide') {
      const options = field === 'driver' ? filterOptions.drivers :
                     field === 'guide' ? filterOptions.guides :
                     filterOptions.operators

      return (
        <Select
          value={value || ''}
          onValueChange={(val) => updateCell(reservation.id, field, val)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={`Select ${field}`} />
          </SelectTrigger>
          <SelectContent>
            {field === 'operator' && (
              <>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="own-operator">Own operator</SelectItem>
              </>
            )}
            {options.map((opt: any) => (
              <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field === 'status') {
      return (
        <Select
          value={value || 'confirmed'}
          onValueChange={(val) => updateCell(reservation.id, field, val)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="reconfirmed">Reconfirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (field === 'pickupTime') {
      return (
        <Input
          type="time"
          value={value || ''}
          onChange={(e) => updateCell(reservation.id, field, e.target.value)}
          className="h-8 text-xs"
        />
      )
    }

    if (field === 'operationDate') {
      return (
        <Input
          type="date"
          value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
          onChange={(e) => updateCell(reservation.id, field, new Date(e.target.value))}
          className="h-8 text-xs"
        />
      )
    }

    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => updateCell(reservation.id, field, e.target.value)}
        className="h-8 text-xs"
        onBlur={() => {}}
      />
    )
  }

  const getFieldValue = (reservation: Reservation, field: string): any => {
    switch (field) {
      case 'reservationNumber':
        return reservation.reservationNumber
      case 'client':
        return reservation.client.name
      case 'tour':
        return reservation.tour.name
      case 'operationDate':
        return format(new Date(reservation.operationDate), 'MMM dd, yyyy')
      case 'passengers':
        return `${reservation.passengers.adults}/${reservation.passengers.children}/${reservation.passengers.infants}`
      case 'hotel':
        return reservation.client.hotel
      case 'pickupTime':
        return reservation.tour.pickupTime
      case 'pickupAddress':
        return reservation.tour.pickupAddress
      case 'operator':
        return reservation.operator
      case 'driver':
        return reservation.driver
      case 'guide':
        return reservation.guide
      case 'status':
        return reservation.status
      case 'paymentStatus':
        return reservation.paymentStatus
      case 'totalAmount':
        return `${reservation.pricing.currency} ${reservation.pricing.totalAmount.toFixed(2)}`
      case 'salesperson':
        return reservation.salesperson
      default:
        return ''
    }
  }

  return (
    <div className="w-full overflow-x-hidden py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Logistics / Operations</h1>
          <p className="text-sm text-muted-foreground">
            Manage daily operations, assign resources, and reconfirm services
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnSelector(true)}
          >
            <Columns className="w-4 h-4 mr-2" />
            Columns
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="px-4 lg:px-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Scheduling Conflicts Detected</h3>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx}>• {conflict.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 lg:px-6">
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Search & Filters
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={cn("w-4 h-4 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Selector */}
                <div>
                  <Label className="text-sm">Operation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search */}
                <div>
                  <Label className="text-sm">Search</Label>
                  <Input
                    placeholder="Reservation, client, hotel..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="reconfirmed">Reconfirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tour Filter */}
                <div>
                  <Label className="text-sm">Tour</Label>
                  <Select
                    value={filters.tour || 'all'}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, tour: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All tours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tours</SelectItem>
                      {filterOptions.tours.map((tour: any) => (
                        <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 lg:px-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{filteredReservations.length}</div>
            <p className="text-xs text-muted-foreground">Total Reservations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {filteredReservations.reduce((sum, r) => sum + r.passengers.adults + r.passengers.children + r.passengers.infants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Passengers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {filteredReservations.filter(r => r.status === 'reconfirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Reconfirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {conflicts.length}
            </div>
            <p className="text-xs text-muted-foreground">Conflicts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden mx-4 lg:mx-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-base">
              Reservations for {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setServiceOrderDialog(true)}
                disabled={selectedReservations.size === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Service Orders ({selectedReservations.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmEmailDialog(true)}
                disabled={selectedReservations.size === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Confirmations ({selectedReservations.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reservations found for this date
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReservations.size === filteredReservations.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReservations(new Set(filteredReservations.map(r => r.id)))
                          } else {
                            setSelectedReservations(new Set())
                          }
                        }}
                      />
                    </TableHead>
                    {columns.filter(c => c.visible).map(column => (
                      <TableHead key={column.id}>{column.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => {
                    const hasPendingChanges = reservation.id in pendingChanges
                    const isSelected = selectedReservations.has(reservation.id)

                    return (
                      <TableRow
                        key={reservation.id}
                        className={cn(
                          hasPendingChanges && 'bg-yellow-50',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSet = new Set(selectedReservations)
                              if (checked) {
                                newSet.add(reservation.id)
                              } else {
                                newSet.delete(reservation.id)
                              }
                              setSelectedReservations(newSet)
                            }}
                          />
                        </TableCell>
                        {columns.filter(c => c.visible).map(column => (
                          <TableCell key={column.id} className="text-xs">
                            {column.id === 'status' ? (
                              getStatusBadge(reservation.status)
                            ) : column.id === 'actions' ? (
                              <div className="flex gap-1">
                                {hasPendingChanges && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => saveChanges(reservation.id)}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                )}
                                {reservation.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reconfirmReservation(reservation.id)}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Reconfirm
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Settings className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/reservations/${reservation.bookingId}/edit`)}>
                                      <Eye className="w-3 h-3 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/reservations/${reservation.bookingId}/edit`)}>
                                      <Edit className="w-3 h-3 mr-2" />
                                      Edit Reservation
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => generateServiceOrder([reservation.bookingId])}>
                                      <FileText className="w-3 h-3 mr-2" />
                                      Generate Service Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => sendConfirmationEmails([reservation.bookingId])}>
                                      <Mail className="w-3 h-3 mr-2" />
                                      Send Confirmation
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ) : column.editable ? (
                              renderEditableCell(reservation, column.id)
                            ) : (
                              getFieldValue(reservation, column.id) || '-'
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Selector Dialog */}
      <Dialog open={showColumnSelector} onOpenChange={setShowColumnSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Columns</DialogTitle>
            <DialogDescription>
              Select which columns you want to display in the table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {columns.map(column => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                  disabled={column.required}
                />
                <label
                  htmlFor={column.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                >
                  {column.label}
                  {column.editable && <Badge variant="outline" className="ml-2 text-xs">Editable</Badge>}
                  {column.required && <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => saveColumnPreferences(DEFAULT_COLUMNS)}>
              Reset to Default
            </Button>
            <Button onClick={() => setShowColumnSelector(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Order Dialog */}
      <Dialog open={serviceOrderDialog} onOpenChange={setServiceOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Service Orders</DialogTitle>
            <DialogDescription>
              Generate PDF service orders for selected reservations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {selectedReservations.size} reservation(s) selected
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              generateServiceOrder(Array.from(selectedReservations))
              setServiceOrderDialog(false)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Generate PDFs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Email Dialog */}
      <Dialog open={confirmEmailDialog} onOpenChange={setConfirmEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Confirmation Emails</DialogTitle>
            <DialogDescription>
              Send automated confirmation emails to clients for selected reservations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {selectedReservations.size} confirmation email(s) will be sent
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => sendConfirmationEmails(Array.from(selectedReservations))}>
              <Send className="w-4 h-4 mr-2" />
              Send Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LogisticsOperationsPage
