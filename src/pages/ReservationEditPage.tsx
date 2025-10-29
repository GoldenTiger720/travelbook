import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { reservationKeys } from '@/hooks/useReservations'
import { useUpdateCustomer } from '@/hooks/useCustomers'
import { reservationService } from '@/services/reservationService'
import { EditCustomerDialog, CustomerFormData } from '@/components/customer'
import TourModal from '@/components/TourModal'
import { apiCall } from '@/config/api'
import {
  ReservationHeader,
  ActionButtons,
  PurchaseOrderCard,
  ReservationsTable,
  PaymentsSection,
  CancelReservationDialog,
  EditPaymentDialog,
  AddPaymentDialog,
  useReservationEdit,
  calculateGrandTotal
} from '@/components/reservation-edit'

const ReservationEditPage = () => {
  const queryClient = useQueryClient()

  // Separate dialog states for Add vs Edit payment
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false)
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false)

  const {
    reservation,
    setReservation,
    allToursForBooking,
    loading,
    saving,
    paymentDate,
    setPaymentDate,
    paymentMethod,
    setPaymentMethod,
    paymentPercentage,
    setPaymentPercentage,
    amountPaid,
    setAmountPaid,
    paymentStatus,
    setPaymentStatus,
    receiptFile,
    setReceiptFile,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    paymentModalMode,
    setPaymentModalMode,
    isEditCustomerOpen,
    setIsEditCustomerOpen,
    customerToEdit,
    setCustomerToEdit,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isTourModalOpen,
    setIsTourModalOpen,
    tourModalMode,
    setTourModalMode,
    cancelReason,
    setCancelReason,
    cancelFee,
    setCancelFee,
    cancelObservation,
    setCancelObservation,
    editingTour,
    setEditingTour,
    destinations,
    handleSave,
    navigate,
    toast,
    reservationId,
    loadReservationDataFromCache
  } = useReservationEdit()

  // Customer update mutation
  const updateCustomerMutation = useUpdateCustomer()

  const handleReservationAction = async (action: 'cancel' | 'confirm' | 'checkin' | 'noshow', tourReservation: typeof reservation) => {
    if (!tourReservation) return

    if (action === 'cancel') {
      // Set the reservation to the selected tour before opening cancel modal
      setReservation(tourReservation)
      setIsCancelModalOpen(true)
      return
    }

    try {
      let actionTitle = ''
      let actionDescription = ''

      switch (action) {
        case 'confirm':
          actionTitle = 'Reservation Confirmed'
          actionDescription = `Reservation ${tourReservation.reservationNumber} has been confirmed`
          // Update the specific tour in the list
          if (tourReservation.id === reservation?.id) {
            setReservation(prev => {
              if (!prev) return null
              return {
                ...prev,
                status: 'confirmed',
                tourStatus: 'confirmed',
                updatedAt: new Date()
              }
            })
          }
          break
        case 'checkin':
          if (!tourReservation.tourId) {
            throw new Error('Tour ID not found')
          }
          await reservationService.checkinBookingTour(tourReservation.tourId)
          actionTitle = 'Check-in Completed'
          actionDescription = `Check-in completed for reservation ${tourReservation.reservationNumber}`
          // Update the specific tour in the list
          if (tourReservation.id === reservation?.id) {
            setReservation(prev => {
              if (!prev) return null
              return {
                ...prev,
                tourStatus: 'checked-in',
                updatedAt: new Date()
              }
            })
          }
          break
        case 'noshow':
          if (!tourReservation.tourId) {
            throw new Error('Tour ID not found')
          }
          await reservationService.noshowBookingTour(tourReservation.tourId)
          actionTitle = 'No Show Marked'
          actionDescription = `Reservation ${tourReservation.reservationNumber} marked as no show`
          // Update the specific tour in the list
          if (tourReservation.id === reservation?.id) {
            setReservation(prev => {
              if (!prev) return null
              return {
                ...prev,
                tourStatus: 'no-show',
                updatedAt: new Date()
              }
            })
          }
          break
      }

      // Invalidate cache to refetch all tours
      await queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      loadReservationDataFromCache()

      toast({
        title: actionTitle,
        description: actionDescription,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} reservation`,
        variant: 'destructive'
      })
    }
  }

  const handleConfirmCancellation = async () => {
    if (!reservation) return

    if (!cancelReason) {
      toast({
        title: 'Validation Error',
        description: 'Please select a cancellation reason',
        variant: 'destructive'
      })
      return
    }

    if (!reservation.tourId) {
      toast({
        title: 'Error',
        description: 'Tour ID not found',
        variant: 'destructive'
      })
      return
    }

    try {
      await reservationService.cancelBookingTour(reservation.tourId, {
        reason: cancelReason,
        fee: cancelFee,
        observation: cancelObservation
      })

      setReservation(prev => {
        if (!prev) return null
        return {
          ...prev,
          status: 'cancelled',
          tourStatus: 'cancelled',
          updatedAt: new Date()
        }
      })

      toast({
        title: 'Reservation Cancelled',
        description: `Reservation ${reservation.reservationNumber} has been cancelled. Reason: ${cancelReason}`,
      })

      setIsCancelModalOpen(false)
      setCancelReason('')
      setCancelFee(0)
      setCancelObservation('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation',
        variant: 'destructive'
      })
    }
  }

  const handleAddTour = () => {
    setTourModalMode('add')
    setEditingTour(null)
    setIsTourModalOpen(true)
  }

  const handleEditTour = (tourReservation: typeof reservation) => {
    if (!tourReservation) return

    setTourModalMode('edit')

    // Find the destinationId by searching through destinations
    let destinationId = ''
    console.log('Finding destinationId for tour:', tourReservation.tour.id)
    console.log('Available destinations:', destinations.length)

    for (const dest of destinations) {
      const foundTour = dest.tours.find((t: any) => t.id === tourReservation.tour.id)
      if (foundTour) {
        destinationId = dest.id
        console.log('Found destinationId:', destinationId, 'for destination:', dest.name)
        break
      }
    }

    if (!destinationId) {
      console.warn('Could not find destinationId for tour:', tourReservation.tour.id)
    }

    const tourData = {
      tourId: tourReservation.tour.id,
      tourName: tourReservation.tour.name,
      destination: tourReservation.tour.destination,
      destinationId: destinationId,
      date: tourReservation.operationDate,
      pickupAddress: tourReservation.tour.pickupAddress,
      pickupTime: tourReservation.tour.pickupTime,
      adultPax: tourReservation.passengers.adults,
      adultPrice: tourReservation.pricing.adultPrice,
      childPax: tourReservation.passengers.children,
      childPrice: tourReservation.pricing.childPrice,
      infantPax: tourReservation.passengers.infants,
      infantPrice: tourReservation.pricing.infantPrice,
      comments: tourReservation.notes || '',
      operator: tourReservation.operator || 'own-operation',
    }

    console.log('Opening TourModal with data:', tourData)
    setEditingTour(tourData)
    setIsTourModalOpen(true)
  }

  const handleSaveTour = async (tourData: any) => {
    if (!reservation || !reservation.tourId) {
      toast({
        title: 'Error',
        description: 'Cannot save tour: missing tour ID',
        variant: 'destructive',
      })
      return
    }

    try {
      if (tourModalMode === 'edit') {
        const response = await apiCall(`/api/reservations/booking-tour/${reservation.tourId}/update/`, {
          method: 'PUT',
          body: JSON.stringify({
            tourId: tourData.tourId,
            destinationId: tourData.destinationId,
            date: tourData.date.toISOString(),
            pickupAddress: tourData.pickupAddress,
            pickupTime: tourData.pickupTime,
            adultPax: tourData.adultPax,
            adultPrice: tourData.adultPrice,
            childPax: tourData.childPax,
            childPrice: tourData.childPrice,
            infantPax: tourData.infantPax,
            infantPrice: tourData.infantPrice,
            comments: tourData.comments,
            operator: tourData.operator,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update tour')
        }

        setReservation(prev => {
          if (!prev) return null
          return {
            ...prev,
            tour: {
              ...prev.tour,
              id: tourData.tourId,
              name: tourData.tourName,
              destination: tourData.destination,
              pickupAddress: tourData.pickupAddress,
              pickupTime: tourData.pickupTime,
            },
            operationDate: tourData.date,
            passengers: {
              adults: tourData.adultPax,
              children: tourData.childPax,
              infants: tourData.infantPax,
            },
            pricing: {
              ...prev.pricing,
              adultPrice: tourData.adultPrice,
              childPrice: tourData.childPrice,
              infantPrice: tourData.infantPrice,
            },
            notes: tourData.comments,
          }
        })

        toast({
          title: 'Tour Updated',
          description: 'Tour has been successfully updated',
        })
      } else {
        // Extract the booking ID by removing any "-tour-X" suffix
        const bookingId = reservationId?.replace(/-tour-\d+$/, '') || reservationId

        // Create optimistic new reservation entry for immediate display
        const newTourIndex = allToursForBooking.length
        const optimisticReservation = {
          id: `${bookingId}-tour-${newTourIndex}`,
          reservationNumber: reservation?.reservationNumber || bookingId.split('-')[0].toUpperCase(),
          operationDate: tourData.date,
          saleDate: reservation?.saleDate || new Date(),
          status: reservation?.status || 'pending',
          paymentStatus: reservation?.paymentStatus || 'pending',
          client: reservation?.client || {
            id: '',
            name: '',
            email: '',
            phone: '',
            country: '',
            idNumber: '',
            language: '',
            cpf: '',
            address: '',
            hotel: '',
            room: '',
            comments: ''
          },
          tour: {
            id: tourData.tourId,
            name: tourData.tourName,
            code: '',
            destination: tourData.destination,
            date: tourData.date,
            pickupTime: tourData.pickupTime,
            pickupAddress: tourData.pickupAddress
          },
          tourId: '', // Will be updated after backend response
          tourStatus: 'pending',
          passengers: {
            adults: tourData.adultPax,
            children: tourData.childPax,
            infants: tourData.infantPax
          },
          pricing: {
            adultPrice: tourData.adultPrice,
            childPrice: tourData.childPrice,
            infantPrice: tourData.infantPrice,
            totalAmount: (tourData.adultPax * tourData.adultPrice) +
                        (tourData.childPax * tourData.childPrice) +
                        (tourData.infantPax * tourData.infantPrice),
            currency: reservation?.pricing.currency || 'CLP'
          },
          salesperson: reservation?.salesperson || 'Unknown',
          email: reservation?.email || '',
          phone: reservation?.phone || '',
          operator: tourData.operator !== 'own-operation' ? tourData.operator : undefined,
          guide: undefined,
          driver: undefined,
          externalAgency: undefined,
          purchaseOrderNumber: undefined,
          notes: tourData.comments || '',
          paymentDetails: reservation?.paymentDetails,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Immediately add to local state for instant visual feedback
        const cachedReservations = queryClient.getQueryData<any[]>(reservationKeys.lists()) || []
        const updatedReservations = [...cachedReservations, optimisticReservation]
        queryClient.setQueryData(reservationKeys.lists(), updatedReservations)

        // Update local state to show the new tour immediately
        loadReservationDataFromCache()

        toast({
          title: 'Tour Added',
          description: 'New tour has been added to the reservation',
        })

        // Close modal immediately for better UX
        setIsTourModalOpen(false)

        // Now send to backend in the background
        try {
          const response = await apiCall(`/api/reservations/booking/${bookingId}/add-tour/`, {
            method: 'POST',
            body: JSON.stringify({
              tourId: tourData.tourId,
              destinationId: tourData.destinationId,
              date: tourData.date.toISOString(),
              pickupAddress: tourData.pickupAddress,
              pickupTime: tourData.pickupTime,
              adultPax: tourData.adultPax,
              adultPrice: tourData.adultPrice,
              childPax: tourData.childPax,
              childPrice: tourData.childPrice,
              infantPax: tourData.infantPax,
              infantPrice: tourData.infantPrice,
              comments: tourData.comments,
              operator: tourData.operator,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to add tour')
          }

          // Backend succeeded, invalidate cache to get real data
          await queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
          loadReservationDataFromCache()
        } catch (error) {
          // Backend failed, revert optimistic update
          queryClient.setQueryData(reservationKeys.lists(), cachedReservations)
          loadReservationDataFromCache()

          toast({
            title: 'Error',
            description: 'Failed to save tour to server. The tour has been removed.',
            variant: 'destructive',
          })
          throw error
        }
      }
    } catch (error) {
      // Only show error toast if it's not from the background save (which has its own error handling)
      if (tourModalMode === 'edit') {
        toast({
          title: 'Error',
          description: 'Failed to update tour',
          variant: 'destructive',
        })
      }
      console.error('Error saving tour:', error)
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
  }

  const handleShare = () => {
    if (!reservation) return
    const link = window.location.href
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link Copied',
      description: 'Reservation link copied to clipboard',
    })
  }

  const handleOpenCustomerDialog = () => {
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
    }
  }

  // State for totalPrice in Add Payment dialog
  const [totalPrice, setTotalPrice] = useState(0)

  const handleAddPayment = () => {
    // Clear/reset payment fields for new payment
    setPaymentDate(new Date())
    setPaymentMethod('credit-card')
    setPaymentPercentage(0)
    setAmountPaid(0)
    setTotalPrice(0)
    setPaymentStatus('pending')
    setReceiptFile(null)

    // Open the Add Payment dialog
    setIsAddPaymentDialogOpen(true)
  }

  const handleEditPayment = () => {
    // Load existing payment data if available
    if (reservation?.paymentDetails) {
      const paymentDetails = reservation.paymentDetails

      // Set payment date
      if (paymentDetails.date) {
        setPaymentDate(new Date(paymentDetails.date))
      }

      // Set payment method
      if (paymentDetails.method) {
        setPaymentMethod(paymentDetails.method)
      }

      // Set payment percentage
      if (paymentDetails.percentage !== undefined) {
        setPaymentPercentage(paymentDetails.percentage)
      }

      // Set amount paid
      if (paymentDetails.amountPaid !== undefined) {
        setAmountPaid(paymentDetails.amountPaid)
      }

      // Set payment status
      if (paymentDetails.status) {
        setPaymentStatus(paymentDetails.status)
      }
    }

    // Open the Edit Payment dialog
    setIsEditPaymentDialogOpen(true)
  }

  const handleSaveEditPayment = async () => {
    if (!reservation) return

    // Extract the base booking ID by removing any "-tour-X" suffix
    const bookingId = reservationId?.replace(/-tour-\d+$/, '') || reservationId

    try {
      // Prepare payment data for backend
      const paymentData = {
        bookingOptions: {
          copyComments: reservation.paymentDetails?.copyComments || false,
          includePayment: reservation.paymentDetails?.includePayment || true,
          quoteComments: reservation.paymentDetails?.quoteComments || '',
          sendPurchaseOrder: reservation.paymentDetails?.sendPurchaseOrder || false,
          sendQuotationAccess: reservation.paymentDetails?.sendQuotationAccess || false
        },
        customer: {
          email: reservation.client.email,
          name: reservation.client.name,
          phone: reservation.client.phone
        },
        paymentDetails: {
          date: paymentDate?.toISOString() || new Date().toISOString(),
          method: paymentMethod,
          percentage: paymentPercentage,
          amountPaid: amountPaid,
          comments: '', // Add comments field if needed
          status: paymentStatus,
          receiptFile: receiptFile || null
        }
      }

      // Send PUT request to update existing payment
      const response = await apiCall(`/api/reservations/booking/payment/${bookingId}/`, {
        method: 'PUT',
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error('Failed to update payment')
      }

      // Close dialog
      setIsEditPaymentDialogOpen(false)

      // Invalidate cache to refresh data
      await queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      loadReservationDataFromCache()

      toast({
        title: 'Payment Updated',
        description: 'Payment details have been saved successfully',
      })
    } catch (error) {
      console.error('Error updating payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to update payment details',
        variant: 'destructive',
      })
    }
  }

  const handleSaveAddPayment = async () => {
    if (!reservation) return

    // Extract the base booking ID by removing any "-tour-X" suffix
    const bookingId = reservationId?.replace(/-tour-\d+$/, '') || reservationId

    try {
      // Prepare payment data for backend
      const paymentData = {
        bookingOptions: {
          copyComments: false,
          includePayment: true,
          quoteComments: '',
          sendPurchaseOrder: false,
          sendQuotationAccess: false
        },
        customer: {
          email: reservation.client.email,
          name: reservation.client.name,
          phone: reservation.client.phone
        },
        paymentDetails: {
          date: paymentDate?.toISOString() || new Date().toISOString(),
          method: paymentMethod,
          percentage: paymentPercentage,
          amountPaid: amountPaid,
          comments: '', // Add comments field if needed
          status: paymentStatus,
          receiptFile: receiptFile || null
        }
      }

      // Send POST request to create new payment
      const response = await apiCall(`/api/reservations/booking/payment/`, {
        method: 'POST',
        body: JSON.stringify({
          ...paymentData,
          bookingId: bookingId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add payment')
      }

      // Close dialog
      setIsAddPaymentDialogOpen(false)

      // Invalidate cache to refresh data
      await queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
      loadReservationDataFromCache()

      toast({
        title: 'Payment Added',
        description: 'Payment has been added successfully',
      })
    } catch (error) {
      console.error('Error adding payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add payment',
        variant: 'destructive',
      })
    }
  }

  const handleTermsConditions = () => {
    toast({
      title: 'Terms and Conditions',
      description: 'Terms and conditions not yet accepted',
      variant: 'destructive'
    })
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
        {/* Header */}
        <ReservationHeader
          reservationNumber={reservation.reservationNumber}
          onBack={() => navigate('/all-reservations')}
        />

        {/* Action Buttons */}
        <ActionButtons
          onOpenCustomerDialog={handleOpenCustomerDialog}
          onTermsConditions={handleTermsConditions}
          onShare={handleShare}
          onSendEmail={handleSendEmail}
          onPrint={handlePrint}
        />

        <div className="space-y-6">
          {/* Purchase Order Header */}
          <PurchaseOrderCard reservation={reservation} />

          {/* Reservations Table */}
          <ReservationsTable
            reservation={reservation}
            allToursForBooking={allToursForBooking}
            onEditTour={handleEditTour}
            onAddTour={handleAddTour}
            onReservationAction={handleReservationAction}
          />

          {/* Payments Section */}
          <PaymentsSection
            reservation={reservation}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
          />
        </div>

        {/* Cancel Reservation Dialog */}
        <CancelReservationDialog
          isOpen={isCancelModalOpen}
          onOpenChange={setIsCancelModalOpen}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelFee={cancelFee}
          setCancelFee={setCancelFee}
          cancelObservation={cancelObservation}
          setCancelObservation={setCancelObservation}
          onConfirm={handleConfirmCancellation}
        />

        {/* Add Payment Dialog */}
        <AddPaymentDialog
          isOpen={isAddPaymentDialogOpen}
          onOpenChange={setIsAddPaymentDialogOpen}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentPercentage={paymentPercentage}
          setPaymentPercentage={setPaymentPercentage}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          receiptFile={receiptFile}
          setReceiptFile={setReceiptFile}
          currency={reservation.pricing.currency}
          onSave={handleSaveAddPayment}
        />

        {/* Edit Payment Dialog */}
        <EditPaymentDialog
          isOpen={isEditPaymentDialogOpen}
          onOpenChange={setIsEditPaymentDialogOpen}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentPercentage={paymentPercentage}
          setPaymentPercentage={setPaymentPercentage}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          receiptFile={receiptFile}
          setReceiptFile={setReceiptFile}
          currency={reservation.pricing.currency}
          totalAmount={calculateGrandTotal(reservation)}
          onSave={handleSaveEditPayment}
        />

        {/* Edit Customer Dialog */}
        <EditCustomerDialog
          isOpen={isEditCustomerOpen}
          onOpenChange={setIsEditCustomerOpen}
          customer={customerToEdit}
          onSubmit={handleSaveCustomer}
          isPending={updateCustomerMutation.isPending}
        />

        {/* Tour Add/Edit Modal */}
        <TourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
          mode={tourModalMode}
          tourData={editingTour}
          destinations={destinations}
          currency={reservation?.pricing.currency || 'CLP'}
          onSave={handleSaveTour}
        />
      </div>
    </div>
  )
}

export default ReservationEditPage
