import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import { MapPin, Edit, Plus } from 'lucide-react'

interface ReservationsTableProps {
  reservation: Reservation
  allToursForBooking: Reservation[]
  onEditTour: (tourReservation: Reservation) => void
  onAddTour: () => void
  onReservationAction: (action: 'cancel' | 'confirm' | 'checkin' | 'noshow', tourReservation: Reservation) => void
}

export const ReservationsTable = ({
  reservation,
  allToursForBooking,
  onEditTour,
  onAddTour,
  onReservationAction
}: ReservationsTableProps) => {
  // Use allToursForBooking if available, otherwise fall back to single reservation
  const toursToDisplay = allToursForBooking.length > 0 ? allToursForBooking : [reservation]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Reservations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="min-w-[200px]">Tour</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[80px] text-center">PAX</TableHead>
                <TableHead className="w-[120px] text-right">Price</TableHead>
                <TableHead className="w-[120px] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toursToDisplay.map((tourReservation) => (
              <TableRow key={tourReservation.id}>
                <TableCell className="align-top py-3">
                  <div className="text-sm font-medium">
                    {format(tourReservation.operationDate, "yyyy-MM-dd")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    * {tourReservation.tour.pickupTime}
                  </div>
                  <div className="text-xs font-medium mt-1">
                    {format(tourReservation.operationDate, 'EEEE')}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{tourReservation.tour.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={() => onEditTour(tourReservation)}
                        title="Edit Tour"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-mono">{tourReservation.reservationNumber}</span>
                    </div>
                    <div className="text-xs flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{tourReservation.tour.pickupAddress}</span>
                    </div>
                    {tourReservation.notes && (
                      <div className="text-xs flex items-start gap-1">
                        <span className="text-muted-foreground">ℹ️</span>
                        <span className="text-muted-foreground">{tourReservation.notes}</span>
                      </div>
                    )}
                    {/* Action Buttons - Conditional Display Based on Tour Status */}
                    {tourReservation.tourStatus !== 'no-show' && (
                      <div className="flex gap-1 mt-2">
                        {tourReservation.tourStatus === 'checked-in' ? (
                          // Show only Cancel button when checked-in
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => onReservationAction('cancel', tourReservation)}
                          >
                            Cancel
                          </Button>
                        ) : tourReservation.tourStatus !== 'cancelled' ? (
                          // Show all four buttons when not checked-in and not cancelled
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => onReservationAction('cancel', tourReservation)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => onReservationAction('confirm', tourReservation)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-teal-500 hover:bg-teal-600 text-white"
                              onClick={() => onReservationAction('checkin', tourReservation)}
                            >
                              Check-in
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-red-400 hover:bg-red-500 text-white"
                              onClick={() => onReservationAction('noshow', tourReservation)}
                            >
                              No Show
                            </Button>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3">
                  <Badge className={cn(
                    "text-xs",
                    (tourReservation.tourStatus === 'confirmed' || tourReservation.status === 'confirmed') && "bg-blue-100 text-blue-800",
                    (tourReservation.tourStatus === 'pending' || tourReservation.status === 'pending') && "bg-yellow-100 text-yellow-800",
                    (tourReservation.tourStatus === 'cancelled' || tourReservation.status === 'cancelled') && "bg-red-100 text-red-800",
                    tourReservation.tourStatus === 'checked-in' && "bg-teal-100 text-teal-800",
                    tourReservation.tourStatus === 'no-show' && "bg-gray-100 text-gray-800",
                    (tourReservation.tourStatus === 'completed' || tourReservation.status === 'completed') && "bg-green-100 text-green-800"
                  )}>
                    {tourReservation.tourStatus === 'confirmed' || tourReservation.status === 'confirmed' ? 'Reserved' :
                     tourReservation.tourStatus === 'cancelled' || tourReservation.status === 'cancelled' ? 'Canceled' :
                     tourReservation.tourStatus === 'checked-in' ? 'Checked In' :
                     tourReservation.tourStatus === 'no-show' ? 'No Show' :
                     (tourReservation.tourStatus || tourReservation.status).charAt(0).toUpperCase() + (tourReservation.tourStatus || tourReservation.status).slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="align-top py-3 text-center">
                  <div className="text-sm font-medium">
                    {tourReservation.passengers.adults + tourReservation.passengers.children + tourReservation.passengers.infants}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3 text-right">
                  <div className="text-sm">
                    {reservationService.formatCurrency(tourReservation.pricing.adultPrice, tourReservation.pricing.currency)}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3 text-right font-semibold">
                  {reservationService.formatCurrency(
                    (tourReservation.passengers.adults * tourReservation.pricing.adultPrice) +
                    (tourReservation.passengers.children * tourReservation.pricing.childPrice) +
                    (tourReservation.passengers.infants * tourReservation.pricing.infantPrice),
                    tourReservation.pricing.currency
                  )}
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t p-4 bg-muted/20">
          <div className="flex justify-end items-center gap-4">
            <div className="text-sm font-semibold">Total reservations:</div>
            <div className="text-lg font-bold text-primary">
              {reservationService.formatCurrency(
                toursToDisplay.reduce((total, tour) =>
                  total + (tour.passengers.adults * tour.pricing.adultPrice) +
                  (tour.passengers.children * tour.pricing.childPrice) +
                  (tour.passengers.infants * tour.pricing.infantPrice)
                , 0),
                reservation.pricing.currency
              )}
            </div>
          </div>
        </div>

        {/* Add More Reservations Button */}
        <div className="p-4 border-t flex justify-end">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onAddTour}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add more reservations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
