import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowLeft, Save } from 'lucide-react'
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
  useReservationEdit,
  calculateGrandTotal
} from '@/components/reservation-edit'

const ReservationEditPage = () => {
  const queryClient = useQueryClient()
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

        // Invalidate the reservations cache to force a refetch
        await queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })

        toast({
          title: 'Tour Added',
          description: 'New tour has been added to the reservation',
        })

        // Reload reservation data from the freshly invalidated cache
        loadReservationDataFromCache()
      }

      setIsTourModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: tourModalMode === 'edit' ? 'Failed to update tour' : 'Failed to add tour',
        variant: 'destructive',
      })
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

  const handleSavePayment = () => {
    setIsPaymentDialogOpen(false)
    toast({
      title: 'Payment Updated',
      description: 'Payment details have been saved successfully',
    })
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
        {/* Header with Save Button */}
        <ReservationHeader
          reservationNumber={reservation.reservationNumber}
          onBack={() => navigate('/all-reservations')}
          onSave={handleSave}
          saving={saving}
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
            onOpenPaymentDialog={() => setIsPaymentDialogOpen(true)}
          />
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

        {/* Edit Payment Dialog */}
        <EditPaymentDialog
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
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
          onSave={handleSavePayment}
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
