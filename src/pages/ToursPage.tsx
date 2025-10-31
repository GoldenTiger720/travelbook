import React, { useState } from "react"
import { toast } from "sonner"
import Swal from "sweetalert2"
import html2pdf from "html2pdf.js"
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
  Calendar,
  MapPin
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { tourService, CreateTourData, Tour } from "@/services/tourService"
import { destinationService, Destination } from "@/services/destinationService"
import { format } from "date-fns"

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
  const [tours, setTours] = useState<any[]>([]) // Display format tours
  const [isLoadingTours, setIsLoadingTours] = useState(false)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false)

  // Map backend tour data to frontend display format
  const mapBackendToursToDisplayFormat = (backendTours: Tour[]) => {
    return backendTours.map(tour => ({
      id: tour.id,
      name: tour.name,
      destination: tour.destination.name, // Extract name from destination object
      status: tour.active ? 'active' : 'inactive',
      capacity: tour.capacity,
      startingPoint: tour.starting_point,
      departureTime: tour.departure_time,
      adultPrice: parseFloat(tour.adult_price),
      childPrice: parseFloat(tour.child_price),
      currency: tour.currency,
      description: tour.description,
      created_at: tour.created_at,
      updated_at: tour.updated_at,
      // Additional destination info for reference
      destinationObj: tour.destination
    }))
  }

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
    currency: 'CLP',
    active: true
  })

  // Load tours and destinations from API on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoadingTours(true)
      setIsLoadingDestinations(true)

      try {
        // Load tours and destinations in parallel
        const [fetchedTours, fetchedDestinations] = await Promise.all([
          tourService.getTours(),
          destinationService.getDestinations()
        ])

        setTours(mapBackendToursToDisplayFormat(Array.isArray(fetchedTours) ? fetchedTours : []))
        setDestinations(Array.isArray(fetchedDestinations) ? fetchedDestinations : [])
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to mock data if API fails
        setTours(Array.isArray(toursData) ? toursData : [])
        setDestinations([])
      } finally {
        setIsLoadingTours(false)
        setIsLoadingDestinations(false)
      }
    }

    loadData()
  }, [])

  // Get destination names for filter (from tours if destinations not loaded yet)
  const destinationOptions = destinations.length > 0
    ? destinations.map(dest => dest.name)
    : [...new Set((tours || []).map(tour => tour.destination))]

  // Filter tours based on search and filters
  const filteredTours = (tours || []).filter(tour => {
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
      currency: 'CLP',
      active: true
    })
  }

  // Handle form submission
  const handleCreateTour = async () => {
    if (!formData.name || !formData.destination || formData.capacity <= 0) {
      toast.warning(t('tours.fillRequiredFields') || 'Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await tourService.createTour(formData)
      setShowNewTourDialog(false)
      resetFormData()
      // Refresh tours list
      const updatedTours = await tourService.getTours()
      setTours(mapBackendToursToDisplayFormat(Array.isArray(updatedTours) ? updatedTours : []))
      toast.success(t('tours.tourCreatedSuccessfully') || 'Tour created successfully!')
    } catch (error) {
      console.error('Error creating tour:', error)
      toast.error(t('tours.errorCreatingTour') || 'Error creating tour. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle update tour
  const handleUpdateTour = async () => {
    if (!selectedTour || !editFormData) {
      toast.warning('No tour data to update')
      return
    }

    setIsLoading(true)
    try {
      await tourService.updateTour(selectedTour.id.toString(), editFormData)
      setShowEditDialog(false)
      setSelectedTour(null)
      setEditFormData(null)
      // Refresh tours list
      const updatedTours = await tourService.getTours()
      setTours(mapBackendToursToDisplayFormat(Array.isArray(updatedTours) ? updatedTours : []))
      toast.success(t('tours.tourUpdatedSuccessfully') || 'Tour updated successfully!')
    } catch (error) {
      console.error('Error updating tour:', error)
      toast.error(t('tours.errorUpdatingTour') || 'Error updating tour. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete tour
  const handleDeleteTour = async (tour: any) => {
    const result = await Swal.fire({
      title: t('tours.confirmDeleteTour') || 'Are you sure?',
      text: `Do you want to delete "${tour.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    // Show loading state with progress bar
    Swal.fire({
      title: 'Deleting Tour...',
      text: 'Please wait while we delete the tour.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      backdrop: `
        rgba(0,0,0,0.6)
        center
        no-repeat
      `,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    setIsLoading(true)
    try {
      await tourService.deleteTour(tour.id.toString())
      // Refresh tours list
      const updatedTours = await tourService.getTours()
      setTours(mapBackendToursToDisplayFormat(Array.isArray(updatedTours) ? updatedTours : []))

      Swal.close()
      toast.success(t('tours.tourDeletedSuccessfully') || 'Tour deleted successfully!')
    } catch (error) {
      console.error('Error deleting tour:', error)
      Swal.close()
      toast.error(t('tours.errorDeletingTour') || 'Error deleting tour. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle edit form changes
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle tours export (CSV/Excel)
  const handleExportTours = () => {
    const headers = [
      "Tour Name",
      "Destination",
      "Capacity",
      "Starting Point",
      "Departure Time",
      "Adult Price",
      "Child Price",
      "Currency",
      "Created Date"
    ]

    const rows = tours.map(tour => [
      tour.name,
      tour.destination,
      tour.capacity,
      tour.startingPoint,
      tour.departureTime,
      tour.adultPrice,
      tour.childPrice,
      tour.currency,
      format(new Date(tour.created_at), "yyyy-MM-dd")
    ])

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `tours_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Tours exported successfully!")
  }

  // Handle tours print (PDF)
  const handlePrintTours = () => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
        <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">TravelBook - Tours Report</h1>
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
          <p><strong>Export Date:</strong> ${format(new Date(), "MMMM d, yyyy")}</p>
          <p><strong>Total Tours:</strong> ${tours.length}</p>
          <p><strong>Total Capacity:</strong> ${tours.reduce((sum, tour) => sum + tour.capacity, 0)} passengers</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Tour Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Destination</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Capacity</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Starting Point</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Departure Time</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Adult Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Child Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Currency</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; background-color: #f3f4f6; font-weight: bold;">Created Date</th>
            </tr>
          </thead>
          <tbody>
            ${tours.map((tour, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.destination}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.capacity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.startingPoint}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.departureTime}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.currency || '$'} ${tour.adultPrice}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.currency || '$'} ${tour.childPrice}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.currency || '$'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">${tour.created_at ? format(new Date(tour.created_at), "MMM d, yyyy") : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    // Create a temporary div element
    const element = document.createElement('div')
    element.innerHTML = htmlContent

    // PDF options
    const options = {
      margin: 1,
      filename: `tours_report_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' as const }
    }

    // Generate and download PDF
    html2pdf().from(element).set(options).save().then(() => {
      toast.success("PDF downloaded successfully!")
    }).catch((error) => {
      console.error('Error generating PDF:', error)
      toast.error("Error generating PDF. Please try again.")
    })
  }

  // Initialize edit form when tour is selected
  React.useEffect(() => {
    if (selectedTour && showEditDialog) {
      // Find destination ID from destination name
      const destinationObj = destinations.find(dest => dest.name === selectedTour.destination)
      const destinationId = destinationObj ? destinationObj.id : selectedTour.destination

      setEditFormData({
        name: selectedTour.name,
        destination: destinationId,
        capacity: selectedTour.capacity,
        departureTime: selectedTour.departureTime,
        adultPrice: selectedTour.adultPrice,
        childPrice: selectedTour.childPrice,
        startingPoint: selectedTour.startingPoint,
        description: selectedTour.description,
        currency: selectedTour.currency || 'CLP',
        active: selectedTour.status === 'active'
      })
    }
  }, [selectedTour, showEditDialog, destinations])

  // Handle form field changes
  const handleFormChange = (field: keyof CreateTourData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0 w-full max-w-full overflow-x-hidden">
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
        <TabsContent value="catalog" className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
          {isLoadingTours ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading tours...</div>
            </div>
          ) : (
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
            onDeleteTour={handleDeleteTour}
            toursData={tours}
            destinations={destinationOptions}
            filteredTours={filteredTours}
            onPrintTours={handlePrintTours}
            onExportTours={handleExportTours}
          />
          )}
        </TabsContent>

        {/* Daily Availability Tab */}
        <TabsContent value="availability" className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
                  {isLoadingDestinations ? (
                    <SelectItem value="_loading" disabled>Loading destinations...</SelectItem>
                  ) : destinations.length > 0 ? (
                    destinations.map(dest => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_empty" disabled>No destinations available</SelectItem>
                  )}
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
            <div className="space-y-2 col-span-1">
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleFormChange('currency', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLP">{t('quotes.chileanPesos')}</SelectItem>
                  <SelectItem value="USD">{t('quotes.usDollars')}</SelectItem>
                  <SelectItem value="EUR">{t('quotes.euros')}</SelectItem>
                  <SelectItem value="BRL">{t('quotes.brazilianReais')}</SelectItem>
                  <SelectItem value="ARS">{t('quotes.argentinePesos')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
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
          {selectedTour && editFormData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editTourName" className="text-sm font-medium">{t('tours.tourName')}</Label>
                <Input
                  id="editTourName"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editDestination" className="text-sm font-medium">{t('tours.destination')}</Label>
                <Select value={editFormData.destination} onValueChange={(value) => handleEditFormChange('destination', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDestinations ? (
                      <SelectItem value="_loading" disabled>Loading destinations...</SelectItem>
                    ) : destinations.length > 0 ? (
                      destinations.map(dest => (
                        <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>No destinations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editCapacity" className="text-sm font-medium">{t('tours.capacity')}</Label>
                <Input
                  id="editCapacity"
                  type="number"
                  value={editFormData.capacity || ''}
                  onChange={(e) => handleEditFormChange('capacity', parseInt(e.target.value) || 0)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editDepartureTime" className="text-sm font-medium">{t('tours.departureTime')}</Label>
                <Input
                  id="editDepartureTime"
                  type="time"
                  value={editFormData.departureTime || ''}
                  onChange={(e) => handleEditFormChange('departureTime', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editAdultPrice" className="text-sm font-medium">{t('tours.adultPrice')}</Label>
                <Input
                  id="editAdultPrice"
                  type="number"
                  value={editFormData.adultPrice || ''}
                  onChange={(e) => handleEditFormChange('adultPrice', parseFloat(e.target.value) || 0)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editChildPrice" className="text-sm font-medium">{t('tours.childPrice')}</Label>
                <Input
                  id="editChildPrice"
                  type="number"
                  value={editFormData.childPrice || ''}
                  onChange={(e) => handleEditFormChange('childPrice', parseFloat(e.target.value) || 0)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editCurrency" className="text-sm font-medium">Currency</Label>
                <Select value={editFormData.currency} onValueChange={(value) => handleEditFormChange('currency', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">{t('quotes.chileanPesos')}</SelectItem>
                    <SelectItem value="USD">{t('quotes.usDollars')}</SelectItem>
                    <SelectItem value="EUR">{t('quotes.euros')}</SelectItem>
                    <SelectItem value="BRL">{t('quotes.brazilianReais')}</SelectItem>
                    <SelectItem value="ARS">{t('quotes.argentinePesos')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="editStartingPoint" className="text-sm font-medium">{t('tours.startingPoint')}</Label>
                <Input
                  id="editStartingPoint"
                  value={editFormData.startingPoint || ''}
                  onChange={(e) => handleEditFormChange('startingPoint', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="editDescription" className="text-sm font-medium">{t('tours.description')}</Label>
                <Textarea
                  id="editDescription"
                  value={editFormData.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="col-span-full flex items-center space-x-3 py-2">
                <Switch
                  id="editActive"
                  checked={editFormData.active}
                  onCheckedChange={(checked) => handleEditFormChange('active', checked)}
                />
                <Label htmlFor="editActive" className="text-sm font-medium">{t('tours.activeTour')}</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdateTour}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? t('common.updating') || 'Updating...' : t('tours.updateTour')}
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
            <div className="space-y-3 sm:space-y-4">
              {selectedDate.tours?.map((tour: any) => (
                <div key={tour.id} className="border rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base truncate">{tour.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">{t('tours.totalCapacity')}</Label>
                      <Input type="number" defaultValue={tour.totalCapacity} className="h-9 sm:h-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">{t('tours.bookedSpots')}</Label>
                      <Input type="number" defaultValue={tour.bookedSpots} className="h-9 sm:h-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-medium">{t('tours.availableSpots')}</Label>
                      <Input type="number" defaultValue={tour.availableSpots} readOnly className="bg-muted h-9 sm:h-10" />
                    </div>
                  </div>
                </div>
              )) || (
                selectedDate.tour && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base truncate">{selectedDate.tour.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">{t('tours.totalCapacity')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.totalCapacity} className="h-9 sm:h-10" />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">{t('tours.bookedSpots')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.bookedSpots} className="h-9 sm:h-10" />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">{t('tours.availableSpots')}</Label>
                        <Input type="number" defaultValue={selectedDate.tour.availableSpots} readOnly className="bg-muted h-9 sm:h-10" />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
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