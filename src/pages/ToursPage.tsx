import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TourCatalogTab from "@/components/ToursPage/TourCatalogTab"
import DailyAvailabilityTab from "@/components/ToursPage/DailyAvailabilityTab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

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

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />{t('tours.active')}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />{t('tours.inactive')}</Badge>
    }
  }

  const monthNames = [
    t('reservations.january'), t('reservations.february'), t('reservations.march'),
    t('reservations.april'), t('reservations.may'), t('reservations.june'),
    t('reservations.july'), t('reservations.august'), t('reservations.september'),
    t('reservations.october'), t('reservations.november'), t('reservations.december')
  ]

  const dayNames = [
    t('reservations.sunday'), t('reservations.monday'), t('reservations.tuesday'),
    t('reservations.wednesday'), t('reservations.thursday'), t('reservations.friday'), t('reservations.saturday')
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('tours.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('tours.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('tours.tourCatalog')}
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('tours.dailyAvailability')}
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
            t={t}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        {/* Daily Availability Tab */}
        <TabsContent value="availability" className="space-y-4 sm:space-y-6">
          <DailyAvailabilityTab
            currentMonth={currentMonth}
            navigateMonth={navigateMonth}
            getCalendarDays={getCalendarDays}
            handleEditAvailability={handleEditAvailability}
            monthNames={monthNames}
            dayNames={dayNames}
            t={t}
          />
        </TabsContent>
      </Tabs>

      {/* New Tour Dialog */}
      <Dialog open={showNewTourDialog} onOpenChange={setShowNewTourDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{t('tours.createNewTour')}</DialogTitle>
            <DialogDescription>
              {t('tours.createTourDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="tourName">{t('tours.tourName')}</Label>
              <Input id="tourName" placeholder={t('tours.tourNamePlaceholder')} />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="destination">{t('tours.destination')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('tours.selectDestination')} />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="capacity">{t('tours.capacity')}</Label>
              <Input id="capacity" type="number" placeholder="0" />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="departureTime">{t('tours.departureTime')}</Label>
              <Input id="departureTime" type="time" />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="adultPrice">{t('tours.adultPrice')}</Label>
              <Input id="adultPrice" type="number" placeholder="0" />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="childPrice">{t('tours.childPrice')}</Label>
              <Input id="childPrice" type="number" placeholder="0" />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="startingPoint">{t('tours.startingPoint')}</Label>
              <Input id="startingPoint" placeholder={t('tours.startingPointPlaceholder')} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="description">{t('tours.description')}</Label>
              <Textarea id="description" placeholder={t('tours.descriptionPlaceholder')} />
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center space-x-2">
              <Switch id="active" />
              <Label htmlFor="active">{t('tours.activeTour')}</Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNewTourDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button onClick={() => setShowNewTourDialog(false)} className="w-full sm:w-auto">
              {t('tours.createTour')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tour Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{t('tours.editDailyAvailability')}</DialogTitle>
            <DialogDescription>
              {selectedDate && t('tours.editAvailabilityDescription', { date: selectedDate.date })}
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4">
              {selectedDate.tours?.map(tour => (
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