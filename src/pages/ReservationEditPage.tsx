import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { reservationKeys, useReservationUniqueValues } from '@/hooks/useReservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Reservation } from '@/types/reservation'
import { format } from 'date-fns'
import { reservationService } from '@/services/reservationService'
import { useToast } from '@/components/ui/use-toast'
import {
  CalendarIcon,
  Save,
  ArrowLeft,
  User,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Globe,
  Hash,
  AlertCircle,
  Printer,
  Send,
  Download,
  Share2,
  Plus,
  Trash2,
  CreditCard,
  RefreshCcw,
  Eye,
  Edit
} from 'lucide-react'

// Payment interface
interface Payment {
  id: string
  date: Date
  method: string
  amount: number
  status: 'completed' | 'refunded' | 'pending' | 'partial' | 'paid' | 'cancelled'
  notes?: string
  receipt?: string
  refundedAmount?: number
  refundDate?: Date
  refundReason?: string
}

const ReservationEditPage = () => {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Use React Query hook for unique values
  const { data: uniqueValues, isLoading: isLoadingUniqueValues } = useReservationUniqueValues()

  // Payment history state
  const [payments, setPayments] = useState<Payment[]>([])

  // Payment details state (matching quotes page)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [paymentPercentage, setPaymentPercentage] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentComments, setPaymentComments] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  // New payment form state
  const [newPayment, setNewPayment] = useState<{
    date: Date
    method: string
    amount: number
    notes: string
    status: Payment['status']
    receipt: string
  }>({
    date: new Date(),
    method: 'credit-card',
    amount: 0,
    notes: '',
    status: 'completed',
    receipt: ''
  })

  // Dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  useEffect(() => {
    loadReservationDataFromCache()
  }, [reservationId])

  const loadReservationDataFromCache = () => {
    setLoading(true)
    try {
      // Get cached reservations from React Query
      const cachedReservations = queryClient.getQueryData<Reservation[]>(reservationKeys.lists())

      if (cachedReservations && reservationId) {
        const foundReservation = cachedReservations.find((r: Reservation) => r.id === reservationId)
        if (foundReservation) {
          setReservation(foundReservation)
        } else {
          toast({
            title: 'Error',
            description: 'Reservation not found in cache',
            variant: 'destructive'
          })
        }
      } else {
        // Fallback: If cache is empty, fetch from API
        loadReservationDataFromAPI()
        return
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reservation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadReservationDataFromAPI = async () => {
    setLoading(true)
    try {
      const reservations = await reservationService.getAllReservations()
      const foundReservation = reservations.find((r: Reservation) => r.id === reservationId)
      if (foundReservation) {
        setReservation(foundReservation)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reservation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: any, nested?: string) => {
    setReservation(prev => {
      if (!prev) return null

      if (nested) {
        const nestedObj = prev[nested as keyof Reservation]
        if (typeof nestedObj === 'object' && nestedObj !== null) {
          return {
            ...prev,
            [nested]: {
              ...nestedObj,
              [field]: value
            }
          }
        }
      }

      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleSave = async () => {
    if (!reservation) return

    setSaving(true)
    try {
      // Calculate total amount based on passengers and prices
      const totalAmount =
        (reservation.passengers.adults * reservation.pricing.adultPrice) +
        (reservation.passengers.children * reservation.pricing.childPrice) +
        (reservation.passengers.infants * reservation.pricing.infantPrice)

      const updatedReservation = {
        ...reservation,
        pricing: {
          ...reservation.pricing,
          totalAmount
        },
        updatedAt: new Date()
      }

      // Here you would typically call an API to save the reservation
      // For now, we'll just show a success message
      toast({
        title: '✅ Reservation Updated',
        description: `Reservation ${updatedReservation.reservationNumber} has been saved successfully`,
      })

      // Navigate back to all reservations
      navigate('/all-reservations')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save reservation',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
    toast({
      title: 'Print',
      description: 'Opening print dialog...',
    })
  }

  const handleSendEmail = () => {
    if (!reservation) return
    toast({
      title: 'Send Email',
      description: `Preparing to send reservation details to ${reservation.client.email}`,
    })
    // Here you would implement email sending functionality
  }

  const handleDownloadPDF = () => {
    if (!reservation) return
    toast({
      title: 'Download PDF',
      description: 'Generating PDF document...',
    })
    // Here you would implement PDF generation
  }

  const handleShare = () => {
    if (!reservation) return
    // Copy link to clipboard
    const link = window.location.href
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link Copied',
      description: 'Reservation link copied to clipboard',
    })
  }

  // Payment handlers
  const handleAddPayment = () => {
    if (!reservation) return

    if (newPayment.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Payment amount must be greater than 0',
        variant: 'destructive'
      })
      return
    }

    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalAmount =
      (reservation.passengers.adults * reservation.pricing.adultPrice) +
      (reservation.passengers.children * reservation.pricing.childPrice) +
      (reservation.passengers.infants * reservation.pricing.infantPrice)

    if (totalPaid + newPayment.amount > totalAmount) {
      toast({
        title: 'Validation Error',
        description: 'Payment amount exceeds remaining balance',
        variant: 'destructive'
      })
      return
    }

    const payment: Payment = {
      id: Date.now().toString(),
      date: newPayment.date,
      method: newPayment.method,
      amount: newPayment.amount,
      status: newPayment.status,
      notes: newPayment.notes,
      receipt: newPayment.receipt
    }

    setPayments([...payments, payment])

    // Reset form and close dialog
    setNewPayment({
      date: new Date(),
      method: 'credit-card',
      amount: 0,
      notes: '',
      status: 'completed',
      receipt: ''
    })
    setIsPaymentDialogOpen(false)

    toast({
      title: 'Payment Added',
      description: `Payment of ${reservationService.formatCurrency(payment.amount, reservation.pricing.currency)} has been recorded`,
    })
  }

  const handleOpenPaymentDialog = () => {
    setIsPaymentDialogOpen(true)
  }

  // Helper functions for payment details
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'CLP': '$',
      'BRL': 'R$',
      'ARS': '$'
    }
    return symbols[currency] || currency
  }

  const calculateGrandTotal = () => {
    if (!reservation) return 0
    return (
      (reservation.passengers.adults * reservation.pricing.adultPrice) +
      (reservation.passengers.children * reservation.pricing.childPrice) +
      (reservation.passengers.infants * reservation.pricing.infantPrice)
    )
  }

  const handleRefundPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment || !reservation) return

    if (payment.status === 'refunded') {
      toast({
        title: 'Already Refunded',
        description: 'This payment has already been refunded',
        variant: 'destructive'
      })
      return
    }

    // For now, refund the full amount. You can add a modal to specify partial refund
    setPayments(payments.map(p =>
      p.id === paymentId
        ? {
            ...p,
            status: 'refunded' as const,
            refundedAmount: p.amount,
            refundDate: new Date()
          }
        : p
    ))

    toast({
      title: 'Payment Refunded',
      description: `Refund of ${reservationService.formatCurrency(payment.amount, reservation.pricing.currency)} has been processed`,
    })
  }

  const handleDeletePayment = (paymentId: string) => {
    setPayments(payments.filter(p => p.id !== paymentId))
    toast({
      title: 'Payment Deleted',
      description: 'Payment record has been removed',
    })
  }

  const calculatePaymentSummary = () => {
    if (!reservation) return { total: 0, paid: 0, refunded: 0, remaining: 0 }

    const totalAmount =
      (reservation.passengers.adults * reservation.pricing.adultPrice) +
      (reservation.passengers.children * reservation.pricing.childPrice) +
      (reservation.passengers.infants * reservation.pricing.infantPrice)

    const paid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    const refunded = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refundedAmount || 0), 0)

    const remaining = totalAmount - paid + refunded

    return { total: totalAmount, paid, refunded, remaining }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reservation...</p>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Reservation Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The reservation you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/all-reservations')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reservations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Header with Save Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/all-reservations')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Reservation</h1>
              <p className="text-muted-foreground">#{reservation.reservationNumber}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  General Information
                </span>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(reservation.status)}>
                    {reservation.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                    {reservation.paymentStatus}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reservationNumber">Reservation Number</Label>
                  <Input
                    id="reservationNumber"
                    value={reservation.reservationNumber}
                    onChange={(e) => handleFieldChange('reservationNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseOrderNumber">Purchase Order Number</Label>
                  <Input
                    id="purchaseOrderNumber"
                    value={reservation.purchaseOrderNumber || ''}
                    onChange={(e) => handleFieldChange('purchaseOrderNumber', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Operation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reservation.operationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reservation.operationDate ? 
                          format(reservation.operationDate, "PPP") : 
                          "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reservation.operationDate}
                        onSelect={(date) => handleFieldChange('operationDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Sale Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reservation.saleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reservation.saleDate ? 
                          format(reservation.saleDate, "PPP") : 
                          "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reservation.saleDate}
                        onSelect={(date) => handleFieldChange('saleDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Reservation Status</Label>
                  <Select 
                    value={reservation.status} 
                    onValueChange={(value) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select 
                    value={reservation.paymentStatus} 
                    onValueChange={(value) => handleFieldChange('paymentStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={reservation.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this reservation..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Name</Label>
                  <Input
                    id="clientName"
                    value={reservation.client.name}
                    onChange={(e) => handleFieldChange('name', e.target.value, 'client')}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientEmail"
                      type="email"
                      className="pl-10"
                      value={reservation.client.email}
                      onChange={(e) => handleFieldChange('email', e.target.value, 'client')}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientPhone"
                      className="pl-10"
                      value={reservation.client.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value, 'client')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientCountry">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="clientCountry"
                      className="pl-10"
                      value={reservation.client.country}
                      onChange={(e) => handleFieldChange('country', e.target.value, 'client')}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="clientIdNumber">ID Number</Label>
                <Input
                  id="clientIdNumber"
                  value={reservation.client.idNumber}
                  onChange={(e) => handleFieldChange('idNumber', e.target.value, 'client')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Reservations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="min-w-[200px]">Tour</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[80px] text-center">PAX</TableHead>
                      <TableHead className="w-[120px] text-right">Price</TableHead>
                      <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="align-top py-3">
                        <div className="text-sm font-medium">
                          {format(reservation.operationDate, "yyyy-MM-dd")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          * {reservation.tour.pickupTime}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {format(reservation.operationDate, 'EEEE')}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{reservation.tour.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-mono">{reservation.reservationNumber}</span>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{reservation.tour.pickupAddress}</span>
                          </div>
                          {reservation.notes && (
                            <div className="text-xs flex items-start gap-1">
                              <span className="text-muted-foreground">ℹ️</span>
                              <span className="text-muted-foreground">{reservation.notes}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <Badge className={cn(
                          "text-xs",
                          reservation.status === 'confirmed' && "bg-blue-100 text-blue-800",
                          reservation.status === 'pending' && "bg-yellow-100 text-yellow-800",
                          reservation.status === 'cancelled' && "bg-red-100 text-red-800",
                          reservation.status === 'completed' && "bg-green-100 text-green-800"
                        )}>
                          {reservation.status === 'confirmed' ? 'Reserved' :
                           reservation.status === 'cancelled' ? 'Canceled' :
                           reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-3 text-center">
                        <div className="text-sm font-medium">
                          {reservation.passengers.adults + reservation.passengers.children + reservation.passengers.infants}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3 text-right">
                        <div className="text-sm">
                          {reservationService.formatCurrency(reservation.pricing.adultPrice, reservation.pricing.currency)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3 text-right font-semibold">
                        {reservationService.formatCurrency(
                          (reservation.passengers.adults * reservation.pricing.adultPrice) +
                          (reservation.passengers.children * reservation.pricing.childPrice) +
                          (reservation.passengers.infants * reservation.pricing.infantPrice),
                          reservation.pricing.currency
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="border-t p-4 bg-muted/20">
                <div className="flex justify-end items-center gap-4">
                  <div className="text-sm font-semibold">Total reservations:</div>
                  <div className="text-lg font-bold text-primary">
                    {reservationService.formatCurrency(
                      (reservation.passengers.adults * reservation.pricing.adultPrice) +
                      (reservation.passengers.children * reservation.pricing.childPrice) +
                      (reservation.passengers.infants * reservation.pricing.infantPrice),
                      reservation.pricing.currency
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="w-[150px]">Payment Method</TableHead>
                      <TableHead className="w-[120px]">Total Price</TableHead>
                      <TableHead className="w-[100px]">Percentage</TableHead>
                      <TableHead className="w-[120px]">Amount Paid</TableHead>
                      <TableHead className="w-[120px]">Pending</TableHead>
                      <TableHead className="w-[120px]">Receipt</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {/* Payment Date */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm">
                          {paymentDate ? format(paymentDate, "dd/MM/yyyy") : "-"}
                        </span>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm capitalize">
                          {paymentMethod.replace('-', ' ')}
                        </span>
                      </TableCell>

                      {/* Total Price */}
                      <TableCell className="align-top py-3">
                        <div className="p-2 bg-green-100 border rounded-md text-center">
                          <span className="font-semibold text-sm">
                            {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {calculateGrandTotal().toLocaleString()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Percentage */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm">
                          {paymentPercentage}%
                        </span>
                      </TableCell>

                      {/* Amount Paid */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm font-medium">
                          {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {amountPaid.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Amount Pending */}
                      <TableCell className="align-top py-3">
                        <div className="p-2 bg-gray-100 border rounded-md text-center">
                          <span className="font-semibold text-sm text-red-600">
                            {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {(calculateGrandTotal() - amountPaid).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Receipt */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm text-muted-foreground">
                          {receiptFile ? receiptFile.name : "-"}
                        </span>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="align-top py-3">
                        <Badge className={cn(
                          "text-xs",
                          paymentStatus === 'paid' && "bg-green-100 text-green-800",
                          paymentStatus === 'refunded' && "bg-red-100 text-red-800",
                          paymentStatus === 'cancelled' && "bg-red-100 text-red-800",
                          paymentStatus === 'pending' && "bg-yellow-100 text-yellow-800",
                          paymentStatus === 'partial' && "bg-blue-100 text-blue-800"
                        )}>
                          {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </Badge>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="align-top py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={handleOpenPaymentDialog}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Payment Details</DialogTitle>
                <DialogDescription>
                  Update payment information for this reservation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !paymentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={paymentDate}
                          onSelect={setPaymentDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash-office">Cash Office</SelectItem>
                        <SelectItem value="mercado-pago">Mercado Pago</SelectItem>
                        <SelectItem value="van-is-broken">Van Is Broken</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="nubank-transfer">Nubank Transfer</SelectItem>
                        <SelectItem value="wise">Wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={paymentPercentage}
                      onChange={(e) => {
                        const percentage = parseInt(e.target.value) || 0
                        setPaymentPercentage(percentage)
                        const totalAmount = calculateGrandTotal()
                        const calculatedAmount = Math.round((totalAmount * percentage) / 100)
                        setAmountPaid(calculatedAmount)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount Paid</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                        {getCurrencySymbol(reservation?.pricing.currency || 'CLP')}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        className="pl-12"
                        value={amountPaid}
                        onChange={(e) => {
                          const amount = parseInt(e.target.value) || 0
                          setAmountPaid(amount)
                          const totalAmount = calculateGrandTotal()
                          if (totalAmount > 0) {
                            const calculatedPercentage = Math.round((amount / totalAmount) * 100)
                            setPaymentPercentage(calculatedPercentage)
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Receipt Upload</Label>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
                  />
                  {receiptFile && (
                    <span className="text-xs text-muted-foreground">
                      Selected: {receiptFile.name}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsPaymentDialogOpen(false)
                  toast({
                    title: 'Payment Updated',
                    description: 'Payment details have been saved successfully',
                  })
                }} className="bg-indigo-500 hover:bg-indigo-600">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Operations Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Operations Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salesperson">Salesperson</Label>
                  <Select 
                    value={reservation.salesperson} 
                    onValueChange={(value) => handleFieldChange('salesperson', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues?.salespersons?.map((sp: string) => (
                        <SelectItem key={sp} value={sp}>{sp}</SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operator">Operator</Label>
                  <Select 
                    value={reservation.operator || 'none'} 
                    onValueChange={(value) => handleFieldChange('operator', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {uniqueValues?.operators?.map((op: string) => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guide">Guide</Label>
                  <Select 
                    value={reservation.guide || 'none'} 
                    onValueChange={(value) => handleFieldChange('guide', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {uniqueValues?.guides?.map((guide: string) => (
                        <SelectItem key={guide} value={guide}>{guide}</SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select 
                    value={reservation.driver || 'none'} 
                    onValueChange={(value) => handleFieldChange('driver', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {uniqueValues?.drivers?.map((driver: string) => (
                        <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="externalAgency">External Agency</Label>
                <Select 
                  value={reservation.externalAgency || 'none'} 
                  onValueChange={(value) => handleFieldChange('externalAgency', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Assigned</SelectItem>
                    {uniqueValues?.agencies?.map((agency: string) => (
                      <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/all-reservations')}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReservationEditPage