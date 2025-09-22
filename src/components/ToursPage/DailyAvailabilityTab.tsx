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
    <div className="space-y-3 sm:space-y-6 px-1 sm:px-0">
      {/* Calendar Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold">{t('tours.dailyAvailabilityCalendar')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('tours.calendarDescription')}</p>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div className="text-sm sm:text-lg font-medium min-w-[140px] sm:min-w-[200px] text-center">
            <span className="block sm:hidden">{monthNames[currentMonth.getMonth()].substring(0, 3)} {currentMonth.getFullYear()}</span>
            <span className="hidden sm:block">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2 sm:p-4 lg:p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-4">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
                <span className="hidden sm:inline">{day.substring(0, 3)}</span>
                <span className="sm:hidden">{day.substring(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2">
            {getCalendarDays().map((day, index) => (
              <div key={index} className="min-h-[60px] sm:min-h-[100px] lg:min-h-[120px] border border-border rounded-md sm:rounded-lg p-0.5 sm:p-1 lg:p-2 bg-background hover:bg-muted/30 transition-colors">
                {day && (
                  <>
                    <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 lg:mb-2 text-center sm:text-left">{day.day}</div>
                    {day.data && (
                      <div className="space-y-0.5 sm:space-y-1">
                        {/* Mobile: Show 1 tour, SM+: Show 2 tours */}
                        <div className="sm:hidden">
                          {day.data.tours.slice(0, 1).map((tour: any) => {
                            const occupancyRate = Math.round((tour.bookedSpots / tour.totalCapacity) * 100)
                            return (
                              <div
                                key={tour.id}
                                className="text-xs p-0.5 rounded bg-muted cursor-pointer hover:bg-muted/80 active:bg-muted/90 transition-colors"
                                onClick={() => handleEditAvailability({...day.data, tourId: tour.id, tour})}
                              >
                                <div className="font-medium truncate text-xs">
                                  {tour.name.substring(0, 8)}...
                                </div>
                                <div className="text-xs text-center mt-0.5">
                                  <span className={`${occupancyRate > 80 ? 'text-red-600' : occupancyRate > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {tour.bookedSpots}/{tour.totalCapacity}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                          {day.data.tours.length > 1 && (
                            <div
                              className="text-xs text-center text-muted-foreground cursor-pointer hover:underline p-0.5"
                              onClick={() => handleEditAvailability(day.data)}
                            >
                              +{day.data.tours.length - 1}
                            </div>
                          )}
                        </div>

                        {/* Desktop: Show up to 2 tours */}
                        <div className="hidden sm:block">
                          {day.data.tours.slice(0, 2).map((tour: any) => {
                            const occupancyRate = Math.round((tour.bookedSpots / tour.totalCapacity) * 100)
                            return (
                              <div
                                key={tour.id}
                                className="text-xs p-1 rounded bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleEditAvailability({...day.data, tourId: tour.id, tour})}
                              >
                                <div className="font-medium truncate text-xs">
                                  {tour.name}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-xs ${occupancyRate > 80 ? 'text-red-600' : occupancyRate > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {tour.bookedSpots}/{tour.totalCapacity}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {occupancyRate}%
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                          {day.data.tours.length > 2 && (
                            <div
                              className="text-xs text-muted-foreground cursor-pointer hover:underline p-1"
                              onClick={() => handleEditAvailability(day.data)}
                            >
                              +{day.data.tours.length - 2} {t('tours.moreTours')}
                            </div>
                          )}
                        </div>
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