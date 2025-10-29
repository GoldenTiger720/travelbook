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

interface AddPaymentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  paymentDate: Date | undefined
  setPaymentDate: (date: Date | undefined) => void
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  paymentPercentage: number
  setPaymentPercentage: (percentage: number) => void
  amountPaid: number
  setAmountPaid: (amount: number) => void
  totalPrice: number
  setTotalPrice: (price: number) => void
  paymentStatus: string
  setPaymentStatus: (status: string) => void
  receiptFile: File | null
  setReceiptFile: (file: File | null) => void
  currency: string
  onSave: () => void
}

export const AddPaymentDialog = ({
  isOpen,
  onOpenChange,
  paymentDate,
  setPaymentDate,
  paymentMethod,
  setPaymentMethod,
  paymentPercentage,
  setPaymentPercentage,
  amountPaid,
  setAmountPaid,
  totalPrice,
  setTotalPrice,
  paymentStatus,
  setPaymentStatus,
  receiptFile,
  setReceiptFile,
  currency,
  onSave
}: AddPaymentDialogProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Add a new payment record for this reservation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                  <SelectItem value="pagarme-brl">Pagar.me (BRL)</SelectItem>
                  <SelectItem value="sicred-pix-brl">Sicred – Pix (BRL)</SelectItem>
                  <SelectItem value="cash-brl">Cash (BRL)</SelectItem>
                  <SelectItem value="cash-ars">Cash (ARS)</SelectItem>
                  <SelectItem value="cash-usd">Cash (USD)</SelectItem>
                  <SelectItem value="asaas-brl">Asaas (BRL)</SelectItem>
                  <SelectItem value="santander-ar">Santander (AR)</SelectItem>
                  <SelectItem value="wise-brl">Wise (BRL)</SelectItem>
                  <SelectItem value="wise-usd">Wise (USD)</SelectItem>
                  <SelectItem value="wise-eur">Wise (EUR)</SelectItem>
                  <SelectItem value="wise-clp">Wise (CLP)</SelectItem>
                  <SelectItem value="mercado-pago-ar">Mercado Pago (AR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <Label>Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                {getCurrencySymbol(currency)}
              </span>
              <Input
                type="number"
                min="0"
                className="pl-12"
                value={totalPrice}
                onChange={(e) => {
                  const price = parseInt(e.target.value) || 0
                  setTotalPrice(price)
                  // Recalculate Amount Paid based on percentage
                  if (paymentPercentage > 0) {
                    const calculatedAmount = Math.round((price * paymentPercentage) / 100)
                    setAmountPaid(calculatedAmount)
                  }
                }}
                placeholder="Enter total price"
              />
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
                  if (totalPrice > 0) {
                    const calculatedAmount = Math.round((totalPrice * percentage) / 100)
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
                    if (totalPrice > 0) {
                      const calculatedPercentage = Math.round((amount / totalPrice) * 100)
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
          >
            Add Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
