import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCalendarReservations } from "@/hooks/useReservations"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Loader2
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday
} from "date-fns"

// Default tour capacity (can be overridden with actual data if available)
const DEFAULT_TOUR_CAPACITY = 50

export function ReservationCalendar() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Fetch all reservations from API
  const { data: apiReservations, isLoading, isError } = useCalendarReservations()

  // Transform API data to calendar format
  const reservations = useMemo(() => {
    if (!apiReservations) return []

    return apiReservations.map(reservation => ({
      id: reservation.id,
      date: new Date(reservation.tour.date),
      tour: reservation.tour.name,
      pax: reservation.passengers.adults + reservation.passengers.children + reservation.passengers.infants,
      status: reservation.status,
      customer: reservation.client.name
    }))
  }, [apiReservations])

  // Extract unique tours and their capacities
  const tourCapacities = useMemo(() => {
    const capacities: { [key: string]: number } = {}
    reservations.forEach(reservation => {
      if (!capacities[reservation.tour]) {
        // Use default capacity for now - can be extended to fetch from tour data
        capacities[reservation.tour] = DEFAULT_TOUR_CAPACITY
      }
    })
    return capacities
  }, [reservations])
  
  const dayNames = [
    t('reservations.sun'),
    t('reservations.mon'),
    t('reservations.tue'),
    t('reservations.wed'),
    t('reservations.thu'),
    t('reservations.fri'),
    t('reservations.sat')
  ]
  
  const monthNames = [
    t('reservations.january'),
    t('reservations.february'),
    t('reservations.march'),
    t('reservations.april'),
    t('reservations.may'),
    t('reservations.june'),
    t('reservations.july'),
    t('reservations.august'),
    t('reservations.september'),
    t('reservations.october'),
    t('reservations.november'),
    t('reservations.december')
  ]

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add empty cells for days before the month starts
  const startDay = getDay(monthStart)
  const emptyCellsBefore = Array(startDay).fill(null)
  
  // Add empty cells for days after the month ends to complete the grid
  const totalCells = emptyCellsBefore.length + calendarDays.length
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const emptyCellsAfter = Array(remainingCells).fill(null)

  const allCalendarCells = [...emptyCellsBefore, ...calendarDays, ...emptyCellsAfter]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const handleMonthSelect = (monthIndex: string) => {
    const newDate = new Date(currentDate.getFullYear(), parseInt(monthIndex), 1)
    setCurrentDate(newDate)
  }

  const handleYearSelect = (year: string) => {
    const newDate = new Date(parseInt(year), currentDate.getMonth(), 1)
    setCurrentDate(newDate)
  }

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => 
      reservation.date.toDateString() === date.toDateString()
    )
  }

  const getTourSummaryForDate = (date: Date) => {
    const dayReservations = getReservationsForDate(date)
    const tourSummary: { [key: string]: { pax: number; capacity: number } } = {}
    
    dayReservations.forEach(reservation => {
      if (!tourSummary[reservation.tour]) {
        tourSummary[reservation.tour] = {
          pax: 0,
          capacity: tourCapacities[reservation.tour as keyof typeof tourCapacities] || 0
        }
      }
      tourSummary[reservation.tour].pax += reservation.pax
    })
    
    return tourSummary
  }

  const getTotalPaxAndCapacity = (date: Date) => {
    const tourSummary = getTourSummaryForDate(date)
    const totalPax = Object.values(tourSummary).reduce((sum, tour) => sum + tour.pax, 0)
    const totalCapacity = Object.values(tourSummary).reduce((sum, tour) => sum + tour.capacity, 0)
    return { totalPax, totalCapacity }
  }

  const getOccupancyColor = (pax: number, capacity: number) => {
    if (capacity === 0) return "bg-gray-100"
    const percentage = (pax / capacity) * 100
    if (percentage >= 90) return "bg-red-100 border-red-300"
    if (percentage >= 70) return "bg-yellow-100 border-yellow-300"
    if (percentage >= 40) return "bg-green-100 border-green-300"
    if (percentage > 0) return "bg-blue-100 border-blue-300"
    return "bg-gray-50"
  }

  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('reservations.title')}</h1>
            <p className="text-muted-foreground">{t('reservations.subtitle')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading reservations...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('reservations.title')}</h1>
            <p className="text-muted-foreground">{t('reservations.subtitle')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Error loading reservations</p>
              <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('reservations.title')}</h1>
          <p className="text-muted-foreground">
            {t('reservations.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {t('reservations.monthlyView')}
              </CardTitle>
              
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex gap-2 flex-1 sm:flex-initial">
                  <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthSelect}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearSelect}>
                    <SelectTrigger className="w-full sm:w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
              {/* Day headers */}
              {dayNames.map(day => (
                <div
                  key={day}
                  className="bg-muted p-2 sm:p-3 text-center text-xs sm:text-sm font-medium border-b border-r last:border-r-0"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
              
              {/* Calendar cells */}
              {allCalendarCells.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-20 sm:h-24 lg:h-28 border-b border-r last:border-r-0 bg-gray-50"
                    />
                  )
                }
                
                const dayReservations = getReservationsForDate(date)
                const tourSummary = getTourSummaryForDate(date)
                const { totalPax, totalCapacity } = getTotalPaxAndCapacity(date)
                const isCurrentMonth = isSameMonth(date, currentDate)
                
                return (
                  <div
                    key={date.toDateString()}
                    className={`h-20 sm:h-24 lg:h-28 border-b border-r last:border-r-0 p-1 sm:p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${getOccupancyColor(totalPax, totalCapacity)} ${
                      isToday(date) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-xs sm:text-sm font-medium mb-1">
                      {format(date, 'd')}
                    </div>
                    
                    {isCurrentMonth && totalPax > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded">
                          <Users className="w-3 h-3 inline mr-1" />
                          <span className="hidden sm:inline">{t('reservations.pax')}: </span>
                          {totalPax}/{totalCapacity}
                        </div>
                        
                        <div className="space-y-0.5 max-h-12 sm:max-h-16 overflow-hidden">
                          {Object.entries(tourSummary).slice(0, 2).map(([tour, data]) => (
                            <div
                              key={tour}
                              className="text-xs bg-white/80 px-1 py-0.5 rounded text-gray-700 truncate"
                            >
                              <span className="hidden lg:inline">{tour}: </span>
                              <span className="lg:hidden">{tour.slice(0, 8)}: </span>
                              {data.pax}
                            </div>
                          ))}
                          {Object.keys(tourSummary).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{Object.keys(tourSummary).length - 2} {t('reservations.more')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Day Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              {selectedDate ? format(selectedDate, "EEEE, MMM dd") : t('reservations.selectDate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {(() => {
                  const dayReservations = getReservationsForDate(selectedDate)
                  const tourSummary = getTourSummaryForDate(selectedDate)
                  const { totalPax, totalCapacity } = getTotalPaxAndCapacity(selectedDate)
                  
                  if (dayReservations.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('reservations.noReservationsForDate')}</p>
                      </div>
                    )
                  }
                  
                  return (
                    <>
                      {/* Daily Summary */}
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{t('reservations.dailyTotal')}</span>
                          <Badge variant="secondary">
                            {Object.keys(tourSummary).length} {Object.keys(tourSummary).length !== 1 ? t('reservations.tours') : t('reservations.tour')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{totalPax} {t('reservations.pax')}</span>
                          <span className="text-muted-foreground">/ {totalCapacity} {t('reservations.capacity')}</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${Math.min((totalPax / totalCapacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Tour Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium">{t('reservations.tours')}</h4>
                        {Object.entries(tourSummary).map(([tour, data]) => {
                          const occupancyPercentage = (data.pax / data.capacity) * 100
                          return (
                            <div key={tour} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">{tour}</span>
                                <Badge 
                                  variant={occupancyPercentage >= 90 ? "destructive" : 
                                          occupancyPercentage >= 70 ? "secondary" : "default"}
                                >
                                  {data.pax}/{data.capacity}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {occupancyPercentage.toFixed(0)}% {t('reservations.occupied')}
                              </div>
                              <div className="bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`rounded-full h-1.5 transition-all ${
                                    occupancyPercentage >= 90 ? 'bg-red-500' :
                                    occupancyPercentage >= 70 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Individual Reservations */}
                      <div className="space-y-3">
                        <h4 className="font-medium">{t('reservations.reservationsCount')} ({dayReservations.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {dayReservations.map((reservation) => (
                            <div key={reservation.id} className="p-2 bg-muted/50 rounded text-xs">
                              <div className="font-medium">{reservation.customer}</div>
                              <div className="text-muted-foreground">{reservation.tour}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3" />
                                <span>{reservation.pax} {t('reservations.pax')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('reservations.clickDateForDetails')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}