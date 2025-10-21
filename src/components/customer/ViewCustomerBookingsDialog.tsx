import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { getStatusColor } from "./utils"

interface ViewCustomerBookingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  customer: any
}

export const ViewCustomerBookingsDialog = ({ isOpen, onOpenChange, customer }: ViewCustomerBookingsDialogProps) => {
  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Bookings</DialogTitle>
          <DialogDescription>
            View all bookings for {customer.name || 'this customer'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {customer.bookings?.length || 0} Booking(s)
            </h3>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
          </div>

          {customer.bookings && customer.bookings.length > 0 ? (
            <div className="space-y-4">
              {customer.bookings.map((booking: any) => (
                <Card key={booking.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{booking.destination}</h4>
                      <Badge className={booking.status === 'confirmed' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tour Type:</span> {booking.tour_type}
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span> {booking.currency} {booking.total_amount}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {new Date(booking.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Passengers:</span> {booking.passengers}
                      </div>
                      <div>
                        <span className="font-medium">Hotel:</span> {booking.hotel}
                      </div>
                      <div>
                        <span className="font-medium">Room:</span> {booking.room}
                      </div>
                    </div>

                    {booking.additional_notes && (
                      <div>
                        <span className="font-medium">Notes:</span> {booking.additional_notes}
                      </div>
                    )}

                    {booking.booking_tours && booking.booking_tours.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Tour Details:</h5>
                        {booking.booking_tours.map((tour: any) => (
                          <div key={tour.id} className="bg-muted p-3 rounded text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div><span className="font-medium">Tour:</span> {tour.tour_name}</div>
                              <div><span className="font-medium">Code:</span> {tour.tour_code}</div>
                              <div><span className="font-medium">Pickup:</span> {tour.pickup_address}</div>
                              <div><span className="font-medium">Time:</span> {tour.pickup_time}</div>
                              <div><span className="font-medium">Adults:</span> {tour.adult_pax} × ${tour.adult_price}</div>
                              <div><span className="font-medium">Children:</span> {tour.child_pax} × ${tour.child_price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                This customer hasn't made any bookings yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
