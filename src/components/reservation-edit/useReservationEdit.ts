import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { reservationKeys } from '@/hooks/useReservations'
import { useToast } from '@/components/ui/use-toast'
import { Reservation } from '@/types/reservation'
import { reservationService } from '@/services/reservationService'
import { Payment, TourModalState } from './types'

// Interface for destination data from API
interface Destination {
  id: string
  name: string
  tours: Tour[]
}

interface Tour {
  id: string
  name: string
  adult_price: string
  child_price: string
  currency: string
  departure_time: string
}

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

  // Get destinations from sessionStorage (populated by getAllReservations API call)
  const destinations = useMemo<Destination[]>(() => {
    try {
      const filterDataString = sessionStorage.getItem('reservationFilterData')
      if (!filterDataString) {
        console.warn('No reservationFilterData found in sessionStorage')
        return []
      }

      const filterData = JSON.parse(filterDataString)
      const tours = filterData.tours || []

      console.log('Loading destinations from sessionStorage, found tours:', tours.length)

      // Group tours by destination
      const destinationMap = new Map<string, Destination>()

      tours.forEach((tour: any) => {
        const destinationId = tour.destination?.id || tour.destination_id
        const destinationName = tour.destination?.name || tour.destination_name || 'Unknown'

        if (!destinationMap.has(destinationId)) {
          destinationMap.set(destinationId, {
            id: destinationId,
            name: destinationName,
            tours: []
          })
        }

        const destination = destinationMap.get(destinationId)!
        destination.tours.push({
          id: tour.id,
          name: tour.name,
          adult_price: tour.adult_price || '0',
          child_price: tour.child_price || '0',
          currency: tour.currency || 'CLP',
          departure_time: tour.departure_time || ''
        })

        // Debug log for first few tours
        if (destination.tours.length <= 3) {
          console.log('Tour added to destination:', {
            tourId: tour.id,
            tourName: tour.name,
            adultPrice: tour.adult_price,
            childPrice: tour.child_price
          })
        }
      })

      const result = Array.from(destinationMap.values()).sort((a, b) => a.name.localeCompare(b.name))
      console.log('Loaded destinations for TourModal:', result.length, 'destinations')
      return result
    } catch (error) {
      console.error('Error loading destinations from sessionStorage:', error)
      return []
    }
  }, [])

  useEffect(() => {
    loadReservationDataFromCache()
  }, [reservationId])

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
