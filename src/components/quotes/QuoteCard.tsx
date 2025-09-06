import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { 
  FileText,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  MapPin,
  Eye,
  Edit,
  Send,
  Copy,
  Trash2,
  Link2,
  MoreVertical,
  BookOpen
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Quote } from "@/types/quote"

interface QuoteCardProps {
  quote: Quote
  onView: (quote: Quote) => void
  onEdit: (quote: Quote) => void
  onDuplicate: (quote: Quote) => void
  onConvertToBooking: (quote: Quote) => void
  onGenerateLink: (quote: Quote) => void
  onSendEmail: (quote: Quote) => void
  onDelete: (quote: Quote) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-success text-success-foreground"
    case "pending": return "bg-warning text-warning-foreground"
    case "sent": return "bg-primary text-primary-foreground"
    case "draft": return "bg-secondary text-secondary-foreground"
    case "converted": return "bg-purple-500 text-white"
    case "expired": return "bg-destructive text-destructive-foreground"
    case "cancelled": return "bg-muted text-muted-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case "instagram": return "📷"
    case "whatsapp": return "💬"
    case "website": return "🌐"
    case "email": return "✉️"
    case "referral": return "🤝"
    case "direct": return "🏢"
    default: return "📌"
  }
}

export function QuoteCard({
  quote,
  onView,
  onEdit,
  onDuplicate,
  onConvertToBooking,
  onGenerateLink,
  onSendEmail,
  onDelete
}: QuoteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile Header with Status and Menu */}
        <div className="flex items-start justify-between mb-3 sm:hidden">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getStatusColor(quote.status))}>
              {quote.status}
            </Badge>
            <span className="text-lg" title={quote.leadSource}>
              {getSourceIcon(quote.leadSource)}
            </span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => onView(quote)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => onEdit(quote)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onDuplicate(quote)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onGenerateLink(quote)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onSendEmail(quote)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Separator className="my-1" />
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-primary"
                  onClick={() => onConvertToBooking(quote)}
                  disabled={quote.status === 'converted'}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Convert to Booking
                </Button>
                <Separator className="my-1" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive"
                  onClick={() => onDelete(quote)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Quote Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{quote.quoteNumber}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {quote.customer.name}
              </p>
              <p className="text-xs text-muted-foreground truncate sm:hidden">
                {quote.customer.email}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge className={getStatusColor(quote.status)}>
              {quote.status}
            </Badge>
            <span className="text-xl" title={quote.leadSource}>
              {getSourceIcon(quote.leadSource)}
            </span>
          </div>
        </div>
        
        {/* Quote Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm text-foreground line-clamp-2">{quote.tourDetails.destination}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">
                {format(quote.tourDetails.startDate, "MMM dd")}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">
                {quote.tourDetails.passengers} PAX
              </span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold text-foreground">
                {quote.pricing.currency} {quote.pricing.amount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm text-muted-foreground truncate">
              {quote.assignedTo} • {quote.agency || "Direct"}
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="sm:hidden">Created: {format(quote.metadata.createdAt, "MMM dd")}</span>
              <span className="hidden sm:inline">Created: {format(quote.metadata.createdAt, "MMM dd, yyyy")}</span>
              {" • "}
              <span className="sm:hidden">Exp: {format(quote.validUntil, "MMM dd")}</span>
              <span className="hidden sm:inline">Expires: {format(quote.validUntil, "MMM dd, yyyy")}</span>
              {quote.validUntil < new Date() && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Expired
                </Badge>
              )}
            </p>
            {quote.termsAccepted?.accepted && (
              <p className="text-xs text-green-600">
                ✓ Terms accepted
                <span className="hidden sm:inline">
                  {" by "}{quote.termsAccepted.acceptedBy} on{" "}
                  {format(quote.termsAccepted.acceptedAt!, "MMM dd, yyyy")}
                </span>
              </p>
            )}
          </div>
          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              title="View details"
              onClick={() => onView(quote)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title="Edit quote"
              onClick={() => onEdit(quote)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              title="Duplicate quote"
              onClick={() => onDuplicate(quote)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              title="Convert to booking"
              onClick={() => onConvertToBooking(quote)}
              className="text-primary"
              disabled={quote.status === 'converted'}
            >
              <BookOpen className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              title="Generate shareable link"
              onClick={() => onGenerateLink(quote)}
            >
              <Link2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              title="Send by email"
              onClick={() => onSendEmail(quote)}
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive"
              title="Delete quote"
              onClick={() => onDelete(quote)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}