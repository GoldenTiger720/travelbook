import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TourCatalogTab from "@/components/ToursPage/TourCatalogTab"
import DailyAvailabilityTab from "@/components/ToursPage/DailyAvailabilityTab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Calendar,
  MapPin
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { tourService, CreateTourData } from "@/services/tourService"

// Mock data for tours
const toursData = [
  {
    id: 1,
    name: "Buenos Aires City Tour",
    destination: "Buenos Aires",
    status: "active",
    capacity: 45,
    startingPoint: "Plaza de Mayo",
    departureTime: "09:00",
    adultPrice: 85,
    childPrice: 65,
    costs: 45,
    category: "City Tours",
    duration: "8 hours",
    description: "Comprehensive city tour including major attractions"
  },
  {
    id: 2,
    name: "Patagonia Adventure",
    destination: "Patagonia",
    status: "active",
    capacity: 16,
    startingPoint: "Hotel pickup",
    departureTime: "07:30",
    adultPrice: 320,
    childPrice: 250,
    costs: 180,
    category: "Adventure",
    duration: "3 days",
    description: "Multi-day adventure through Patagonian landscapes"
  },
  {
    id: 3,
    name: "Iguazu Falls Experience",
    destination: "Iguazu",
    status: "active",
    capacity: 30,
    startingPoint: "Iguazu National Park",
    departureTime: "08:00",
    adultPrice: 150,
    childPrice: 120,
    costs: 80,
    category: "Nature",
    duration: "Full day",
    description: "Explore the magnificent Iguazu Falls"
  },
  {
    id: 4,
    name: "Wine Country Tour",
    destination: "Mendoza",
    status: "active",
    capacity: 20,
    startingPoint: "Hotel pickup",
    departureTime: "09:30",
    adultPrice: 180,
    childPrice: 140,
    costs: 95,
    category: "Culinary",
    duration: "Full day",
    description: "Wine tasting tour through Mendoza vineyards"
  },
  {
    id: 5,
    name: "Machu Picchu Trek",
    destination: "Cusco",
    status: "inactive",
    capacity: 12,
    startingPoint: "Cusco Center",
    departureTime: "06:00",
    adultPrice: 450,
    childPrice: 380,
    costs: 280,
    category: "Adventure",
    duration: "4 days",
    description: "Classic Inca Trail trek to Machu Picchu"
  }
]

// Mock data for daily availability
const generateCalendarData = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  const calendarData = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    calendarData.push({
      date: date.toISOString().split('T')[0],
      day,
      tours: toursData.filter(t => t.status === 'active').map(tour => ({
        id: tour.id,
        name: tour.name,
        totalCapacity: tour.capacity,
        bookedSpots: Math.floor(Math.random() * tour.capacity * 0.8),
        availableSpots: tour.capacity - Math.floor(Math.random() * tour.capacity * 0.8)
      }))
    })
  }
  return calendarData
}

