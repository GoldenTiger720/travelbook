import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Currency, PaymentMethod } from '@/types/financial'
import { usePaymentAccounts } from '@/lib/hooks/usePaymentAccounts'

interface AddInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: InvoiceFormData) => Promise<void>
  bookings: Booking[]
  loadingBookings: boolean
}

export interface InvoiceFormData {
  bookingId: string
  date: string
  method: PaymentMethod
  percentage: number
  amount: number
  currency: Currency
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  comments?: string
}

interface Booking {
  id: string
  customer: {
    name: string
    email: string
  }
  pricing: {
    amount: number
    currency: string
  }
  status: string
  createdAt: string
}

const AddInvoiceDialog: React.FC<AddInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  bookings,
  loadingBookings
}) => {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dueDate, setDueDate] = useState<Date>(new Date())

  // Fetch payment accounts from Settings
  const { paymentAccounts, loading: loadingPaymentAccounts } = usePaymentAccounts()

  const [formData, setFormData] = useState<InvoiceFormData>({
    bookingId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    method: paymentAccounts[0]?.accountName || '',
    percentage: 100,
    amount: 0,
    currency: 'CLP',
    status: 'pending',
    comments: ''
  })

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking =>
    booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle booking selection
  const handleBookingSelect = (bookingId: string) => {
    const selectedBooking = bookings.find(b => b.id === bookingId)
    if (selectedBooking) {
      setFormData({
        ...formData,
        bookingId: bookingId,
        currency: selectedBooking.pricing.currency as Currency,
        amount: selectedBooking.pricing.amount
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        ...formData,
        date: format(dueDate, 'yyyy-MM-dd')
      })

      // Reset form
      setFormData({
        bookingId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        method: 'bank-transfer',
        percentage: 100,
        amount: 0,
        currency: 'CLP',
        status: 'pending',
        comments: ''
      })
      setDueDate(new Date())
      setSearchTerm('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Recipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Booking Selection */}
            <div className="col-span-2">
              <Label htmlFor="bookingId">Select Booking *</Label>
              <Select
                value={formData.bookingId}
                onValueChange={handleBookingSelect}
                disabled={loadingBookings}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingBookings ? "Loading bookings..." : "Select a booking"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredBookings.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {loadingBookings ? 'Loading...' : 'No bookings found'}
                    </div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.customer.name}</span>
                          <span className="text-xs text-muted-foreground">
                            #{booking.id.slice(0, 8)} • {booking.pricing.currency} {booking.pricing.amount.toFixed(2)} • {booking.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLP">CLP - Chilean Peso</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Percentage */}
            <div>
              <Label htmlFor="percentage">Payment Percentage *</Label>
              <Input
                id="percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                placeholder="100"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={formData.method}
                onValueChange={(value: PaymentMethod) => setFormData({ ...formData, method: value })}
                disabled={loadingPaymentAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPaymentAccounts ? "Loading..." : "Select payment method"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentAccounts.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {loadingPaymentAccounts ? 'Loading...' : 'No payment accounts configured'}
                    </div>
                  ) : (
                    paymentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.accountName}>
                        {account.accountName} ({account.currency})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div className="col-span-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddInvoiceDialog
