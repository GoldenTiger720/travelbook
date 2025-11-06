import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import { Reservation } from '@/types/reservation'
import {
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Users,
  Calendar,
  FileText,
  Building,
  DollarSign
} from 'lucide-react'

const ReservationReportPage = () => {
  const { reservationId } = useParams()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [allToursForBooking, setAllToursForBooking] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReservationData()
  }, [reservationId])

  const loadReservationData = async () => {
    setLoading(true)
    try {
      const reservations = await reservationService.getAllReservations()

      // Extract base booking ID (remove -tour-X suffix if present)
      const baseBookingId = reservationId?.replace(/-tour-\d+$/, '') || reservationId

      // Find all reservations with this booking ID
      const matchingReservations = reservations.filter((r: Reservation) => {
        const rBaseId = r.id.replace(/-tour-\d+$/, '')
        return rBaseId === baseBookingId
      })

      if (matchingReservations.length > 0) {
        setReservation(matchingReservations[0])
        setAllToursForBooking(matchingReservations)
      }
    } catch (error) {
      console.error('Error loading reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservation...</p>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Reservation not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      reconfirmed: 'bg-green-600 text-white',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      'no-show': 'bg-gray-100 text-gray-800'
    }
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      refunded: 'bg-purple-100 text-purple-800',
      overdue: 'bg-red-100 text-red-800'
    }
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 print:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Order</h1>
              <p className="text-gray-600 mt-1">#{reservation.reservationNumber}</p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(reservation.status)}
              {getPaymentBadge(reservation.paymentStatus)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Operation: {format(reservation.operationDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <span>Sale: {format(reservation.saleDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>Salesperson: {reservation.salesperson}</span>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium">{reservation.client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {reservation.client.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {reservation.client.phone}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Country</p>
                  <p className="font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {reservation.client.country}
                  </p>
                </div>
                {reservation.client.idNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Number</p>
                    <p className="font-medium">{reservation.client.idNumber}</p>
                  </div>
                )}
                {reservation.client.hotel && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hotel</p>
                    <p className="font-medium flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {reservation.client.hotel}
                      {reservation.client.room && ` - Room ${reservation.client.room}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {reservation.client.comments && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Comments</p>
                <p className="text-gray-700">{reservation.client.comments}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tours Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tour Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allToursForBooking.map((tour, index) => (
              <div key={tour.id} className={index > 0 ? 'mt-6 pt-6 border-t' : ''}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{tour.tour.name}</h3>
                      <p className="text-sm text-gray-600">Code: {tour.tour.code}</p>
                      <p className="text-sm text-gray-600">Destination: {tour.tour.destination}</p>
                    </div>
                    {tour.tourStatus && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {tour.tourStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <span className="text-gray-500">Date:</span> {format(tour.tour.date, 'PPP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <span className="text-gray-500">Pickup Time:</span> {tour.tour.pickupTime}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span className="text-sm">
                          <span className="text-gray-500">Pickup:</span> {tour.tour.pickupAddress}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <span className="text-gray-500">Passengers:</span>{' '}
                          {tour.passengers.adults} Adults
                          {tour.passengers.children > 0 && `, ${tour.passengers.children} Children`}
                          {tour.passengers.infants > 0 && `, ${tour.passengers.infants} Infants`}
                        </span>
                      </div>
                      {tour.guideName && (
                        <div className="text-sm">
                          <span className="text-gray-500">Guide:</span> {tour.guideName}
                        </div>
                      )}
                      {tour.driverName && (
                        <div className="text-sm">
                          <span className="text-gray-500">Driver:</span> {tour.driverName}
                        </div>
                      )}
                      {tour.operator && (
                        <div className="text-sm">
                          <span className="text-gray-500">Operator:</span> {tour.operator}
                        </div>
                      )}
                    </div>
                  </div>

                  {tour.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{tour.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allToursForBooking.map((tour, index) => (
                <div key={tour.id} className={index > 0 ? 'pt-4 border-t' : ''}>
                  {allToursForBooking.length > 1 && (
                    <p className="font-medium mb-2">{tour.tour.name}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Adults ({tour.passengers.adults} × {reservationService.formatCurrency(tour.pricing.adultPrice, tour.pricing.currency)})
                      </span>
                      <span className="font-medium">
                        {reservationService.formatCurrency(
                          tour.passengers.adults * tour.pricing.adultPrice,
                          tour.pricing.currency
                        )}
                      </span>
                    </div>
                    {tour.passengers.children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Children ({tour.passengers.children} × {reservationService.formatCurrency(tour.pricing.childPrice, tour.pricing.currency)})
                        </span>
                        <span className="font-medium">
                          {reservationService.formatCurrency(
                            tour.passengers.children * tour.pricing.childPrice,
                            tour.pricing.currency
                          )}
                        </span>
                      </div>
                    )}
                    {tour.passengers.infants > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Infants ({tour.passengers.infants} × {reservationService.formatCurrency(tour.pricing.infantPrice, tour.pricing.currency)})
                        </span>
                        <span className="font-medium">
                          {reservationService.formatCurrency(
                            tour.passengers.infants * tour.pricing.infantPrice,
                            tour.pricing.currency
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tour Total</span>
                    <span className="font-bold text-lg">
                      {reservationService.formatCurrency(tour.pricing.totalAmount, tour.pricing.currency)}
                    </span>
                  </div>
                </div>
              ))}

              {allToursForBooking.length > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Grand Total</span>
                    <span className="font-bold text-xl text-indigo-600">
                      {reservationService.formatCurrency(
                        allToursForBooking.reduce((sum, tour) => sum + tour.pricing.totalAmount, 0),
                        allToursForBooking[0].pricing.currency
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        {reservation.paymentDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                  <p className="font-medium">
                    {format(new Date(reservation.paymentDetails.date), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium">{reservation.paymentDetails.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="font-medium">
                    {reservationService.formatCurrency(
                      reservation.paymentDetails.amountPaid,
                      reservation.pricing.currency
                    )} ({reservation.paymentDetails.percentage}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  {getPaymentBadge(reservation.paymentDetails.status)}
                </div>
              </div>
              {reservation.paymentDetails.comments && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Comments</p>
                  <p className="text-gray-700">{reservation.paymentDetails.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Terms Acceptance */}
        {reservation.acceptTerm && reservation.acceptTermDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                {reservation.acceptTermDetails.date && (
                  <span className="text-sm text-gray-600">
                    on {format(new Date(reservation.acceptTermDetails.date), 'PPP')}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {reservation.acceptTermDetails.name && (
                  <div>
                    <span className="text-gray-500">Accepted by:</span> {reservation.acceptTermDetails.name}
                  </div>
                )}
                {reservation.acceptTermDetails.email && (
                  <div>
                    <span className="text-gray-500">Email:</span> {reservation.acceptTermDetails.email}
                  </div>
                )}
                {reservation.acceptTermDetails.ip && (
                  <div>
                    <span className="text-gray-500">IP Address:</span> {reservation.acceptTermDetails.ip}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 pb-8">
          <p>Generated on {format(new Date(), 'PPP')}</p>
          <p className="mt-1">Reservation ID: {reservation.id}</p>
        </div>
      </div>
    </div>
  )
}

export default ReservationReportPage