const ToursPage = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("catalog")
  const [searchTerm, setSearchTerm] = useState("")
  const [destinationFilter, setDestinationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewTourDialog, setShowNewTourDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [selectedTour, setSelectedTour] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<any>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData] = useState(generateCalendarData())
  const [isLoading, setIsLoading] = useState(false)

  // Form data state for new tour
  const [formData, setFormData] = useState<CreateTourData>({
    name: '',
    destination: '',
    capacity: 0,
    departureTime: '',
    adultPrice: 0,
    childPrice: 0,
    startingPoint: '',
    description: '',
    active: true
  })

  // Get unique destinations for filter
  const destinations = [...new Set(toursData.map(tour => tour.destination))]

  // Filter tours based on search and filters
  const filteredTours = toursData.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDestination = destinationFilter === "all" || tour.destination === destinationFilter
    const matchesStatus = statusFilter === "all" || tour.status === statusFilter
    
    return matchesSearch && matchesDestination && matchesStatus
  })

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const dayData = calendarData.find(d => d.date === dateStr)
      days.push({
        day,
        date: dateStr,
        data: dayData
      })
    }
    
    return days
  }

  const handleEditAvailability = (date: any) => {
    setSelectedDate(date)
    setShowAvailabilityDialog(true)
  }

  // Reset form data when dialog closes
  const resetFormData = () => {
    setFormData({
      name: '',
      destination: '',
      capacity: 0,
      departureTime: '',
      adultPrice: 0,
      childPrice: 0,
      startingPoint: '',
      description: '',
      active: true
    })
  }

  // Handle form submission
  const handleCreateTour = async () => {
    if (!formData.name || !formData.destination || formData.capacity <= 0) {
      alert(t('tours.fillRequiredFields') || 'Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await tourService.createTour(formData)
      setShowNewTourDialog(false)
      resetFormData()
      // You might want to refresh the tours list here
      alert(t('tours.tourCreatedSuccessfully') || 'Tour created successfully!')
    } catch (error) {
      console.error('Error creating tour:', error)
      alert(t('tours.errorCreatingTour') || 'Error creating tour. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form field changes
  const handleFormChange = (field: keyof CreateTourData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t('tours.title')}</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            {t('tours.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="catalog" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t('tours.tourCatalog')}</span>
            <span className="xs:hidden">Catalog</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t('tours.dailyAvailability')}</span>
            <span className="xs:hidden">Availability</span>
          </TabsTrigger>
        </TabsList>

        {/* Tour Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4 sm:space-y-6">
          <TourCatalogTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            destinationFilter={destinationFilter}
            setDestinationFilter={setDestinationFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setShowNewTourDialog={setShowNewTourDialog}
            setSelectedTour={setSelectedTour}
            setShowEditDialog={setShowEditDialog}
            toursData={toursData}
            destinations={destinations}
            filteredTours={filteredTours}
          />
        </TabsContent>

        {/* Daily Availability Tab */}
        <TabsContent value="availability" className="space-y-4 sm:space-y-6">
          <DailyAvailabilityTab
            currentMonth={currentMonth}
            navigateMonth={navigateMonth}
            getCalendarDays={getCalendarDays}
            handleEditAvailability={handleEditAvailability}
          />
        </TabsContent>
      </Tabs>

      {/* New Tour Dialog */}
      <Dialog open={showNewTourDialog} onOpenChange={(open) => {
        setShowNewTourDialog(open)
        if (!open) resetFormData()
      }}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('tours.createNewTour')}</DialogTitle>
            <DialogDescription>
              {t('tours.createTourDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="tourName" className="text-sm font-medium">{t('tours.tourName')}</Label>
              <Input
                id="tourName"
                placeholder={t('tours.tourNamePlaceholder')}
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="destination" className="text-sm font-medium">{t('tours.destination')}</Label>
              <Select value={formData.destination} onValueChange={(value) => handleFormChange('destination', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('tours.selectDestination')} />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="capacity" className="text-sm font-medium">{t('tours.capacity')}</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="0"
                value={formData.capacity || ''}
                onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="departureTime" className="text-sm font-medium">{t('tours.departureTime')}</Label>
              <Input
                id="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={(e) => handleFormChange('departureTime', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="adultPrice" className="text-sm font-medium">{t('tours.adultPrice')}</Label>
              <Input
                id="adultPrice"
                type="number"
                placeholder="0"
                value={formData.adultPrice || ''}
                onChange={(e) => handleFormChange('adultPrice', parseFloat(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="childPrice" className="text-sm font-medium">{t('tours.childPrice')}</Label>
              <Input
                id="childPrice"
                type="number"
                placeholder="0"
                value={formData.childPrice || ''}
                onChange={(e) => handleFormChange('childPrice', parseFloat(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="startingPoint" className="text-sm font-medium">{t('tours.startingPoint')}</Label>
              <Input
                id="startingPoint"
                placeholder={t('tours.startingPointPlaceholder')}
                value={formData.startingPoint}
                onChange={(e) => handleFormChange('startingPoint', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">{t('tours.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('tours.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="col-span-full flex items-center space-x-3 py-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleFormChange('active', checked)}
              />
              <Label htmlFor="active" className="text-sm font-medium">{t('tours.activeTour')}</Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewTourDialog(false)
                resetFormData()
              }}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateTour}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? t('common.creating') || 'Creating...' : t('tours.createTour')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tour Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('tours.editTour')}</DialogTitle>
            <DialogDescription>
              {t('tours.editTourDescription')}
            </DialogDescription>
          </DialogHeader>
          {selectedTour && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editTourName">{t('tours.tourName')}</Label>
                <Input id="editTourName" defaultValue={selectedTour.name} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editDestination">{t('tours.destination')}</Label>
                <Select defaultValue={selectedTour.destination}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map(dest => (
                      <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editCapacity">{t('tours.capacity')}</Label>
                <Input id="editCapacity" type="number" defaultValue={selectedTour.capacity} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editDepartureTime">{t('tours.departureTime')}</Label>
                <Input id="editDepartureTime" type="time" defaultValue={selectedTour.departureTime} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editAdultPrice">{t('tours.adultPrice')}</Label>
                <Input id="editAdultPrice" type="number" defaultValue={selectedTour.adultPrice} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="editChildPrice">{t('tours.childPrice')}</Label>
                <Input id="editChildPrice" type="number" defaultValue={selectedTour.childPrice} />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label htmlFor="editStartingPoint">{t('tours.startingPoint')}</Label>
                <Input id="editStartingPoint" defaultValue={selectedTour.startingPoint} />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label htmlFor="editDescription">{t('tours.description')}</Label>
                <Textarea id="editDescription" defaultValue={selectedTour.description} />
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center space-x-2">
                <Switch id="editActive" defaultChecked={selectedTour.status === 'active'} />
                <Label htmlFor="editActive">{t('tours.activeTour')}</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              {t('tours.updateTour')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Edit Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('tours.editDailyAvailability')}</DialogTitle>
            <DialogDescription>
              {selectedDate && `${t('tours.editAvailabilityDescription')} ${selectedDate.date}`}
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4">
              {selectedDate.tours?.map((tour: any) => (
                <div key={tour.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-sm sm:text-base">{tour.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">{t('tours.totalCapacity')}</Label>
                      <Input type="number" defaultValue={tour.totalCapacity} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t('tours.bookedSpots')}</Label>
                      <Input type="number" defaultValue={tour.bookedSpots} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t('tours.availableSpots')}</Label>
                      <Input type="number" defaultValue={tour.availableSpots} readOnly className="bg-muted" />
                    </div>
                  </div>
                </div>
              )) || (
                selectedDate.tour && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm sm:text-base">{selectedDate.tour.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">{t('tours.totalCapacity')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.totalCapacity} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">{t('tours.bookedSpots')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.bookedSpots} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">{t('tours.availableSpots')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.availableSpots} readOnly className="bg-muted" />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button onClick={() => setShowAvailabilityDialog(false)} className="w-full sm:w-auto">
              {t('tours.updateAvailability')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ToursPage