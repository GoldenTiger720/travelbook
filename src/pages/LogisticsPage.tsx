import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Car, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  CalendarIcon,
  Phone,
  Mail,
  Navigation,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings,
  Send,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { logisticsService } from '@/services/logisticsService'
import { TourOperation, Vehicle, Driver, Guide, VehicleDistribution } from '@/types/logistics'
import { useToast } from '@/components/ui/use-toast'

const LogisticsPage = () => {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTour, setSelectedTour] = useState<string>('')
  const [selectedOperator, setSelectedOperator] = useState<string>('all')
  const [tourOperations, setTourOperations] = useState<TourOperation[]>([])
  const [filteredTourOperations, setFilteredTourOperations] = useState<TourOperation[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedOperation, setSelectedOperation] = useState<TourOperation | null>(null)
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadInitialData()
  }, [])
  
  useEffect(() => {
    if (selectedDate) {
      loadTourOperations()
    }
  }, [selectedDate])
  
  useEffect(() => {
    filterTourOperations()
  }, [tourOperations, selectedOperator])
  
  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [vehiclesData, driversData, guidesData] = await Promise.all([
        logisticsService.getVehicles(),
        logisticsService.getDrivers(),
        logisticsService.getGuides()
      ])
      
      setVehicles(vehiclesData)
      setDrivers(driversData)
      setGuides(guidesData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load logistics data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const loadTourOperations = async () => {
    try {
      const operations = await logisticsService.getTourOperations(selectedDate)
      setTourOperations(operations)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tour operations',
        variant: 'destructive'
      })
    }
  }
  
  const filterTourOperations = () => {
    let filtered = [...tourOperations]
    
    if (selectedOperator !== 'all') {
      filtered = filtered.filter(operation => {
        const operator = operation.operator || 'own-operation'
        if (selectedOperator === 'own-operation') {
          return operator === 'own-operation'
        } else {
          return operator !== 'own-operation'
        }
      })
    }
    
    setFilteredTourOperations(filtered)
    
    // Auto-select first tour if none selected or if current selection is filtered out
    if (!selectedTour && filtered.length > 0) {
      setSelectedTour(filtered[0].id)
      setSelectedOperation(filtered[0])
    } else if (selectedTour) {
      const operation = filtered.find(op => op.id === selectedTour)
      if (operation) {
        setSelectedOperation(operation)
      } else if (filtered.length > 0) {
        // Current selection filtered out, select first available
        setSelectedTour(filtered[0].id)
        setSelectedOperation(filtered[0])
      } else {
        // No tours available after filtering
        setSelectedOperation(null)
        setSelectedTour('')
      }
    }
  }
  
  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId)
    const operation = filteredTourOperations.find(op => op.id === tourId)
    setSelectedOperation(operation || null)
  }
  
  const handleAssignmentUpdate = async (field: string, value: string) => {
    if (!selectedOperation) return
    
    try {
      await logisticsService.updateTourOperation(selectedOperation.id, {
        [field]: value
      })
      
      // Update local state
      setSelectedOperation(prev => prev ? { ...prev, [field]: value } : null)
      setTourOperations(prev => 
        prev.map(op => op.id === selectedOperation.id ? { ...op, [field]: value } : op)
      )
      
      toast({
        title: 'Updated',
        description: `Assignment updated successfully`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive'
      })
    }
  }
  
  const handleVehicleAssign = async (vehicleId: string) => {
    if (!selectedOperation) return
    
    try {
      await logisticsService.assignVehicleToOperation(selectedOperation.id, vehicleId)
      await handleAssignmentUpdate('vehicleId', vehicleId)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign vehicle',
        variant: 'destructive'
      })
    }
  }
  
  const toggleReservationExpansion = (reservationId: string) => {
    setExpandedReservations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId)
      } else {
        newSet.add(reservationId)
      }
      return newSet
    })
  }
  
  const sendWhatsAppList = (operation: TourOperation) => {
    if (!operation.vehicleId) return
    
    const vehicle = vehicles.find(v => v.id === operation.vehicleId)
    if (!vehicle) return
    
    const distribution: VehicleDistribution = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      assignedPassengers: operation.totalPassengers,
      capacity: vehicle.capacity,
      passengerList: operation.reservations.map(r => ({
        reservationNumber: r.reservationNumber,
        clientName: r.clientName,
        passengers: r.passengers.total,
        hotelName: r.hotelName,
        pickupLocation: r.pickupLocation,
        specialRequests: r.specialRequests
      }))
    }
    
    const message = logisticsService.generateWhatsAppMessage(distribution)
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank')
    
    toast({
      title: 'WhatsApp Opened',
      description: 'Passenger list ready to send'
    })
  }
  
  const getStatusBadge = (status: TourOperation['status']) => {
    const variants = {
      planning: { className: 'bg-yellow-100 text-yellow-800', label: 'Planning' },
      assigned: { className: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      'in-progress': { className: 'bg-green-100 text-green-800', label: 'In Progress' },
      completed: { className: 'bg-gray-100 text-gray-800', label: 'Completed' }
    }
    
    const variant = variants[status]
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    )
  }
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logistics / Operations</h1>
          <p className="text-sm text-muted-foreground">Manage daily tour operations and logistics</p>
        </div>
      </div>
      
      {/* Date and Tour Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Operation Date & Tour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Operation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
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
            
            <div>
              <Label className="text-sm">Operator</Label>
              <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  <SelectItem value="own-operation">Own Operation</SelectItem>
                  <SelectItem value="external">External Operators</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm">Select Tour Operation</Label>
              <Select value={selectedTour} onValueChange={handleTourSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tour" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTourOperations.map((operation) => (
                    <SelectItem key={operation.id} value={operation.id}>
                      <div className="flex items-center gap-2">
                        <span>{operation.tourName}</span>
                        <Badge variant="outline" className="text-xs">
                          {operation.totalPassengers} PAX
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedOperation && (
        <>
          {/* Tour Assignment Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Tour Assignment - {selectedOperation.tourName}
                </div>
                {getStatusBadge(selectedOperation.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Main Driver</Label>
                  <Select value={selectedOperation.mainDriver || undefined} onValueChange={(value) => handleAssignmentUpdate('mainDriver', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.filter(d => d.status === 'available').map((driver) => (
                        <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Main Guide</Label>
                  <Select value={selectedOperation.mainGuide || undefined} onValueChange={(value) => handleAssignmentUpdate('mainGuide', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guide" />
                    </SelectTrigger>
                    <SelectContent>
                      {guides.filter(g => g.status === 'available').map((guide) => (
                        <SelectItem key={guide.id} value={guide.name}>{guide.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Assistant Guide</Label>
                  <Select value={selectedOperation.assistantGuide || undefined} onValueChange={(value) => handleAssignmentUpdate('assistantGuide', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      {guides.filter(g => g.status === 'available' && g.name !== selectedOperation.mainGuide).map((guide) => (
                        <SelectItem key={guide.id} value={guide.name}>{guide.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Departure Time</Label>
                  <Input
                    type="time"
                    value={selectedOperation.departureTime || ''}
                    onChange={(e) => handleAssignmentUpdate('departureTime', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Waiting Time (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={selectedOperation.expectedWaitingTime}
                    onChange={(e) => handleAssignmentUpdate('expectedWaitingTime', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Assign Vehicle</Label>
                  <Select value={selectedOperation.vehicleId || undefined} onValueChange={handleVehicleAssign}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.capacity} seats)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Passenger Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total PAX</p>
                    <p className="text-lg font-bold">{selectedOperation.totalPassengers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Confirmed</p>
                    <p className="text-lg font-bold">
                      {selectedOperation.reservations.filter(r => r.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-lg font-bold">
                      {selectedOperation.reservations.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Value</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(selectedOperation.reservations.reduce((sum, r) => sum + r.totalValue, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Reservations Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reservation Details ({selectedOperation.reservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Reservation</TableHead>
                      <TableHead className="w-[120px]">Client</TableHead>
                      <TableHead className="w-[150px]">Hotel</TableHead>
                      <TableHead className="w-[60px] text-center">PAX</TableHead>
                      <TableHead className="w-[80px] text-right">Price/PAX</TableHead>
                      <TableHead className="w-[80px] text-right">Total</TableHead>
                      <TableHead className="w-[80px] text-right">Pending</TableHead>
                      <TableHead className="w-[60px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOperation.reservations.map((reservation) => (
                      <React.Fragment key={reservation.id}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleReservationExpansion(reservation.id)}
                        >
                          <TableCell className="font-medium text-xs">
                            {reservation.reservationNumber.slice(-7)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="truncate max-w-[110px]">{reservation.clientName}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="truncate max-w-[140px]">{reservation.hotelName}</div>
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {reservation.passengers.total}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {formatCurrency(reservation.pricePerPassenger)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {formatCurrency(reservation.totalValue)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <span className={reservation.pendingPayment > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {formatCurrency(reservation.pendingPayment)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                              {reservation.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {expandedReservations.has(reservation.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="font-semibold mb-2">Contact Information</p>
                                  <p className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {reservation.clientEmail}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {reservation.clientPhone}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold mb-2">Pickup Details</p>
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {reservation.hotelAddress}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold mb-2">Passenger Breakdown</p>
                                  <p>Adults: {reservation.passengers.adults}</p>
                                  {reservation.passengers.children > 0 && <p>Children: {reservation.passengers.children}</p>}
                                  {reservation.passengers.infants > 0 && <p>Infants: {reservation.passengers.infants}</p>}
                                  {reservation.specialRequests && (
                                    <p className="mt-1 text-orange-600">⚠️ {reservation.specialRequests}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-3">
                {selectedOperation.reservations.map((reservation) => (
                  <Card key={reservation.id} className="cursor-pointer hover:shadow-sm" onClick={() => toggleReservationExpansion(reservation.id)}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{reservation.reservationNumber.slice(-7)}</p>
                            <p className="text-xs text-muted-foreground">{reservation.clientName}</p>
                          </div>
                          <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {reservation.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs">
                          <p className="font-medium">{reservation.hotelName}</p>
                          <p className="text-muted-foreground truncate">{reservation.hotelAddress}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">PAX</p>
                            <p className="font-semibold">{reservation.passengers.total}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-semibold">{formatCurrency(reservation.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pending</p>
                            <p className={`font-semibold ${reservation.pendingPayment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(reservation.pendingPayment)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center pt-1">
                          {expandedReservations.has(reservation.id) ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        {expandedReservations.has(reservation.id) && (
                          <div className="border-t pt-2 mt-2 space-y-2 text-xs">
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Contact</p>
                              <p className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {reservation.clientEmail}
                              </p>
                              <p className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {reservation.clientPhone}
                              </p>
                            </div>
                            
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Passengers</p>
                              <p>Adults: {reservation.passengers.adults}</p>
                              {reservation.passengers.children > 0 && <p>Children: {reservation.passengers.children}</p>}
                              {reservation.passengers.infants > 0 && <p>Infants: {reservation.passengers.infants}</p>}
                            </div>
                            
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Pricing</p>
                              <p>Price per passenger: {formatCurrency(reservation.pricePerPassenger)}</p>
                              <p>Total value: {formatCurrency(reservation.totalValue)}</p>
                              {reservation.pendingPayment > 0 && (
                                <p className="text-red-600">Pending payment: {formatCurrency(reservation.pendingPayment)}</p>
                              )}
                            </div>
                            
                            {reservation.specialRequests && (
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Special Requests</p>
                                <p className="text-orange-600">⚠️ {reservation.specialRequests}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Vehicle Assignment & Passenger Distribution */}
          {selectedOperation.vehicleId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Assignment & Passenger Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Vehicle Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {vehicles.filter(v => v.id === selectedOperation.vehicleId).map(vehicle => (
                      <Card key={vehicle.id}>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-500" />
                              <p className="font-semibold text-sm">{vehicle.name}</p>
                            </div>
                            <div className="text-xs space-y-1">
                              <p>Capacity: {vehicle.capacity} passengers</p>
                              <p>Assigned: {selectedOperation.totalPassengers} passengers</p>
                              <p className={`font-medium ${
                                selectedOperation.totalPassengers <= vehicle.capacity ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {vehicle.capacity - selectedOperation.totalPassengers >= 0 
                                  ? `${vehicle.capacity - selectedOperation.totalPassengers} seats available`
                                  : `${selectedOperation.totalPassengers - vehicle.capacity} passengers over capacity`
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Card>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-purple-500" />
                            <p className="font-semibold text-sm">Route Info</p>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>Departure: {selectedOperation.departureTime || 'Not set'}</p>
                            <p>Waiting time: {selectedOperation.expectedWaitingTime} min</p>
                            <p>Pickup locations: {new Set(selectedOperation.reservations.map(r => r.hotelName)).size}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <p className="font-semibold text-sm">Staff</p>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>Driver: {selectedOperation.mainDriver || 'Not assigned'}</p>
                            <p>Guide: {selectedOperation.mainGuide || 'Not assigned'}</p>
                            {selectedOperation.assistantGuide && (
                              <p>Assistant: {selectedOperation.assistantGuide}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Passenger List Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none">
                          <FileText className="w-4 h-4 mr-2" />
                          View Passenger List
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Passenger List - {selectedOperation.tourName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            <p>Date: {format(selectedOperation.date, 'PPP')}</p>
                            <p>Departure: {selectedOperation.departureTime || 'Not set'}</p>
                            <p>Vehicle: {vehicles.find(v => v.id === selectedOperation.vehicleId)?.name}</p>
                          </div>
                          
                          <div className="space-y-2">
                            {selectedOperation.reservations.map((reservation, index) => (
                              <div key={reservation.id} className="border rounded p-3 text-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold">{index + 1}. {reservation.clientName}</p>
                                    <p className="text-xs text-muted-foreground">{reservation.reservationNumber}</p>
                                  </div>
                                  <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                    {reservation.passengers.total} PAX
                                  </Badge>
                                </div>
                                <div className="text-xs space-y-1">
                                  <p><strong>Pickup:</strong> {reservation.pickupLocation}</p>
                                  <p><strong>Hotel:</strong> {reservation.hotelName}</p>
                                  <p><strong>Passengers:</strong> {reservation.passengers.adults}A
                                    {reservation.passengers.children > 0 && ` + ${reservation.passengers.children}C`}
                                    {reservation.passengers.infants > 0 && ` + ${reservation.passengers.infants}I`}
                                  </p>
                                  {reservation.specialRequests && (
                                    <p className="text-orange-600"><strong>Special:</strong> {reservation.specialRequests}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      onClick={() => sendWhatsAppList(selectedOperation)}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send via WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Available Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Available Vehicles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Available Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                  <div key={vehicle.id} className="p-2 rounded border text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-muted-foreground">{vehicle.capacity} seats • {vehicle.licensePlate}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => handleVehicleAssign(vehicle.id)}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Available Drivers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Available Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {drivers.filter(d => d.status === 'available').map((driver) => (
                  <div key={driver.id} className="p-2 rounded border text-xs">
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-muted-foreground">{driver.phone}</p>
                    <p className="text-muted-foreground">License: {driver.licenseNumber}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Available Guides */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Available Guides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guides.filter(g => g.status === 'available').map((guide) => (
                  <div key={guide.id} className="p-2 rounded border text-xs">
                    <p className="font-medium">{guide.name}</p>
                    <p className="text-muted-foreground">{guide.phone}</p>
                    <p className="text-muted-foreground">Languages: {guide.languages.join(', ')}</p>
                    <p className="text-muted-foreground">Specialties: {guide.specialties.join(', ')}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {!selectedOperation && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Select Date and Tour</h3>
              <p className="text-sm text-muted-foreground">
                Choose an operation date and tour to manage logistics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LogisticsPage