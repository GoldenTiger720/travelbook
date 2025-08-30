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
  const [tourOperations, setTourOperations] = useState<TourOperation[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedOperation, setSelectedOperation] = useState<TourOperation | null>(null)
  const [vehicleDistribution, setVehicleDistribution] = useState<VehicleDistribution[]>([])
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showVehiclePanel, setShowVehiclePanel] = useState(false)
  
  useEffect(() => {
    loadInitialData()
  }, [])
  
  useEffect(() => {
    if (selectedDate) {
      loadTourOperations()
    }
  }, [selectedDate])
  
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
      
      // Auto-select first tour if none selected
      if (!selectedTour && operations.length > 0) {
        setSelectedTour(operations[0].id)
        setSelectedOperation(operations[0])
      } else if (selectedTour) {
        const operation = operations.find(op => op.id === selectedTour)
        setSelectedOperation(operation || null)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tour operations',
        variant: 'destructive'
      })
    }
  }
  
  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId)
    const operation = tourOperations.find(op => op.id === tourId)
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
        description: `${field} updated successfully`
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
      
      // Load vehicle distribution
      const distribution = await logisticsService.getVehicleDistribution(selectedOperation.id)
      setVehicleDistribution(distribution)
      setShowVehiclePanel(true)
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
  
  const sendWhatsAppList = (distribution: VehicleDistribution) => {
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
          <h1 className="text-2xl font-bold">Tour Operations</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label className="text-sm">Select Tour Operation</Label>
              <Select value={selectedTour} onValueChange={handleTourSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tour" />
                </SelectTrigger>
                <SelectContent>
                  {tourOperations.map((operation) => (
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
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Tour Assignment - {selectedOperation.tourName}
                {getStatusBadge(selectedOperation.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Main Driver</Label>
                  <Select value={selectedOperation.mainDriver || ''} onValueChange={(value) => handleAssignmentUpdate('mainDriver', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No driver assigned</SelectItem>
                      {drivers.filter(d => d.status === 'available').map((driver) => (
                        <SelectItem key={driver.id} value={driver.name}>{driver.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Main Guide</Label>
                  <Select value={selectedOperation.mainGuide || ''} onValueChange={(value) => handleAssignmentUpdate('mainGuide', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No guide assigned</SelectItem>
                      {guides.filter(g => g.status === 'available').map((guide) => (
                        <SelectItem key={guide.id} value={guide.name}>{guide.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Assistant Guide</Label>
                  <Select value={selectedOperation.assistantGuide || ''} onValueChange={(value) => handleAssignmentUpdate('assistantGuide', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No assistant assigned</SelectItem>
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
                  <Select value={selectedOperation.vehicleId || ''} onValueChange={handleVehicleAssign}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No vehicle assigned</SelectItem>
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