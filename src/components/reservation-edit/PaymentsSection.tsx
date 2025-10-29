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
import { Plus, RefreshCcw, Edit } from 'lucide-react'
import { getCurrencySymbol, calculateGrandTotal } from './utils'

interface PaymentsSectionProps {
  reservation: Reservation
  onAddPayment: () => void
  onEditPayment: (paymentId: number) => void
}

export const PaymentsSection = ({
  reservation,
  onAddPayment,
  onEditPayment
}: PaymentsSectionProps) => {
  // Get all payments - support both new array format and legacy single payment
  const payments = reservation.payments || (reservation.paymentDetails ? [reservation.paymentDetails] : [])

  // Calculate total amount paid across all payments
  const totalAmountPaid = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0)

  // Calculate grand total for the reservation
  const grandTotal = calculateGrandTotal(reservation)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="w-[150px]">Payment Method</TableHead>
                <TableHead className="w-[120px]">Total Price</TableHead>
                <TableHead className="w-[100px]">Percentage</TableHead>
                <TableHead className="w-[120px]">Amount Paid</TableHead>
                <TableHead className="w-[120px]">Pending</TableHead>
                <TableHead className="w-[120px]">Receipt</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No payments added yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment, index) => (
                  <TableRow key={payment.id || `payment-${index}`}>
                    {/* Payment Date */}
                    <TableCell className="align-top py-3">
                      <span className="text-sm">
                        {payment.date ? format(new Date(payment.date), "dd/MM/yyyy") : "-"}
                      </span>
                    </TableCell>

                    {/* Payment Method */}
                    <TableCell className="align-top py-3">
                      <span className="text-sm capitalize">
                        {payment.method ? payment.method.replace('-', ' ') : '-'}
                      </span>
                    </TableCell>

                    {/* Total Price - calculated from percentage and amount paid for each payment */}
                    <TableCell className="align-top py-3">
                      {(() => {
                        // Calculate total price for this payment: Amount Paid / (Percentage / 100)
                        const totalPrice = payment.percentage > 0
                          ? Math.round((payment.amountPaid || 0) / (payment.percentage / 100))
                          : 0
                        return (
                          <div className="p-2 bg-green-100 border rounded-md text-center">
                            <span className="font-semibold text-sm">
                              {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {totalPrice.toLocaleString()}
                            </span>
                          </div>
                        )
                      })()}
                    </TableCell>

                    {/* Percentage */}
                    <TableCell className="align-top py-3">
                      <span className="text-sm">
                        {payment.percentage || 0}%
                      </span>
                    </TableCell>

                    {/* Amount Paid */}
                    <TableCell className="align-top py-3">
                      <span className="text-sm font-medium">
                        {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {(payment.amountPaid || 0).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Amount Pending - calculated per payment: Total Price - Amount Paid */}
                    <TableCell className="align-top py-3">
                      {(() => {
                        // Calculate total price for this payment
                        const totalPrice = payment.percentage > 0
                          ? Math.round((payment.amountPaid || 0) / (payment.percentage / 100))
                          : 0
                        // Calculate pending for this payment
                        const pending = Math.max(0, totalPrice - (payment.amountPaid || 0))
                        return (
                          <div className="p-2 bg-gray-100 border rounded-md text-center">
                            <span className="font-semibold text-sm text-red-600">
                              {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {pending.toLocaleString()}
                            </span>
                          </div>
                        )
                      })()}
                    </TableCell>

                    {/* Receipt */}
                    <TableCell className="align-top py-3">
                      <span className="text-sm text-muted-foreground">
                        {payment.receiptFile ? "View" : "-"}
                      </span>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="align-top py-3">
                      <Badge className={cn(
                        "text-xs",
                        payment.status === 'paid' && "bg-green-100 text-green-800",
                        payment.status === 'refunded' && "bg-red-100 text-red-800",
                        payment.status === 'cancelled' && "bg-red-100 text-red-800",
                        payment.status === 'pending' && "bg-yellow-100 text-yellow-800",
                        payment.status === 'partial' && "bg-blue-100 text-blue-800"
                      )}>
                        {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Pending'}
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="align-top py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEditPayment(payment.id)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Payment Footer */}
        <div className="border-t p-6">
          {/* Total Payments Row */}
          <div className="flex justify-end items-center mb-6 pb-4 border-b">
            <span className="text-sm font-medium text-gray-600 mr-4">Total payments:</span>
            <span className="text-xl font-bold text-gray-800">
              {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {totalAmountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={onAddPayment}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a payment
            </Button>
            <Button
              variant="outline"
              className="border-indigo-500 text-indigo-500 hover:bg-indigo-50"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Add a refund
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
