import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Currency, PaymentMethod } from '@/types/financial'
import { usePaymentAccounts } from '@/lib/hooks/usePaymentAccounts'

interface AddRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: RecipeFormData) => void
  bookings: Booking[]
  loadingBookings: boolean
}

export interface RecipeFormData {
  bookingId: string
  paymentDate: string
  dueDate: string
  method: PaymentMethod
  installment: number
  amount: number
  currency: Currency
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  description?: string
  notes?: string
  attachment?: File | null
}

interface Booking {
  id: string
  customer: {
    name: string
    email: string
  }
  totalAmount: number
  currency: string
  status: string
  createdAt?: string
}

const AddRecipeDialog: React.FC<AddRecipeDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  bookings,
  loadingBookings
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(new Date())
  const [attachment, setAttachment] = useState<File | null>(null)

  // Fetch payment accounts from Settings
  const { paymentAccounts, loading: loadingPaymentAccounts } = usePaymentAccounts()

  const [formData, setFormData] = useState<RecipeFormData>({
    bookingId: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    method: paymentAccounts[0]?.accountName || '',
    installment: 1,
    amount: 0,
    currency: 'CLP',
    status: 'pending',
    description: '',
    notes: '',
    attachment: null
  })

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking =>
    (booking.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (booking.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (booking.customer?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Handle booking selection
  const handleBookingSelect = (bookingId: string) => {
    const selectedBooking = bookings.find(b => b.id === bookingId)
    if (selectedBooking) {
      setFormData({
        ...formData,
        bookingId: bookingId,
        currency: (selectedBooking.currency || 'CLP') as Currency,
        amount: selectedBooking.totalAmount || 0
      })
    }
  }

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAttachment(file)
    setFormData({ ...formData, attachment: file })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.bookingId) {
      return
    }

    // Close modal immediately
    onOpenChange(false)

    // Prepare data
    const submitData = {
      ...formData,
      paymentDate: format(paymentDate, 'yyyy-MM-dd'),
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      attachment
    }

    // Reset form immediately
    setFormData({
      bookingId: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      method: 'bank-transfer',
      installment: 1,
      amount: 0,
      currency: 'CLP',
      status: 'pending',
      description: '',
      notes: '',
      attachment: null
    })
    setPaymentDate(new Date())
    setDueDate(new Date())
    setAttachment(null)
    setSearchTerm('')

    // Call onSave - mutation handles optimistic updates and SweetAlert
    onSave(submitData)
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
                          <span className="font-medium">{booking.customer?.name || 'Unknown Customer'}</span>
                          <span className="text-xs text-muted-foreground">
                            #{booking.id?.slice(0, 8) || 'N/A'} • {booking.currency || 'N/A'} {(booking.totalAmount || 0).toFixed(2)} • {booking.status || 'N/A'}
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

            {/* Payment Date */}
            <div>
              <Label>Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !paymentDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

            {/* Installment */}
            <div>
              <Label htmlFor="installment">Installment *</Label>
              <Select
                value={formData.installment.toString()}
                onValueChange={(value) => setFormData({ ...formData, installment: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select installment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="3">3x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
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

            {/* Attachment */}
            <div>
              <Label htmlFor="attachment">Attachment</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => document.getElementById('attachment')?.click()}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  {attachment ? attachment.name : 'Choose file...'}
                </Button>
              </div>
              {attachment && (
                <p className="text-xs text-muted-foreground mt-1">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description..."
                rows={2}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Recipe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRecipeDialog
