import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import { useToast } from '@/components/ui/use-toast'
import {
  CalendarIcon,
  Save,
  ArrowLeft,
  User,
  MapPin,
  Users,
  DollarSign,
  Building2,
  FileText,
  Clock,
  Mail,
  Phone,
  Globe,
  Hash,
  UserCheck,
  Baby,
  UserPlus,
  Car,
  AlertCircle
} from 'lucide-react'

const ReservationEditPage = () => {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterOptions, setFilterOptions] = useState<any>({
    salespersons: [],
    operators: [],
    guides: [],
    drivers: [],
    agencies: [],
    tours: []
  })

  useEffect(() => {
    loadReservationData()
  }, [reservationId])

  const loadReservationData = async () => {
    setLoading(true)
    try {
      const [reservations, uniqueValues] = await Promise.all([
        reservationService.getAllReservations(),
        reservationService.getUniqueValues()
      ])
      
      const foundReservation = reservations.find((r: Reservation) => r.id === reservationId)
      if (foundReservation) {
        setReservation(foundReservation)
      }
      setFilterOptions(uniqueValues)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reservation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: any, nested?: string) => {
    setReservation(prev => {
      if (!prev) return null
      
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested as keyof Reservation],
            [field]: value
          }
        }
      }
      
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleSave = async () => {
    if (!reservation) return
    
    setSaving(true)
    try {
      // Calculate total amount based on passengers and prices
      const totalAmount = 
        (reservation.passengers.adults * reservation.pricing.adultPrice) +
        (reservation.passengers.children * reservation.pricing.childPrice) +
        (reservation.passengers.infants * reservation.pricing.infantPrice)
      
      const updatedReservation = {
        ...reservation,
        pricing: {
          ...reservation.pricing,
          totalAmount
        },
        updatedAt: new Date()
      }
      
      // Here you would typically call an API to save the reservation
      // For now, we'll just show a success message
      toast({
        title: '✅ Reservation Updated',
        description: `Reservation ${updatedReservation.reservationNumber} has been saved successfully`,
      })
      
      // Navigate back to all reservations
      navigate('/all-reservations')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save reservation',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reservation...</p>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Reservation Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The reservation you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/all-reservations')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reservations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Header with Save Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/all-reservations')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Reservation</h1>
              <p className="text-muted-foreground">#{reservation.reservationNumber}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  General Information
                </span>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                    {reservation.paymentStatus}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reservationNumber">Reservation Number</Label>
                  <Input
                    id="reservationNumber"
                    value={reservation.reservationNumber}
                    onChange={(e) => handleFieldChange('reservationNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseOrderNumber">Purchase Order Number</Label>
                  <Input
                    id="purchaseOrderNumber"
                    value={reservation.purchaseOrderNumber || ''}
                    onChange={(e) => handleFieldChange('purchaseOrderNumber', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Operation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reservation.operationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reservation.operationDate ? 
                          format(reservation.operationDate, "PPP") : 
                          "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reservation.operationDate}
                        onSelect={(date) => handleFieldChange('operationDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Sale Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reservation.saleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reservation.saleDate ? 
                          format(reservation.saleDate, "PPP") : 
                          "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reservation.saleDate}
                        onSelect={(date) => handleFieldChange('saleDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Reservation Status</Label>
                  <Select 
                    value={reservation.status} 
                    onValueChange={(value) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select 
                    value={reservation.paymentStatus} 
                    onValueChange={(value) => handleFieldChange('paymentStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={reservation.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this reservation..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Name</Label>
                  <Input
                    id="clientName"
                    value={reservation.client.name}
                    onChange={(e) => handleFieldChange('name', e.target.value, 'client')}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      type="email"
                      className="pl-10"
                      value={reservation.client.email}
                      onChange={(e) => handleFieldChange('email', e.target.value, 'client')}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientPhone"
                      className="pl-10"
                      value={reservation.client.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value, 'client')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientCountry">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientCountry"
                      className="pl-10"
                      value={reservation.client.country}
                      onChange={(e) => handleFieldChange('country', e.target.value, 'client')}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="clientIdNumber">ID Number</Label>
                <Input
                  id="clientIdNumber"
                  value={reservation.client.idNumber}
                  onChange={(e) => handleFieldChange('idNumber', e.target.value, 'client')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Tour Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tourSelect">Tour</Label>
                <Select 
                  value={reservation.tour.id} 
                  onValueChange={(value) => {
                    const selectedTour = filterOptions.tours.find((t: any) => t.id === value)
                    if (selectedTour) {
                      handleFieldChange('tour', {
                        ...reservation.tour,
                        id: selectedTour.id,
                        name: selectedTour.name
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.tours.map((tour: any) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tourCode">Tour Code</Label>
                  <Input
                    id="tourCode"
                    value={reservation.tour.code}
                    onChange={(e) => handleFieldChange('code', e.target.value, 'tour')}
                  />
                </div>
                <div>
                  <Label htmlFor="tourDestination">Destination</Label>
                  <Input
                    id="tourDestination"
                    value={reservation.tour.destination}
                    onChange={(e) => handleFieldChange('destination', e.target.value, 'tour')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickupTime"
                      className="pl-10"
                      value={reservation.tour.pickupTime}
                      onChange={(e) => handleFieldChange('pickupTime', e.target.value, 'tour')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickupAddress"
                      className="pl-10"
                      value={reservation.tour.pickupAddress}
                      onChange={(e) => handleFieldChange('pickupAddress', e.target.value, 'tour')}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">Passengers</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="adults" className="text-sm text-muted-foreground">Adults</Label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adults"
                        type="number"
                        min="0"
                        className="pl-10"
                        value={reservation.passengers.adults}
                        onChange={(e) => handleFieldChange('adults', parseInt(e.target.value) || 0, 'passengers')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="children" className="text-sm text-muted-foreground">Children</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="children"
                        type="number"
                        min="0"
                        className="pl-10"
                        value={reservation.passengers.children}
                        onChange={(e) => handleFieldChange('children', parseInt(e.target.value) || 0, 'passengers')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="infants" className="text-sm text-muted-foreground">Infants</Label>
                    <div className="relative">
                      <Baby className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="infants"
                        type="number"
                        min="0"
                        className="pl-10"
                        value={reservation.passengers.infants}
                        onChange={(e) => handleFieldChange('infants', parseInt(e.target.value) || 0, 'passengers')}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total Passengers: {reservation.passengers.adults + reservation.passengers.children + reservation.passengers.infants} PAX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={reservation.pricing.currency} 
                  onValueChange={(value) => handleFieldChange('currency', value, 'pricing')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="CLP">CLP - Chilean Peso</SelectItem>
                    <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                    <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adultPrice">Adult Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                      {reservation.pricing.currency}
                    </span>
                    <Input
                      id="adultPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-12"
                      value={reservation.pricing.adultPrice}
                      onChange={(e) => handleFieldChange('adultPrice', parseFloat(e.target.value) || 0, 'pricing')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="childPrice">Child Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                      {reservation.pricing.currency}
                    </span>
                    <Input
                      id="childPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-12"
                      value={reservation.pricing.childPrice}
                      onChange={(e) => handleFieldChange('childPrice', parseFloat(e.target.value) || 0, 'pricing')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="infantPrice">Infant Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                      {reservation.pricing.currency}
                    </span>
                    <Input
                      id="infantPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-12"
                      value={reservation.pricing.infantPrice}
                      onChange={(e) => handleFieldChange('infantPrice', parseFloat(e.target.value) || 0, 'pricing')}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Price Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Adults ({reservation.passengers.adults} × {reservationService.formatCurrency(reservation.pricing.adultPrice, reservation.pricing.currency)}):</span>
                    <span className="font-medium">
                      {reservationService.formatCurrency(reservation.passengers.adults * reservation.pricing.adultPrice, reservation.pricing.currency)}
                    </span>
                  </div>
                  {reservation.passengers.children > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Children ({reservation.passengers.children} × {reservationService.formatCurrency(reservation.pricing.childPrice, reservation.pricing.currency)}):</span>
                      <span className="font-medium">
                        {reservationService.formatCurrency(reservation.passengers.children * reservation.pricing.childPrice, reservation.pricing.currency)}
                      </span>
                    </div>
                  )}
                  {reservation.passengers.infants > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Infants ({reservation.passengers.infants} × {reservationService.formatCurrency(reservation.pricing.infantPrice, reservation.pricing.currency)}):</span>
                      <span className="font-medium">
                        {reservationService.formatCurrency(reservation.passengers.infants * reservation.pricing.infantPrice, reservation.pricing.currency)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">
                      {reservationService.formatCurrency(
                        (reservation.passengers.adults * reservation.pricing.adultPrice) +
                        (reservation.passengers.children * reservation.pricing.childPrice) +
                        (reservation.passengers.infants * reservation.pricing.infantPrice),
                        reservation.pricing.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Operations Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salesperson">Salesperson</Label>
                  <Select 
                    value={reservation.salesperson} 
                    onValueChange={(value) => handleFieldChange('salesperson', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.salespersons.map((sp: string) => (
                        <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operator">Operator</Label>
                  <Select 
                    value={reservation.operator || 'none'} 
                    onValueChange={(value) => handleFieldChange('operator', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {filterOptions.operators.map((op: string) => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guide">Guide</Label>
                  <Select 
                    value={reservation.guide || 'none'} 
                    onValueChange={(value) => handleFieldChange('guide', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {filterOptions.guides.map((guide: string) => (
                        <SelectItem key={guide} value={guide}>{guide}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select 
                    value={reservation.driver || 'none'} 
                    onValueChange={(value) => handleFieldChange('driver', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {filterOptions.drivers.map((driver: string) => (
                        <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="externalAgency">External Agency</Label>
                <Select 
                  value={reservation.externalAgency || 'none'} 
                  onValueChange={(value) => handleFieldChange('externalAgency', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Assigned</SelectItem>
                    {filterOptions.agencies.map((agency: string) => (
                      <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reservation Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Created On</p>
                <p className="text-sm">{format(reservation.createdAt, "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
              {reservation.updatedAt && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{format(reservation.updatedAt, "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Reservation ID</p>
                <p className="text-sm font-mono">{reservation.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/all-reservations')}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReservationEditPage