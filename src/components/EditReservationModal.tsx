import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import { useToast } from '@/components/ui/use-toast'
import {
  CalendarIcon,
  Save,
  X,
  User,
  MapPin,
  Users,
  DollarSign,
  Building2,
  FileText,
  Clock
} from 'lucide-react'

interface EditReservationModalProps {
  reservation: Reservation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (reservation: Reservation) => void
  filterOptions: {
    salespersons: string[]
    operators: string[]
    guides: string[]
    drivers: string[]
    agencies: string[]
    tours: { id: string; name: string }[]
  }
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  reservation,
  open,
  onOpenChange,
  onSave,
  filterOptions
}) => {
  const { toast } = useToast()
  const [editedReservation, setEditedReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (reservation) {
      setEditedReservation({ ...reservation })
    }
  }, [reservation])

  if (!editedReservation) return null

  const handleFieldChange = (field: string, value: any, nested?: string) => {
    setEditedReservation(prev => {
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
    if (!editedReservation) return
    
    setLoading(true)
    try {
      // Calculate total amount based on passengers and prices
      const totalAmount = 
        (editedReservation.passengers.adults * editedReservation.pricing.adultPrice) +
        (editedReservation.passengers.children * editedReservation.pricing.childPrice) +
        (editedReservation.passengers.infants * editedReservation.pricing.infantPrice)
      
      const updatedReservation = {
        ...editedReservation,
        pricing: {
          ...editedReservation.pricing,
          totalAmount
        },
        updatedAt: new Date()
      }
      
      onSave(updatedReservation)
      toast({
        title: 'Success',
        description: `Reservation ${updatedReservation.reservationNumber} has been updated`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reservation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedReservation(reservation)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Reservation
          </DialogTitle>
          <DialogDescription>
            Editing reservation {editedReservation.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="tour">Tour</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reservationNumber">Reservation Number</Label>
                <Input
                  id="reservationNumber"
                  value={editedReservation.reservationNumber}
                  onChange={(e) => handleFieldChange('reservationNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="purchaseOrderNumber">Purchase Order Number</Label>
                <Input
                  id="purchaseOrderNumber"
                  value={editedReservation.purchaseOrderNumber || ''}
                  onChange={(e) => handleFieldChange('purchaseOrderNumber', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Operation Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedReservation.operationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedReservation.operationDate ? 
                        format(editedReservation.operationDate, "PPP") : 
                        "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedReservation.operationDate}
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
                        !editedReservation.saleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedReservation.saleDate ? 
                        format(editedReservation.saleDate, "PPP") : 
                        "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedReservation.saleDate}
                      onSelect={(date) => handleFieldChange('saleDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Reservation Status</Label>
                <Select 
                  value={editedReservation.status} 
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
                  value={editedReservation.paymentStatus} 
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
                value={editedReservation.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Optional notes..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Name</Label>
                <Input
                  id="clientName"
                  value={editedReservation.client.name}
                  onChange={(e) => handleFieldChange('name', e.target.value, 'client')}
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={editedReservation.client.email}
                  onChange={(e) => handleFieldChange('email', e.target.value, 'client')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={editedReservation.client.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value, 'client')}
                />
              </div>
              <div>
                <Label htmlFor="clientCountry">Country</Label>
                <Input
                  id="clientCountry"
                  value={editedReservation.client.country}
                  onChange={(e) => handleFieldChange('country', e.target.value, 'client')}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientIdNumber">ID Number</Label>
              <Input
                id="clientIdNumber"
                value={editedReservation.client.idNumber}
                onChange={(e) => handleFieldChange('idNumber', e.target.value, 'client')}
              />
            </div>
          </TabsContent>

          <TabsContent value="tour" className="space-y-4">
            <div>
              <Label htmlFor="tourSelect">Tour</Label>
              <Select 
                value={editedReservation.tour.id} 
                onValueChange={(value) => {
                  const selectedTour = filterOptions.tours.find(t => t.id === value)
                  if (selectedTour) {
                    handleFieldChange('tour', {
                      ...editedReservation.tour,
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
                  {filterOptions.tours.map(tour => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tourCode">Tour Code</Label>
                <Input
                  id="tourCode"
                  value={editedReservation.tour.code}
                  onChange={(e) => handleFieldChange('code', e.target.value, 'tour')}
                />
              </div>
              <div>
                <Label htmlFor="tourDestination">Destination</Label>
                <Input
                  id="tourDestination"
                  value={editedReservation.tour.destination}
                  onChange={(e) => handleFieldChange('destination', e.target.value, 'tour')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input
                  id="pickupTime"
                  value={editedReservation.tour.pickupTime}
                  onChange={(e) => handleFieldChange('pickupTime', e.target.value, 'tour')}
                />
              </div>
              <div>
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Input
                  id="pickupAddress"
                  value={editedReservation.tour.pickupAddress}
                  onChange={(e) => handleFieldChange('pickupAddress', e.target.value, 'tour')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="0"
                  value={editedReservation.passengers.adults}
                  onChange={(e) => handleFieldChange('adults', parseInt(e.target.value) || 0, 'passengers')}
                />
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={editedReservation.passengers.children}
                  onChange={(e) => handleFieldChange('children', parseInt(e.target.value) || 0, 'passengers')}
                />
              </div>
              <div>
                <Label htmlFor="infants">Infants</Label>
                <Input
                  id="infants"
                  type="number"
                  min="0"
                  value={editedReservation.passengers.infants}
                  onChange={(e) => handleFieldChange('infants', parseInt(e.target.value) || 0, 'passengers')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={editedReservation.pricing.currency} 
                onValueChange={(value) => handleFieldChange('currency', value, 'pricing')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="CLP">CLP</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adultPrice">Adult Price</Label>
                <Input
                  id="adultPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedReservation.pricing.adultPrice}
                  onChange={(e) => handleFieldChange('adultPrice', parseFloat(e.target.value) || 0, 'pricing')}
                />
              </div>
              <div>
                <Label htmlFor="childPrice">Child Price</Label>
                <Input
                  id="childPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedReservation.pricing.childPrice}
                  onChange={(e) => handleFieldChange('childPrice', parseFloat(e.target.value) || 0, 'pricing')}
                />
              </div>
              <div>
                <Label htmlFor="infantPrice">Infant Price</Label>
                <Input
                  id="infantPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedReservation.pricing.infantPrice}
                  onChange={(e) => handleFieldChange('infantPrice', parseFloat(e.target.value) || 0, 'pricing')}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Adults ({editedReservation.passengers.adults} × {reservationService.formatCurrency(editedReservation.pricing.adultPrice, editedReservation.pricing.currency)}):</span>
                  <span>{reservationService.formatCurrency(editedReservation.passengers.adults * editedReservation.pricing.adultPrice, editedReservation.pricing.currency)}</span>
                </div>
                {editedReservation.passengers.children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Children ({editedReservation.passengers.children} × {reservationService.formatCurrency(editedReservation.pricing.childPrice, editedReservation.pricing.currency)}):</span>
                    <span>{reservationService.formatCurrency(editedReservation.passengers.children * editedReservation.pricing.childPrice, editedReservation.pricing.currency)}</span>
                  </div>
                )}
                {editedReservation.passengers.infants > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Infants ({editedReservation.passengers.infants} × {reservationService.formatCurrency(editedReservation.pricing.infantPrice, editedReservation.pricing.currency)}):</span>
                    <span>{reservationService.formatCurrency(editedReservation.passengers.infants * editedReservation.pricing.infantPrice, editedReservation.pricing.currency)}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg">
                    {reservationService.formatCurrency(
                      (editedReservation.passengers.adults * editedReservation.pricing.adultPrice) +
                      (editedReservation.passengers.children * editedReservation.pricing.childPrice) +
                      (editedReservation.passengers.infants * editedReservation.pricing.infantPrice),
                      editedReservation.pricing.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salesperson">Salesperson</Label>
                <Select 
                  value={editedReservation.salesperson} 
                  onValueChange={(value) => handleFieldChange('salesperson', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.salespersons.map(sp => (
                      <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="operator">Operator</Label>
                <Select 
                  value={editedReservation.operator || 'none'} 
                  onValueChange={(value) => handleFieldChange('operator', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filterOptions.operators.map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guide">Guide</Label>
                <Select 
                  value={editedReservation.guide || 'none'} 
                  onValueChange={(value) => handleFieldChange('guide', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filterOptions.guides.map(guide => (
                      <SelectItem key={guide} value={guide}>{guide}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driver">Driver</Label>
                <Select 
                  value={editedReservation.driver || 'none'} 
                  onValueChange={(value) => handleFieldChange('driver', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filterOptions.drivers.map(driver => (
                      <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="externalAgency">External Agency</Label>
              <Select 
                value={editedReservation.externalAgency || 'none'} 
                onValueChange={(value) => handleFieldChange('externalAgency', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filterOptions.agencies.map(agency => (
                    <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditReservationModal