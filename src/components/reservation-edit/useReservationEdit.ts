import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { reservationKeys } from '@/hooks/useReservations'
import { useToast } from '@/components/ui/use-toast'
import { Reservation } from '@/types/reservation'
import { reservationService } from '@/services/reservationService'
import { Payment, TourModalState } from './types'

export const useReservationEdit = () => {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Payment history state
  const [payments, setPayments] = useState<Payment[]>([])

  // Payment details state
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [paymentPercentage, setPaymentPercentage] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentComments, setPaymentComments] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  // Dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<any>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isTourModalOpen, setIsTourModalOpen] = useState(false)
  const [tourModalMode, setTourModalMode] = useState<'add' | 'edit'>('add')

  // Cancel modal state
  const [cancelReason, setCancelReason] = useState('')
  const [cancelFee, setCancelFee] = useState(0)
  const [cancelObservation, setCancelObservation] = useState('')

  // Tour modal state
  const [editingTour, setEditingTour] = useState<TourModalState | null>(null)
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    loadReservationDataFromCache()
    loadDestinations()
  }, [reservationId])

  const loadDestinations = async () => {
    try {
      const response = await fetch('/api/destinations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.data || [])
      }
    } catch (error) {
      console.error('Error loading destinations:', error)
    }
  }

  const loadReservationDataFromCache = () => {
    setLoading(true)
    try {
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

      toast({
        title: '✅ Reservation Updated',
        description: `Reservation ${updatedReservation.reservationNumber} has been saved successfully`,
      })

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

  return {
    reservation,
    setReservation,
    loading,
    saving,
    payments,
    setPayments,
    paymentDate,
    setPaymentDate,
    paymentMethod,
    setPaymentMethod,
    paymentPercentage,
    setPaymentPercentage,
    amountPaid,
    setAmountPaid,
    paymentComments,
    setPaymentComments,
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
    handleFieldChange,
    handleSave,
    navigate,
    toast,
    reservationId,
    loadReservationDataFromCache
  }
}
