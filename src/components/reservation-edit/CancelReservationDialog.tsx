import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CancelReservationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cancelReason: string
  setCancelReason: (reason: string) => void
  cancelFee: number
  setCancelFee: (fee: number) => void
  cancelObservation: string
  setCancelObservation: (observation: string) => void
  onConfirm: () => void
}

export const CancelReservationDialog = ({
  isOpen,
  onOpenChange,
  cancelReason,
  setCancelReason,
  cancelFee,
  setCancelFee,
  cancelObservation,
  setCancelObservation,
  onConfirm
}: CancelReservationDialogProps) => {
  const handleClose = () => {
    onOpenChange(false)
    setCancelReason('')
    setCancelFee(0)
    setCancelObservation('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Cancellation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Reason Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trip-cancellation">Trip Cancellation [70% Retention]</SelectItem>
                <SelectItem value="no-change-acceptance">Does not accept change suggestions [100% Retention]</SelectItem>
                <SelectItem value="bad-weather">Bad weather [0% Retention]</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="cancel-fee">Fee</Label>
            <Input
              id="cancel-fee"
              type="number"
              value={cancelFee}
              onChange={(e) => setCancelFee(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          {/* Observation Textarea */}
          <div className="space-y-2">
            <Label htmlFor="cancel-observation">Observation</Label>
            <Textarea
              id="cancel-observation"
              value={cancelObservation}
              onChange={(e) => setCancelObservation(e.target.value)}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
