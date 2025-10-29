import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ReservationHeaderProps {
  reservationNumber: string
  onBack: () => void
}

export const ReservationHeader = ({
  reservationNumber,
  onBack
}: ReservationHeaderProps) => {
  return (
    <div className="mb-6 flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Edit Reservation</h1>
        <p className="text-muted-foreground">#{reservationNumber}</p>
      </div>
    </div>
  )
}
