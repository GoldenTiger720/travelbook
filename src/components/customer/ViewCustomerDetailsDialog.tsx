import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ViewCustomerDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customer: any
}

export const ViewCustomerDetailsDialog = ({ isOpen, onOpenChange, customer }: ViewCustomerDetailsDialogProps) => {
  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            View detailed information about this customer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input value={customer.name} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>ID/Passport</Label>
              <Input value={customer.id_number} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={customer.email} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={customer.phone} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <Label>Language</Label>
              <Input value={customer.language} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Country of origin</Label>
              <Input value={customer.country} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={customer.cpf} readOnly className="bg-muted" />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Input value={customer.address} readOnly className="bg-muted" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Default Hotel/Accommodation</Label>
              <Input value={customer.hotel || 'Not specified'} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Room/Unit Number</Label>
              <Input value={customer.room || 'Not specified'} readOnly className="bg-muted" />
            </div>
          </div>

          <div>
            <Label>Accommodation Comments</Label>
            <Textarea
              value={customer.comments || 'No comments'}
              readOnly
              className="bg-muted"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Input value={customer.status} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Total Bookings</Label>
              <Input value={customer.total_bookings?.toString() || '0'} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Total Spent</Label>
              <Input value={`$${customer.total_spent || '0.00'}`} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Last Booking</Label>
              <Input value={customer.last_booking || 'Never'} readOnly className="bg-muted" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
