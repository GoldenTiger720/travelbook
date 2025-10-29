import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { getCurrencySymbol } from './utils'
import { Reservation } from '@/types/reservation'

interface AddPaymentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  unpaidTours: Reservation[]
  paymentDate: Date | undefined
  setPaymentDate: (date: Date | undefined) => void
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  paymentPercentage: number
  setPaymentPercentage: (percentage: number) => void
  amountPaid: number
  setAmountPaid: (amount: number) => void
  paymentStatus: string
  setPaymentStatus: (status: string) => void
  receiptFile: File | null
  setReceiptFile: (file: File | null) => void
  selectedTourId: string
  setSelectedTourId: (tourId: string) => void
  currency: string
  onSave: () => void
}

export const AddPaymentDialog = ({
  isOpen,
  onOpenChange,
  unpaidTours,
  paymentDate,
  setPaymentDate,
  paymentMethod,
  setPaymentMethod,
  paymentPercentage,
  setPaymentPercentage,
  amountPaid,
  setAmountPaid,
  paymentStatus,
  setPaymentStatus,
  receiptFile,
  setReceiptFile,
  selectedTourId,
  setSelectedTourId,
  currency,
  onSave
}: AddPaymentDialogProps) => {
  // Find the selected tour to get its total amount
  const selectedTour = unpaidTours.find(tour => tour.id === selectedTourId)
  const tourTotalAmount = selectedTour
    ? (selectedTour.passengers.adults * selectedTour.pricing.adultPrice) +
      (selectedTour.passengers.children * selectedTour.pricing.childPrice) +
      (selectedTour.passengers.infants * selectedTour.pricing.infantPrice)
    : 0

  const handleTourSelect = (tourId: string) => {
    setSelectedTourId(tourId)
    const tour = unpaidTours.find(t => t.id === tourId)
    if (tour) {
      const total = (tour.passengers.adults * tour.pricing.adultPrice) +
                   (tour.passengers.children * tour.pricing.childPrice) +
                   (tour.passengers.infants * tour.pricing.infantPrice)
      // Set amount to full tour amount by default
      setAmountPaid(total)
      setPaymentPercentage(100)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Add payment for a tour without payment status
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Tour Selection Dropdown */}
          <div className="space-y-2">
            <Label>Select Tour</Label>
            <Select value={selectedTourId} onValueChange={handleTourSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tour to pay for" />
              </SelectTrigger>
              <SelectContent>
                {unpaidTours.length === 0 ? (
                  <SelectItem value="none" disabled>No unpaid tours available</SelectItem>
                ) : (
                  unpaidTours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id}>
                      {tour.tour.name} - {format(tour.operationDate, "MMM dd, yyyy")}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Total Amount Display */}
          {selectedTour && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Tour Total Amount:</span>
                <span className="text-lg font-bold text-blue-900">
                  {getCurrencySymbol(currency)} {tourTotalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash-office">Cash Office</SelectItem>
                  <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                  <SelectItem value="van-is-broken">Van Is Broken</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="nubank-transfer">Nubank Transfer</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={paymentPercentage}
                onChange={(e) => {
                  const percentage = parseInt(e.target.value) || 0
                  setPaymentPercentage(percentage)
                  if (tourTotalAmount > 0) {
                    const calculatedAmount = Math.round((tourTotalAmount * percentage) / 100)
                    setAmountPaid(calculatedAmount)
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  type="number"
                  min="0"
                  className="pl-12"
                  value={amountPaid}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 0
                    setAmountPaid(amount)
                    if (tourTotalAmount > 0) {
                      const calculatedPercentage = Math.round((amount / tourTotalAmount) * 100)
                      setPaymentPercentage(calculatedPercentage)
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Receipt Upload</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
            />
            {receiptFile && (
              <span className="text-xs text-muted-foreground">
                Selected: {receiptFile.name}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-indigo-500 hover:bg-indigo-600"
            disabled={!selectedTourId}
          >
            Add Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
