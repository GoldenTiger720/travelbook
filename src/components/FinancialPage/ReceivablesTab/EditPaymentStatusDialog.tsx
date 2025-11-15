import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Receivable {
  id: number
  bookingId: string
  customerName: string
  amount: number
  currency: string
  dueDate: string
  status: string
  method: string
  percentage: number
}

interface EditPaymentStatusDialogProps {
  open: boolean
  receivable: Receivable | null
  newStatus: string
  onStatusChange: (status: string) => void
  onClose: () => void
  onSave: () => void
  formatCurrency: (amount: number, currency?: string) => string
}

export const EditPaymentStatusDialog: React.FC<EditPaymentStatusDialogProps> = ({
  open,
  receivable,
  newStatus,
  onStatusChange,
  onClose,
  onSave,
  formatCurrency
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment Status</DialogTitle>
          <DialogDescription>
            Update the payment status for {receivable?.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="payment-status">Payment Status</Label>
            <Select value={newStatus} onValueChange={onStatusChange}>
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {receivable && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-medium">#{receivable.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {formatCurrency(receivable.amount, receivable.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge variant={
                  receivable.status === 'paid' ? 'success' :
                  receivable.status === 'overdue' ? 'destructive' :
                  'default'
                }>
                  {receivable.status}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
