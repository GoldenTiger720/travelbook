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
import { MapPin, Eye, Mail, Edit, Plus } from 'lucide-react'

interface ReservationsTableProps {
  reservation: Reservation
  onEditTour: () => void
  onAddTour: () => void
  onReservationAction: (action: 'cancel' | 'confirm' | 'checkin' | 'noshow') => void
}

export const ReservationsTable = ({
  reservation,
  onEditTour,
  onAddTour,
  onReservationAction
}: ReservationsTableProps) => {
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
              <TableRow>
                <TableCell className="align-top py-3">
                  <div className="text-sm font-medium">
                    {format(reservation.operationDate, "yyyy-MM-dd")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    * {reservation.tour.pickupTime}
                  </div>
                  <div className="text-xs font-medium mt-1">
                    {format(reservation.operationDate, 'EEEE')}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{reservation.tour.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={onEditTour}
                        title="Edit Tour"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-mono">{reservation.reservationNumber}</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{reservation.tour.pickupAddress}</span>
                    </div>
                    {reservation.notes && (
                      <div className="text-xs flex items-start gap-1">
                        <span className="text-muted-foreground">ℹ️</span>
                        <span className="text-muted-foreground">{reservation.notes}</span>
                      </div>
                    )}
                    {/* Action Buttons - Conditional Display Based on Tour Status */}
                    {reservation.tourStatus !== 'no-show' && (
                      <div className="flex gap-1 mt-2">
                        {reservation.tourStatus === 'checked-in' ? (
                          // Show only Cancel button when checked-in
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => onReservationAction('cancel')}
                          >
                            Cancel
                          </Button>
                        ) : reservation.tourStatus !== 'cancelled' ? (
                          // Show all four buttons when not checked-in and not cancelled
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => onReservationAction('cancel')}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => onReservationAction('confirm')}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-teal-500 hover:bg-teal-600 text-white"
                              onClick={() => onReservationAction('checkin')}
                            >
                              Check-in
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-red-400 hover:bg-red-500 text-white"
                              onClick={() => onReservationAction('noshow')}
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
                    (reservation.tourStatus === 'confirmed' || reservation.status === 'confirmed') && "bg-blue-100 text-blue-800",
                    (reservation.tourStatus === 'pending' || reservation.status === 'pending') && "bg-yellow-100 text-yellow-800",
                    (reservation.tourStatus === 'cancelled' || reservation.status === 'cancelled') && "bg-red-100 text-red-800",
                    reservation.tourStatus === 'checked-in' && "bg-teal-100 text-teal-800",
                    reservation.tourStatus === 'no-show' && "bg-gray-100 text-gray-800",
                    (reservation.tourStatus === 'completed' || reservation.status === 'completed') && "bg-green-100 text-green-800"
                  )}>
                    {reservation.tourStatus === 'confirmed' || reservation.status === 'confirmed' ? 'Reserved' :
                     reservation.tourStatus === 'cancelled' || reservation.status === 'cancelled' ? 'Canceled' :
                     reservation.tourStatus === 'checked-in' ? 'Checked In' :
                     reservation.tourStatus === 'no-show' ? 'No Show' :
                     (reservation.tourStatus || reservation.status).charAt(0).toUpperCase() + (reservation.tourStatus || reservation.status).slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="align-top py-3 text-center">
                  <div className="text-sm font-medium">
                    {reservation.passengers.adults + reservation.passengers.children + reservation.passengers.infants}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3 text-right">
                  <div className="text-sm">
                    {reservationService.formatCurrency(reservation.pricing.adultPrice, reservation.pricing.currency)}
                  </div>
                </TableCell>
                <TableCell className="align-top py-3 text-right font-semibold">
                  {reservationService.formatCurrency(
                    (reservation.passengers.adults * reservation.pricing.adultPrice) +
                    (reservation.passengers.children * reservation.pricing.childPrice) +
                    (reservation.passengers.infants * reservation.pricing.infantPrice),
                    reservation.pricing.currency
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="border-t p-4 bg-muted/20">
          <div className="flex justify-end items-center gap-4">
            <div className="text-sm font-semibold">Total reservations:</div>
            <div className="text-lg font-bold text-primary">
              {reservationService.formatCurrency(
                (reservation.passengers.adults * reservation.pricing.adultPrice) +
                (reservation.passengers.children * reservation.pricing.childPrice) +
                (reservation.passengers.infants * reservation.pricing.infantPrice),
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
