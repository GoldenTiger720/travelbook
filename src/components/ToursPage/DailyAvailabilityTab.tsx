import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DailyAvailabilityTabProps {
  currentMonth: Date
  navigateMonth: (direction: 'prev' | 'next') => void
  getCalendarDays: () => any[]
  handleEditAvailability: (data: any) => void
}

const DailyAvailabilityTab: React.FC<DailyAvailabilityTabProps> = ({
  currentMonth,
  navigateMonth,
  getCalendarDays,
  handleEditAvailability,
}) => {
  const { t } = useLanguage()

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
      {/* Calendar Header */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-semibold">{t('tours.dailyAvailabilityCalendar')}</h2>
          <p className="text-sm text-muted-foreground">{t('tours.calendarDescription')}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-medium min-w-[180px] sm:min-w-[200px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
                <span className="hidden sm:inline">{day.substring(0, 3)}</span>
                <span className="sm:hidden">{day.substring(0, 2)}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {getCalendarDays().map((day, index) => (
              <div key={index} className="min-h-[80px] sm:min-h-[120px] border border-border rounded-lg p-1 sm:p-2">
                {day && (
                  <>
                    <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">{day.day}</div>
                    {day.data && (
                      <div className="space-y-1">
                        {day.data.tours.slice(0, window.innerWidth < 640 ? 1 : 2).map((tour: any) => {
                          const occupancyRate = Math.round((tour.bookedSpots / tour.totalCapacity) * 100)
                          return (
                            <div 
                              key={tour.id} 
                              className="text-xs p-1 rounded bg-muted cursor-pointer hover:bg-muted/80"
                              onClick={() => handleEditAvailability({...day.data, tourId: tour.id, tour})}
                            >
                              <div className="font-medium truncate text-xs">
                                <span className="hidden sm:inline">{tour.name}</span>
                                <span className="sm:hidden">{tour.name.substring(0, 10)}...</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${occupancyRate > 80 ? 'text-red-600' : occupancyRate > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {tour.bookedSpots}/{tour.totalCapacity}
                                </span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                  {occupancyRate}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        {day.data.tours.length > (window.innerWidth < 640 ? 1 : 2) && (
                          <div 
                            className="text-xs text-muted-foreground cursor-pointer hover:underline"
                            onClick={() => handleEditAvailability(day.data)}
                          >
                            +{day.data.tours.length - (window.innerWidth < 640 ? 1 : 2)}
                            <span className="hidden sm:inline"> {t('tours.moreTours')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DailyAvailabilityTab