import { Button } from '@/components/ui/button'
import { User, AlertCircle, Share2, Send, Printer } from 'lucide-react'

interface ActionButtonsProps {
  onOpenCustomerDialog: () => void
  onTermsConditions: () => void
  onShare: () => void
  onSendEmail: () => void
  onPrint: () => void
}

export const ActionButtons = ({
  onOpenCustomerDialog,
  onTermsConditions,
  onShare,
  onSendEmail,
  onPrint
}: ActionButtonsProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Button
        className="bg-indigo-500 hover:bg-indigo-600 text-white"
        onClick={onOpenCustomerDialog}
      >
        <User className="w-4 h-4 mr-2" />
        Modify customer data
      </Button>
      <Button
        className="bg-red-500 hover:bg-red-600 text-white"
        onClick={onTermsConditions}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Terms and conditions not yet accepted
      </Button>
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        onClick={onShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Link
      </Button>
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        onClick={onSendEmail}
      >
        <Send className="w-4 h-4 mr-2" />
        Send
      </Button>
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white p-3"
        onClick={onPrint}
      >
        <Printer className="w-4 h-4" />
      </Button>
    </div>
  )
}
