import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Destination {
  id: string
  name: string
  tours: Tour[]
}

interface Tour {
  id: string
  name: string
  adult_price: string
  child_price: string
  currency: string
  departure_time: string
}

interface TourData {
  tourId: string
  tourName: string
  destination: string
  destinationId?: string
  date: Date
  pickupAddress: string
  pickupTime: string
  adultPax: number
  adultPrice: number
  childPax: number
  childPrice: number
  infantPax: number
  infantPrice: number
  comments: string
  operator: string
}

interface TourModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  tourData: TourData | null
  destinations: Destination[]
  currency: string
  onSave: (tourData: TourData) => Promise<void>
}

const TourModal: React.FC<TourModalProps> = ({
  isOpen,
  onClose,
  mode,
  tourData,
  destinations,
  currency,
  onSave,
}) => {
  const [formData, setFormData] = useState<TourData>({
    tourId: '',
    tourName: '',
    destination: '',
    destinationId: '',
    date: new Date(),
    pickupAddress: '',
    pickupTime: '',
    adultPax: 0,
    adultPrice: 0,
    childPax: 0,
    childPrice: 0,
    infantPax: 0,
    infantPrice: 0,
    comments: '',
    operator: 'own-operation',
  })

  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [saving, setSaving] = useState(false)

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && tourData) {
      setFormData(tourData)
    } else if (isOpen && !tourData) {
      // Reset for add mode
      setFormData({
        tourId: '',
        tourName: '',
        destination: '',
        destinationId: '',
        date: new Date(),
        pickupAddress: '',
        pickupTime: '',
        adultPax: 0,
        adultPrice: 0,
        childPax: 0,
        childPrice: 0,
        infantPax: 0,
        infantPrice: 0,
        comments: '',
        operator: 'own-operation',
      })
    }
  }, [isOpen, tourData])

  // Filter tours by destination
  useEffect(() => {
    if (formData.destination || formData.destinationId) {
      // Try to find by name first, then by ID
      const selectedDest = destinations.find(d =>
        d.name === formData.destination || d.id === formData.destinationId
      )
      const tours = selectedDest?.tours || []
      console.log('Filtering tours for destination:', formData.destination, 'ID:', formData.destinationId)
      console.log('Found tours:', tours.length)
      if (tours.length > 0) {
        console.log('Sample tour data:', tours[0])
      }
      setFilteredTours(tours)
    } else {
      setFilteredTours([])
    }
  }, [formData.destination, formData.destinationId, destinations])

  // Auto-populate prices when tour is selected
  useEffect(() => {
    if (formData.tourId && filteredTours.length > 0) {
      const selectedTour = filteredTours.find(t => t.id === formData.tourId)
      if (selectedTour) {
        console.log('Selected tour:', selectedTour)
        console.log('Adult price from tour:', selectedTour.adult_price)
        console.log('Child price from tour:', selectedTour.child_price)

        const adultPrice = parseFloat(selectedTour.adult_price) || 0
        const childPrice = parseFloat(selectedTour.child_price) || 0

        console.log('Parsed adult price:', adultPrice)
        console.log('Parsed child price:', childPrice)

        setFormData(prev => ({
          ...prev,
          tourName: selectedTour.name,
          adultPrice,
          childPrice,
          pickupTime: prev.pickupTime || selectedTour.departure_time || '',
        }))
      } else {
        console.warn('Tour not found in filteredTours:', formData.tourId)
      }
    }
  }, [formData.tourId, filteredTours])

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateSubtotal = () => {
    return (
      formData.adultPax * formData.adultPrice +
      formData.childPax * formData.childPrice +
      formData.infantPax * formData.infantPrice
    )
  }

  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$',
    }
    return symbols[curr] || curr
  }

  const handleSave = async () => {
    // Validation
    if (!formData.destination || !formData.tourId) {
      alert('Please select a destination and tour')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving tour:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'add' ? 'Add Tour' : 'Edit Tour'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Destination & Tour Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Select
                value={formData.destination}
                onValueChange={(value) => {
                  const dest = destinations.find(d => d.name === value)
                  handleFieldChange('destination', value)
                  handleFieldChange('destinationId', dest?.id || '')
                  handleFieldChange('tourId', '')
                }}
              >
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.name}>
                      {dest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tour">Tour *</Label>
              <Select
                value={formData.tourId}
                onValueChange={(value) => handleFieldChange('tourId', value)}
                disabled={!formData.destination}
              >
                <SelectTrigger id="tour">
                  <SelectValue placeholder={formData.destination ? 'Select tour' : 'Select destination first'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredTours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleFieldChange('date', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Select
                value={formData.operator}
                onValueChange={(value) => handleFieldChange('operator', value)}
              >
                <SelectTrigger id="operator">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="own-operation">Own Operation</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Input
                id="pickupAddress"
                value={formData.pickupAddress}
                onChange={(e) => handleFieldChange('pickupAddress', e.target.value)}
                placeholder="Enter pickup address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupTime">Pickup Time</Label>
              <Input
                id="pickupTime"
                type="time"
                value={formData.pickupTime}
                onChange={(e) => handleFieldChange('pickupTime', e.target.value)}
              />
            </div>
          </div>

          {/* Passenger & Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adultPax">Adult PAX</Label>
              <Input
                id="adultPax"
                type="number"
                min="0"
                value={formData.adultPax}
                onChange={(e) => handleFieldChange('adultPax', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adultPrice">Adult Price</Label>
              <Input
                id="adultPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.adultPrice}
                onChange={(e) => handleFieldChange('adultPrice', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="childPax">Child PAX</Label>
              <Input
                id="childPax"
                type="number"
                min="0"
                value={formData.childPax}
                onChange={(e) => handleFieldChange('childPax', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="childPrice">Child Price</Label>
              <Input
                id="childPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.childPrice}
                onChange={(e) => handleFieldChange('childPrice', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="infantPax">Infant PAX</Label>
              <Input
                id="infantPax"
                type="number"
                min="0"
                value={formData.infantPax}
                onChange={(e) => handleFieldChange('infantPax', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="infantPrice">Infant Price</Label>
              <Input
                id="infantPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.infantPrice}
                onChange={(e) => handleFieldChange('infantPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Tour Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              placeholder="Enter any special requirements or notes..."
              rows={3}
            />
          </div>

          {/* Subtotal Display */}
          <div className="flex justify-end">
            <div className="text-lg font-semibold">
              Subtotal: {getCurrencySymbol(currency)} {calculateSubtotal().toFixed(2)}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : mode === 'add' ? 'Add Tour' : 'Update Tour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TourModal
