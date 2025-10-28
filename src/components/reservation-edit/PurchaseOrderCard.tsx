import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, User } from 'lucide-react'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { getStatusColor, getPaymentStatusColor } from './utils'

interface PurchaseOrderCardProps {
  reservation: Reservation
}

export const PurchaseOrderCard = ({ reservation }: PurchaseOrderCardProps) => {
  return (
    <Card>
      <CardContent className="p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          {/* Company Info - Left */}
          <div className="space-y-3">
            <img src="/omg.png" alt="Company Logo" className="h-12 w-auto" />
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{reservation.email || 'ulliviagens@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{reservation.phone || '+56985400793'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>Salesperson: {reservation.salesperson}</span>
              </div>
            </div>
          </div>

          {/* Purchase Order Info - Right */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600 mb-1">Purchase order</div>
            <div className="text-3xl font-bold text-gray-800 mb-6">
              {reservation.purchaseOrderNumber || reservation.reservationNumber}
            </div>
            <div className="flex gap-2 justify-end mb-2">
              <Badge className={getStatusColor(reservation.status)}>
                {reservation.status}
              </Badge>
              <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                {reservation.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Pink Divider */}
        <div className="h-1 bg-gradient-to-r from-pink-500 to-pink-600 mb-6"></div>

        {/* Customer and Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Info - Left */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Customer:</h3>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{reservation.client.name}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  {reservation.client.country}
                </span>
              </div>
              <div className="text-gray-600">
                {reservation.client.idNumber && (
                  <div>ID: {reservation.client.idNumber}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{reservation.client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{reservation.client.email}</span>
              </div>
            </div>
          </div>

          {/* Dates and Details - Right */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">Purchase Date:</h3>
              <div className="text-sm text-gray-600">
                {reservation.saleDate ? format(reservation.saleDate, "EEEE, dd-MM-yyyy") : 'Not set'}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">First tour date:</h3>
              <div className="text-sm text-gray-600">
                {format(reservation.operationDate, "EEEE, dd-MM-yyyy")}
              </div>
            </div>
            {(reservation.operator || reservation.guide || reservation.driver) && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-1">Operations Team:</h3>
                <div className="text-sm text-gray-600 space-y-0.5">
                  {reservation.operator && <div>Operator: {reservation.operator}</div>}
                  {reservation.guide && <div>Guide: {reservation.guide}</div>}
                  {reservation.driver && <div>Driver: {reservation.driver}</div>}
                  {reservation.externalAgency && <div>Agency: {reservation.externalAgency}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pink Divider */}
        <div className="h-1 bg-gradient-to-r from-pink-500 to-pink-600 mt-6"></div>
      </CardContent>
    </Card>
  )
}
