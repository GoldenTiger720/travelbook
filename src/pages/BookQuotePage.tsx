import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { useQueryClient } from "@tanstack/react-query"
import Swal from 'sweetalert2'
import { tourCatalogService } from "@/services/tourCatalogService"
import { useCreateBooking, useCreateBookingPayment } from "@/hooks/useBookings"
import { apiCall } from "@/config/api"
import { Tour, TourBooking } from "@/types/tour"
import {
  createBookingData,
  validateBookingData,
  convertToBookingData,
  convertToPaymentData,
  generateShareableLink
} from "@/utils/bookingDataStructure"
import BookingConfiguration from "@/components/BookQuote/BookingConfiguration"
import CustomerInformation from "@/components/BookQuote/CustomerInformation"
import TourSelection from "@/components/BookQuote/TourSelection"
import PaymentDetails from "@/components/BookQuote/PaymentDetails"

// New interfaces for destinations API
interface DestinationTour {
  id: string
  name: string
  description: string
  adult_price: string
  child_price: string
  currency: string
  starting_point: string
  departure_time: string
  capacity: number
  active: boolean
  created_at: string
  updated_at: string
}

// Interface for users API
interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  commission: string
  status: string
}

interface UsersApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

interface Destination {
  id: string
  name: string
  country: string
  region: string
  language: string
  status: string
  created_at: string
  updated_at: string
  tours: DestinationTour[]
  tours_count: number
}

interface DestinationsApiResponse {
  success: boolean
  message: string
  data: Destination[]
  statistics: {
    total_destinations: number
    active_destinations: number
    total_tours: number
  }
  count: number
}


const BookQuotePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const createBookingMutation = useCreateBooking()
  const createBookingPaymentMutation = useCreateBookingPayment()
  const [availableTours, setAvailableTours] = useState<(DestinationTour | Tour)[]>([])
  const [selectedDestination, setSelectedDestination] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [apiDestinations, setApiDestinations] = useState<Destination[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [editingTourId, setEditingTourId] = useState<string | null>(null)
  
  // Booking options state
  const [includePayment, setIncludePayment] = useState(false)
  const [copyComments, setCopyComments] = useState(true)
  const [sendPurchaseOrder, setSendPurchaseOrder] = useState(true)
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  const [quotationComments, setQuotationComments] = useState("")
  const [sendQuotationAccess, setSendQuotationAccess] = useState(true)
  
  // Payment details state
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date())
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentPercentage, setPaymentPercentage] = useState(50)
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentComments, setPaymentComments] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  
  // Customer data
  const [formData, setFormData] = useState({
    salesperson: "",
    currency: "CLP",
    origin: "",
    name: "",
    idPassport: "",
    email: "",
    phone: "",
    language: "",
    countryOfOrigin: "",
    address: "",
    cpf: "",
    defaultHotel: "",
    defaultRoom: "",
    accommodationComments: ""
  })

  // Current tour being added/edited
  const [currentTour, setCurrentTour] = useState({
    tourId: "",
    date: undefined as Date | undefined,
    pickupAddress: "",
    pickupTime: "",
    adultPax: 1,
    adultPrice: 0,
    childPax: 0,
    childPrice: 0,
    infantPax: 0,
    infantPrice: 0,
    operator: "own-operation",
    comments: ""
  })

  // List of added tours
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([])

  // Track if quotation has been saved successfully
  const [isQuotationSaved, setIsQuotationSaved] = useState(false)

  // Filter users with salesperson role
  const salesPersons = users.filter(user => user.role === 'salesperson' && user.status === 'Active')

  useEffect(() => {
    loadDestinationsSettings()
    loadUsersData()
    // Note: Tours are loaded when a destination is selected via loadToursForSelectedDestination()
  }, [])

  useEffect(() => {
    if (selectedDestination) {
      loadToursForSelectedDestination(selectedDestination)
    }
  }, [selectedDestination])


  const loadToursForSelectedDestination = (destinationName: string) => {
    // Find the destination object by name in API data
    const selectedDest = apiDestinations.find(dest => dest.name === destinationName)

    if (selectedDest) {
      setAvailableTours(selectedDest.tours.filter(tour => tour.active))
    } else {
      console.warn(`Destination "${destinationName}" not found in API data. No tours available.`)
      setAvailableTours([])
    }
  }

  const loadDestinationsSettings = async () => {
    try {
      const response = await apiCall('/api/destinations/', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiResponse: DestinationsApiResponse = await response.json()

      if (apiResponse.success && apiResponse.data) {
        // Store the full destination data from API
        setApiDestinations(apiResponse.data)

        // Set destinations to the API data (Destination[] objects)
        setDestinations(apiResponse.data)

      }
    } catch (error) {
      console.error('Error loading destinations:', error)
    }
  }

  const loadUsersData = async () => {
    try {
      const response = await apiCall('/api/users/', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiResponse: UsersApiResponse = await response.json()

      if (apiResponse.results) {
        setUsers(apiResponse.results)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTourFieldChange = (field: string, value: any) => {
    setCurrentTour(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTourSelection = async (tourId: string) => {
    // First try to find tour in the available tours data
    const foundTour = availableTours.find(tour => tour.id === tourId)

    if (foundTour) {
      // Check if it's a DestinationTour (has adult_price property) or a Tour (has basePricing property)
      const isDestinationTour = 'adult_price' in foundTour

      if (isDestinationTour) {
        // Handle DestinationTour type
        const apiTour = foundTour as DestinationTour
        const currency = formData.currency || apiTour.currency
        let adultPrice = parseFloat(apiTour.adult_price)
        let childPrice = parseFloat(apiTour.child_price)
        let infantPrice = 0 // API doesn't seem to have infant price, default to 0

        // Convert prices if currencies don't match
        if (currency !== apiTour.currency) {
          const conversionRates: { [key: string]: { [key: string]: number } } = {
            'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
            'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
            'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
            'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
            'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
          }

          const rate = conversionRates[apiTour.currency]?.[currency] || 1
          adultPrice = Math.round(adultPrice * rate)
          childPrice = Math.round(childPrice * rate)
          infantPrice = Math.round(infantPrice * rate)
        }

        setCurrentTour(prev => ({
          ...prev,
          tourId,
          adultPrice,
          childPrice,
          infantPrice,
          pickupTime: prev.pickupTime || apiTour.departure_time || ""
        }))
      } else {
        // Handle Tour type
        const tour = foundTour as Tour
        const currency = formData.currency || tour.basePricing.currency
        let adultPrice = tour.basePricing.adultPrice
        let childPrice = tour.basePricing.childPrice
        let infantPrice = tour.basePricing.infantPrice

        // Convert prices if currencies don't match
        if (currency !== tour.basePricing.currency) {
          const conversionRates: { [key: string]: { [key: string]: number } } = {
            'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
            'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
            'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
            'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
            'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
          }

          const rate = conversionRates[tour.basePricing.currency]?.[currency] || 1
          adultPrice = Math.round(adultPrice * rate)
          childPrice = Math.round(childPrice * rate)
          infantPrice = Math.round(infantPrice * rate)
        }

        setCurrentTour(prev => ({
          ...prev,
          tourId,
          adultPrice,
          childPrice,
          infantPrice,
          pickupTime: prev.pickupTime || tour.defaultPickupTime || ""
        }))
      }
    } else {
      // Fallback to original service method
      const tour = await tourCatalogService.getTourById(tourId)
      if (tour) {
        const currency = formData.currency || tour.basePricing.currency
        let adultPrice = tour.basePricing.adultPrice
        let childPrice = tour.basePricing.childPrice
        let infantPrice = tour.basePricing.infantPrice

        // Convert prices if currencies don't match
        if (currency !== tour.basePricing.currency) {
          const conversionRates: { [key: string]: { [key: string]: number } } = {
            'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
            'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
            'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
            'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
            'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
          }

          const rate = conversionRates[tour.basePricing.currency]?.[currency] || 1
          adultPrice = Math.round(adultPrice * rate)
          childPrice = Math.round(childPrice * rate)
          infantPrice = Math.round(infantPrice * rate)
        }

        setCurrentTour(prev => ({
          ...prev,
          tourId,
          adultPrice,
          childPrice,
          infantPrice,
          pickupTime: prev.pickupTime || tour.defaultPickupTime || ""
        }))
      }
    }
  }

  const calculateSubtotal = (tour: typeof currentTour) => {
    const adultTotal = (tour.adultPax || 0) * (tour.adultPrice || 0)
    const childTotal = (tour.childPax || 0) * (tour.childPrice || 0)
    const infantTotal = (tour.infantPax || 0) * (tour.infantPrice || 0)
    return adultTotal + childTotal + infantTotal
  }

  const calculateGrandTotal = () => {
    return tourBookings.reduce((total, tour) => total + tour.subtotal, 0)
  }

  // Create structured booking data using utility function
  const createStructuredBookingData = (bookings: TourBooking[]) => {
    const paymentData = {
      validUntilDate,
      quotationComments,
      copyComments,
      sendPurchaseOrder,
      sendQuotationAccess,
      paymentDate,
      paymentMethod,
      paymentPercentage,
      amountPaid,
      paymentComments,
      paymentStatus,
      receiptFile
    }

    return createBookingData(
      formData,
      bookings,
      salesPersons,
      paymentData,
      includePayment,
      t
    )
  }

  const addTour = async () => {
    if (!currentTour.tourId || !currentTour.date) {
      Swal.fire({
        title: 'Validation Error',
        text: t('quotes.selectTourAndDate'),
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    // First try to find tour in availableTours array
    const foundTour = availableTours.find(tour => tour.id === currentTour.tourId)
    let tourName = ''
    let tourCode = ''

    if (foundTour) {
      // Check if it's a DestinationTour or Tour
      const isDestinationTour = 'adult_price' in foundTour

      if (isDestinationTour) {
        const destTour = foundTour as DestinationTour
        tourName = destTour.name
        tourCode = destTour.id // DestinationTour doesn't have a separate code, use id
      } else {
        const tour = foundTour as Tour
        tourName = tour.name
        tourCode = tour.code
      }
    } else {
      // Fallback to catalog service for backward compatibility
      const tour = await tourCatalogService.getTourById(currentTour.tourId)
      if (!tour) {
        return
      }
      tourName = tour.name
      tourCode = tour.code
    }

    // Find the selected destination to get its ID
    const selectedDest = apiDestinations.find(dest => dest.name === selectedDestination);
    const destinationId = selectedDest?.id;

    const newTourBooking: TourBooking = {
      id: editingTourId || Date.now().toString(),
      tourId: currentTour.tourId,
      tourName,
      tourCode,
      destination: selectedDestination,
      destinationId: destinationId,
      date: currentTour.date,
      pickupAddress: currentTour.pickupAddress || formData.defaultHotel,
      pickupTime: currentTour.pickupTime,
      adultPax: currentTour.adultPax || 0,
      adultPrice: currentTour.adultPrice || 0,
      childPax: currentTour.childPax || 0,
      childPrice: currentTour.childPrice || 0,
      infantPax: currentTour.infantPax || 0,
      infantPrice: currentTour.infantPrice || 0,
      subtotal: calculateSubtotal(currentTour),
      operator: currentTour.operator,
      comments: currentTour.comments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingTourId) {
      setTourBookings(tourBookings.map(t => t.id === editingTourId ? newTourBooking : t))
      setEditingTourId(null)
    } else {
      setTourBookings([...tourBookings, newTourBooking])
    }

    // Reset quotation saved state when tours are modified
    setIsQuotationSaved(false)

    // Reset form after adding/updating tour (no API call here)
    setCurrentTour({
      tourId: "",
      date: undefined,
      pickupAddress: "",
      pickupTime: "",
      adultPax: 1,
      adultPrice: 0,
      childPax: 0,
      childPrice: 0,
      infantPax: 0,
      infantPrice: 0,
      operator: "own-operation",
      comments: ""
    })
  }

  const editTour = (tour: TourBooking) => {
    setCurrentTour({
      tourId: tour.tourId,
      date: tour.date,
      pickupAddress: tour.pickupAddress || "",
      pickupTime: tour.pickupTime || "",
      adultPax: tour.adultPax,
      adultPrice: tour.adultPrice,
      childPax: tour.childPax,
      childPrice: tour.childPrice,
      infantPax: tour.infantPax,
      infantPrice: tour.infantPrice,
      operator: tour.operator || "own-operation",
      comments: tour.comments || ""
    })
    setEditingTourId(tour.id)
  }

  const deleteTour = (tourId: string) => {
    setTourBookings(prev => prev.filter(t => t.id !== tourId))
    // Reset quotation saved state when tours are deleted
    setIsQuotationSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (tourBookings.length === 0) {
      Swal.fire({
        title: 'Validation Error',
        text: t('quotes.addAtLeastOneTour'),
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    // Create structured booking data with validation
    const structuredBookingData = createStructuredBookingData(tourBookings)

    // Validate booking data before submission
    const validation = validateBookingData(structuredBookingData)
    if (!validation.isValid) {
      Swal.fire({
        title: 'Validation Error',
        html: validation.errors.join('<br>'),
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    // Convert to the format expected by the booking service
    const bookingData = convertToBookingData(structuredBookingData)

    // Store the shareableLink that was included in the booking data
    const generatedShareableLink = bookingData.shareableLink || generateShareableLink()

    // Send data to booking API endpoint using React Query
    createBookingMutation.mutate(bookingData, {
      onSuccess: (newBooking) => {
        // Use the shareable link from the booking response, or fallback to the one we sent in the request
        const shareableLink = newBooking.shareableLink || generatedShareableLink;

        // Store the successful API response in React Query cache for SharedQuotePage
        queryClient.setQueryData(['shared-quote', shareableLink], newBooking);

        // Mark quotation as saved successfully
        setIsQuotationSaved(true);

        Swal.fire({
          title: 'Success!',
          text: 'Quote created successfully',
          icon: 'success',
          confirmButtonText: 'View Quote',
          confirmButtonColor: '#10b981',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to the customer-facing quote view
            navigate(`/quotes/share/${shareableLink}`)
          }
          // If cancelled, stay on current page (no action needed)
        })
      },
      onError: (error: any) => {
        // Check if it's a duplicate key error
        const errorDetail = error?.response?.data?.error || '';
        const isDuplicateError = errorDetail.toLowerCase().includes('duplicate key') ||
                                errorDetail.toLowerCase().includes('booking_tours_pkey');

        // Set appropriate error message
        let errorMessage = 'Failed to create quote';
        if (isDuplicateError) {
          errorMessage = 'This quote has already been added. Please add a new quote.';
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        })
      }
    })
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$'
    }
    return symbols[currency] || currency + '$'
  }

  const handleBookReservation = async () => {
    if (tourBookings.length === 0) {
      Swal.fire({
        title: 'Validation Error',
        text: t('quotes.addAtLeastOneTour'),
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    // Create comprehensive booking data for conversion to confirmed reservation
    const fullBookingData = createStructuredBookingData(tourBookings)

    // Prepare payment data to send to the backend for booking conversion
    const paymentData = convertToPaymentData(fullBookingData)

    // Send payment data to the backend to convert quotation to confirmed reservation
    createBookingPaymentMutation.mutate(paymentData, {
      onSuccess: (response) => {

        // Show success message with details
        Swal.fire({
          title: '✅ Booking Confirmed!',
          html: `
            <div class="text-left">
              <p><strong>Reservation ID:</strong> ${response.data?.reservationId || 'Generated'}</p>
              ${response.data?.purchaseOrderId ? `<p><strong>Purchase Order:</strong> ${response.data.purchaseOrderId}</p>` : ''}
              ${response.data?.paymentId ? `<p><strong>Payment ID:</strong> ${response.data.paymentId}</p>` : ''}
              <p class="mt-3 text-sm text-gray-600">
                • Quotation converted to confirmed reservation<br/>
                • Record moved to "All Reservations"<br/>
                ${copyComments ? '• Comments copied to Purchase Order<br/>' : ''}
                ${includePayment ? '• Payment workflow activated in Financial<br/>' : ''}
                ${sendPurchaseOrder ? '• Purchase Order generated<br/>' : ''}
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View All Reservations',
          showCancelButton: true,
          cancelButtonText: 'Create New Quote',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            // Navigate to All Reservations page
            navigate('/all-reservations')
          } else {
            // Reset form for new quote
            setTourBookings([])
            setFormData({
              salesperson: "",
              currency: "CLP",
              origin: "",
              name: "",
              idPassport: "",
              email: "",
              phone: "",
              language: "",
              countryOfOrigin: "",
              address: "",
              cpf: "",
              defaultHotel: "",
              defaultRoom: "",
              accommodationComments: ""
            })
            setCurrentTour({
              tourId: "",
              date: undefined,
              pickupAddress: "",
              pickupTime: "",
              adultPax: 1,
              adultPrice: 0,
              childPax: 0,
              childPrice: 0,
              infantPax: 0,
              infantPrice: 0,
              operator: "own-operation",
              comments: ""
            })
            // Navigate to quotes page after resetting form
            navigate('/quotes')
          }
        })

        // Invalidate the bookings cache to refresh All Reservations data
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
      },
      onError: (error) => {
        console.error("Booking conversion error:", error)

        let errorMessage = 'Failed to convert quotation to reservation'
        if ((error as any)?.response?.data?.message) {
          errorMessage = (error as any).response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }

        Swal.fire({
          title: 'Booking Conversion Failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">{t('quotes.title')}</h1>
        <p className="text-muted-foreground">{t('quotes.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Configuration Section */}
        <BookingConfiguration
          formData={{
            salesperson: formData.salesperson,
            currency: formData.currency,
            origin: formData.origin
          }}
          users={users}
          onFieldChange={handleInputChange}
        />

        {/* Customer Information Section */}
        <CustomerInformation
          formData={{
            name: formData.name,
            idPassport: formData.idPassport,
            email: formData.email,
            phone: formData.phone,
            language: formData.language,
            countryOfOrigin: formData.countryOfOrigin,
            cpf: formData.cpf,
            address: formData.address,
            defaultHotel: formData.defaultHotel,
            defaultRoom: formData.defaultRoom,
            accommodationComments: formData.accommodationComments
          }}
          onFieldChange={handleInputChange}
        />

        {/* Tour Selection and Bookings List */}
        <TourSelection
          destinations={destinations}
          availableTours={availableTours}
          selectedDestination={selectedDestination}
          currentTour={currentTour}
          tourBookings={tourBookings}
          editingTourId={editingTourId}
          currency={formData.currency}
          defaultHotel={formData.defaultHotel}
          onDestinationChange={setSelectedDestination}
          onTourSelection={handleTourSelection}
          onTourFieldChange={handleTourFieldChange}
          onAddTour={addTour}
          onEditTour={editTour}
          onDeleteTour={deleteTour}
          getCurrencySymbol={getCurrencySymbol}
          calculateSubtotal={calculateSubtotal}
          calculateGrandTotal={calculateGrandTotal}
        />

        {/* Payment Details and Booking Options */}
        <PaymentDetails
          includePayment={includePayment}
          paymentDate={paymentDate}
          paymentMethod={paymentMethod}
          paymentPercentage={paymentPercentage}
          amountPaid={amountPaid}
          paymentComments={paymentComments}
          paymentStatus={paymentStatus}
          receiptFile={receiptFile}
          copyComments={copyComments}
          sendPurchaseOrder={sendPurchaseOrder}
          validUntilDate={validUntilDate}
          quotationComments={quotationComments}
          sendQuotationAccess={sendQuotationAccess}
          customerEmail={formData.email}
          tourBookings={tourBookings}
          currency={formData.currency}
          isQuotationSaved={isQuotationSaved}
          createBookingMutation={createBookingMutation}
          createBookingPaymentMutation={createBookingPaymentMutation}
          onPaymentDateChange={setPaymentDate}
          onPaymentMethodChange={setPaymentMethod}
          onPaymentPercentageChange={setPaymentPercentage}
          onAmountPaidChange={setAmountPaid}
          onPaymentCommentsChange={setPaymentComments}
          onPaymentStatusChange={setPaymentStatus}
          onReceiptFileChange={setReceiptFile}
          onCopyCommentsChange={setCopyComments}
          onSendPurchaseOrderChange={setSendPurchaseOrder}
          onValidUntilDateChange={setValidUntilDate}
          onQuotationCommentsChange={setQuotationComments}
          onSendQuotationAccessChange={setSendQuotationAccess}
          onIncludePaymentChange={setIncludePayment}
          onBookReservation={handleBookReservation}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

      </form>
    </div>
  )
}

export default BookQuotePage