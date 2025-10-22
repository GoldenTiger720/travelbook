import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { reservationKeys, useReservationUniqueValues } from '@/hooks/useReservations'
import { useUpdateCustomer } from '@/hooks/useCustomers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
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
import { EditCustomerDialog, CustomerFormData } from '@/components/customer'
import {
  CalendarIcon,
  Save,
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Mail,
  Phone,
  Printer,
  Send,
  Download,
  AlertCircle,
  Share2,
  Eye,
  Edit,
  Plus,
  RefreshCcw
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

  // Customer update mutation
  const updateCustomerMutation = useUpdateCustomer()

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
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<any>(null)

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

  const handleOpenCustomerDialog = () => {
    // Prepare customer data for editing
    if (reservation) {
      const customerData = {
        id: reservation.client.id,
        name: reservation.client.name,
        id_number: reservation.client.idNumber || '',
        email: reservation.client.email,
        phone: reservation.client.phone,
        language: reservation.client.language || '',
        country: reservation.client.country,
        cpf: reservation.client.cpf || '',
        address: reservation.client.address || '',
        hotel: reservation.client.hotel || '',
        room: reservation.client.room || '',
        comments: reservation.client.comments || ''
      }
      setCustomerToEdit(customerData)
      setIsEditCustomerOpen(true)
    }
  }

  const handleSaveCustomer = async (id: string, data: CustomerFormData) => {
    try {
      // Send PUT request to backend to update customer
      await updateCustomerMutation.mutateAsync({
        id: reservation?.client.id || id,
        data: {
          name: data.name,
          id_number: data.id_number,
          email: data.email,
          phone: data.phone,
          country: data.country,
          language: data.language,
          cpf: data.cpf,
          address: data.address,
          hotel: data.hotel,
          room: data.room,
          comments: data.comments
        }
      })

      // Update the reservation's client data locally after successful API call
      if (reservation) {
        setReservation({
          ...reservation,
          client: {
            ...reservation.client,
            name: data.name,
            idNumber: data.id_number,
            email: data.email,
            phone: data.phone,
            country: data.country,
            language: data.language,
            cpf: data.cpf,
            address: data.address,
            hotel: data.hotel,
            room: data.room,
            comments: data.comments
          }
        })
      }

      setIsEditCustomerOpen(false)
      setCustomerToEdit(null)
    } catch (error) {
      console.error('Error updating customer:', error)
      // Error is handled by the mutation hook with toast notifications
    }
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
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
            onClick={handleOpenCustomerDialog}
          >
            <User className="w-4 h-4 mr-2" />
            Modify customer data
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              // Handle terms and conditions
              toast({
                title: 'Terms and Conditions',
                description: 'Terms and conditions not yet accepted',
                variant: 'destructive'
              })
            }}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Terms and conditions not yet accepted
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Link
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSendEmail}
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white p-3"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Purchase Order Header */}
          <Card>
            <CardContent className="p-8">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-8">
                {/* Company Info - Left */}
                <div className="space-y-3">
                  <img src="/omg.png" alt="Company Logo" className="h-12 w-auto" />
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{reservation.email || 'ulliviagens@gmail.com'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{reservation.phone || '+56985400793'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>Salesperson: {reservation.salesperson}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Order Info - Right */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600 mb-1">Purchase order</div>
                  <div className="text-3xl font-bold text-gray-800 mb-6">
                    {reservation.purchaseOrderNumber || reservation.reservationNumber}
                  </div>
                  <div className="flex gap-2 justify-end mb-2">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                      {reservation.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pink Divider */}
              <div className="h-1 bg-gradient-to-r from-pink-500 to-pink-600 mb-6"></div>

              {/* Customer and Dates Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info - Left */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Customer:</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{reservation.client.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {reservation.client.country}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {reservation.client.idNumber && (
                        <div>ID: {reservation.client.idNumber}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{reservation.client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{reservation.client.email}</span>
                    </div>
                  </div>
                </div>

                {/* Dates and Details - Right */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-1">Purchase Date:</h3>
                    <div className="text-sm text-gray-600">
                      {reservation.saleDate ? format(reservation.saleDate, "EEEE, dd-MM-yyyy") : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-1">First tour date:</h3>
                    <div className="text-sm text-gray-600">
                      {format(reservation.operationDate, "EEEE, dd-MM-yyyy")}
                    </div>
                  </div>
                  {(reservation.operator || reservation.guide || reservation.driver) && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-1">Operations Team:</h3>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {reservation.operator && <div>Operator: {reservation.operator}</div>}
                        {reservation.guide && <div>Guide: {reservation.guide}</div>}
                        {reservation.driver && <div>Driver: {reservation.driver}</div>}
                        {reservation.externalAgency && <div>Agency: {reservation.externalAgency}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pink Divider */}
              <div className="h-1 bg-gradient-to-r from-pink-500 to-pink-600 mt-6"></div>
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

              {/* Add More Reservations Button */}
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: 'Add Tour',
                      description: 'Tour addition functionality will be implemented here',
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add more reservations
                </Button>
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
                          {reservation.paymentDetails?.date ? format(new Date(reservation.paymentDetails.date), "dd/MM/yyyy") : "-"}
                        </span>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm capitalize">
                          {reservation.paymentDetails?.method ? reservation.paymentDetails.method.replace('-', ' ') : '-'}
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
                          {reservation.paymentDetails?.percentage || 0}%
                        </span>
                      </TableCell>

                      {/* Amount Paid */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm font-medium">
                          {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {(reservation.paymentDetails?.amountPaid || 0).toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Amount Pending */}
                      <TableCell className="align-top py-3">
                        <div className="p-2 bg-gray-100 border rounded-md text-center">
                          <span className="font-semibold text-sm text-red-600">
                            {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {
                              (reservation.paymentDetails?.status === 'paid'
                                ? 0
                                : calculateGrandTotal() - (reservation.paymentDetails?.amountPaid || 0)
                              ).toLocaleString()
                            }
                          </span>
                        </div>
                      </TableCell>

                      {/* Receipt */}
                      <TableCell className="align-top py-3">
                        <span className="text-sm text-muted-foreground">
                          {reservation.paymentDetails?.receiptFile ? "View" : "-"}
                        </span>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell className="align-top py-3">
                        <Badge className={cn(
                          "text-xs",
                          reservation.paymentDetails?.status === 'paid' && "bg-green-100 text-green-800",
                          reservation.paymentDetails?.status === 'refunded' && "bg-red-100 text-red-800",
                          reservation.paymentDetails?.status === 'cancelled' && "bg-red-100 text-red-800",
                          reservation.paymentDetails?.status === 'pending' && "bg-yellow-100 text-yellow-800",
                          reservation.paymentDetails?.status === 'partial' && "bg-blue-100 text-blue-800"
                        )}>
                          {reservation.paymentDetails?.status ? reservation.paymentDetails.status.charAt(0).toUpperCase() + reservation.paymentDetails.status.slice(1) : 'Pending'}
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

              {/* Payment Footer */}
              <div className="border-t p-6">
                {/* Total Payments Row */}
                <div className="flex justify-end items-center mb-6 pb-4 border-b">
                  <span className="text-sm font-medium text-gray-600 mr-4">Total payments:</span>
                  <span className="text-xl font-bold text-gray-800">
                    {getCurrencySymbol(reservation?.pricing.currency || 'CLP')} {(reservation.paymentDetails?.amountPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleOpenPaymentDialog}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a payment
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-500 text-indigo-500 hover:bg-indigo-50"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Add a refund
                  </Button>
                </div>
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

        {/* Edit Customer Dialog */}
        <EditCustomerDialog
          isOpen={isEditCustomerOpen}
          onOpenChange={setIsEditCustomerOpen}
          customer={customerToEdit}
          onSubmit={handleSaveCustomer}
          isPending={updateCustomerMutation.isPending}
        />
      </div>
    </div>
  )
}

export default ReservationEditPage