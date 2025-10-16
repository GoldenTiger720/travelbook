import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import {
  CalendarDays,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  DollarSign,
  Building2,
  UserCheck,
  Car,
  FileText,
  Clock,
  Hash,
  CreditCard,
  Package
} from 'lucide-react'

interface ViewReservationModalProps {
  reservation: Reservation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ViewReservationModal: React.FC<ViewReservationModalProps> = ({
  reservation,
  open,
  onOpenChange
}) => {
  if (!reservation) return null

  const getStatusBadge = (status: Reservation['status']) => {
    const variants: Record<Reservation['status'], { className: string; label: string }> = {
      confirmed: { className: 'bg-green-100 text-green-800', label: 'Confirmed' },
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { className: 'bg-blue-100 text-blue-800', label: 'Completed' },
      'no-show': { className: 'bg-gray-100 text-gray-800', label: 'No Show' }
    }
    
    const variant = variants[status]
    return <Badge className={cn(variant.className)}>{variant.label}</Badge>
  }
  
  const getPaymentBadge = (status: Reservation['paymentStatus']) => {
    const variants: Record<Reservation['paymentStatus'], { className: string; label: string }> = {
      paid: { className: 'bg-green-100 text-green-800', label: 'Paid' },
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      partial: { className: 'bg-orange-100 text-orange-800', label: 'Partial' },
      refunded: { className: 'bg-purple-100 text-purple-800', label: 'Refunded' },
      overdue: { className: 'bg-red-100 text-red-800', label: 'Overdue' }
    }
    
    const variant = variants[status]
    return <Badge className={cn(variant.className)}>{variant.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reservation Details
          </DialogTitle>
          <DialogDescription>
            Viewing reservation {reservation.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and IDs */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{reservation.reservationNumber}</span>
            </div>
            {reservation.purchaseOrderNumber && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">PO: {reservation.purchaseOrderNumber}</span>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              {getStatusBadge(reservation.status)}
              {getPaymentBadge(reservation.paymentStatus)}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Operation Date</p>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span>{format(reservation.operationDate, 'EEEE, dd MMMM yyyy')}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Sale Date</p>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span>{format(reservation.saleDate, 'dd MMMM yyyy')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Client Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.client.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{reservation.client.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.client.country}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tour Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Tour Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tour Name</p>
                <p className="font-medium">{reservation.tour.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{reservation.tour.pickupTime}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination</p>
                  <p>{reservation.tour.destination}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pickup Address</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{reservation.tour.pickupAddress}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Passengers and Pricing */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Passengers
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Adults:</span>
                  <span className="font-medium">{reservation.passengers.adults}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Children:</span>
                  <span className="font-medium">{reservation.passengers.children}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Infants:</span>
                  <span className="font-medium">{reservation.passengers.infants}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    {reservation.passengers.adults + 
                     reservation.passengers.children + 
                     reservation.passengers.infants}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </h3>
              <div className="space-y-2">
                {reservation.passengers.adults > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Adult ({reservation.passengers.adults}x):</span>
                    <span>
                      {reservationService.formatCurrency(
                        reservation.pricing.adultPrice * reservation.passengers.adults,
                        reservation.pricing.currency
                      )}
                    </span>
                  </div>
                )}
                {reservation.passengers.children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Child ({reservation.passengers.children}x):</span>
                    <span>
                      {reservationService.formatCurrency(
                        reservation.pricing.childPrice * reservation.passengers.children,
                        reservation.pricing.currency
                      )}
                    </span>
                  </div>
                )}
                {reservation.passengers.infants > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Infant ({reservation.passengers.infants}x):</span>
                    <span>
                      {reservationService.formatCurrency(
                        reservation.pricing.infantPrice * reservation.passengers.infants,
                        reservation.pricing.currency
                      )}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg">
                    {reservationService.formatCurrency(
                      reservation.pricing.totalAmount,
                      reservation.pricing.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Operations */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Operations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Salesperson:</span> {reservation.salesperson}
                  </span>
                </div>
                {reservation.operator && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Operator:</span> {reservation.operator}
                    </span>
                  </div>
                )}
                {reservation.guide && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Guide:</span> {reservation.guide}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {reservation.driver && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Driver:</span> {reservation.driver}
                    </span>
                  </div>
                )}
                {reservation.externalAgency && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Agency:</span> {reservation.externalAgency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {reservation.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReservationModal