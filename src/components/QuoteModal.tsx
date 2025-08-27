import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  mode?: "create" | "edit"
  initialData?: any
}

export function QuoteModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = "create", 
  initialData 
}: QuoteModalProps) {
  const handleSubmit = (data: any) => {
    onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {mode === "create" ? "Create New Quote" : "Edit Quote"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Prepare a detailed quote for your customer"
              : "Update the quote details"
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <QuoteForm 
            onSubmit={handleSubmit} 
            initialData={initialData}
            mode={mode}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}