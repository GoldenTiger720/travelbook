import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'

interface ReservationHeaderProps {
  reservationNumber: string
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export const ReservationHeader = ({
  reservationNumber,
  onBack,
  onSave,
  saving
}: ReservationHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
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
      <Button onClick={onSave} disabled={saving}>
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
