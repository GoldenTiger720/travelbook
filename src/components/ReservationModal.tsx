import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReservationForm } from "./ReservationForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  mode?: "create" | "edit"
  initialData?: any
}

export function ReservationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = "create", 
  initialData 
}: ReservationModalProps) {
  const handleSubmit = (data: any) => {
    onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Create New Reservation" : "Edit Reservation"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Fill in all the required information to create a new reservation"
              : "Update the reservation details"
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <ReservationForm 
            onSubmit={handleSubmit} 
            initialData={initialData}
            mode={mode}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}