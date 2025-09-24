import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { useQueryClient } from "@tanstack/react-query"
import Swal from 'sweetalert2'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Trash2,
  Edit2,
  Plus,
  MapPin,
  Building
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { tourCatalogService } from "@/services/tourCatalogService"
import { useCreateBooking, useCreateBookingPayment } from "@/hooks/useBookings"
import { apiCall } from "@/config/api"
import { Tour, TourBooking } from "@/types/tour"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const BookQuotePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const createBookingMutation = useCreateBooking()
  const createBookingPaymentMutation = useCreateBookingPayment()
  const [availableTours, setAvailableTours] = useState<Tour[]>([])
  const [selectedDestination, setSelectedDestination] = useState("")
  const [destinations, setDestinations] = useState<string[]>([])
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

  useEffect(() => {
    loadTourData()
    loadDestinationsSettings()
  }, [])

  useEffect(() => {
    if (selectedDestination) {
      loadToursByDestination(selectedDestination)
    }
  }, [selectedDestination])

  const loadTourData = async () => {
    const tours = await tourCatalogService.getAllTours()
    const dests = await tourCatalogService.getDestinations()
    setAvailableTours(tours)
    setDestinations(dests)
  }

  const loadToursByDestination = async (destination: string) => {
    const tours = await tourCatalogService.getToursByDestination(destination)
    setAvailableTours(tours)
  }

  const loadDestinationsSettings = async () => {
    try {
      const response = await apiCall('/api/settings/destinations/', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Destinations settings loaded:', data)
    } catch (error) {
      console.error('Error loading destinations settings:', error)
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
    const tour = await tourCatalogService.getTourById(tourId)
    if (tour) {
      const currency = formData.currency || tour.basePricing.currency
      let adultPrice = tour.basePricing.adultPrice
      let childPrice = tour.basePricing.childPrice
      let infantPrice = tour.basePricing.infantPrice

      // Convert prices if currencies don't match
      if (currency !== tour.basePricing.currency) {
        // Simple conversion for demo (in real app, use actual exchange rates)
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

  const calculateSubtotal = (tour: typeof currentTour) => {
    const adultTotal = (tour.adultPax || 0) * (tour.adultPrice || 0)
    const childTotal = (tour.childPax || 0) * (tour.childPrice || 0)
    const infantTotal = (tour.infantPax || 0) * (tour.infantPrice || 0)
    return adultTotal + childTotal + infantTotal
  }

  const calculateGrandTotal = () => {
    return tourBookings.reduce((total, tour) => total + tour.subtotal, 0)
  }

  // Generate a unique shareable link
  const generateShareableLink = () => {
    const timestamp = Date.now().toString()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `${timestamp}-${randomString}`
  }

  const createBookingData = (bookings: TourBooking[]) => {
    const shareableLink = generateShareableLink()

    return {
      customer: {
        name: formData.name || t('quotes.guest'),
        email: formData.email || "noemail@example.com",
        phone: formData.phone || "",
        language: formData.language || "en",
        country: formData.countryOfOrigin || "",
        idNumber: formData.idPassport || "",
        cpf: formData.cpf || "",
        address: formData.address || ""
      },
      tours: bookings,
      tourDetails: {
        destination: bookings[0]?.tourName || "",
        tourType: bookings[0]?.tourCode || "",
        startDate: bookings[0]?.date || new Date(),
        endDate: bookings[bookings.length - 1]?.date || new Date(),
        passengers: bookings.reduce((total, tour) => total + tour.adultPax + tour.childPax + tour.infantPax, 0),
        passengerBreakdown: {
          adults: bookings.reduce((total, tour) => total + tour.adultPax, 0),
          children: bookings.reduce((total, tour) => total + tour.childPax, 0),
          infants: bookings.reduce((total, tour) => total + tour.infantPax, 0)
        },
        hotel: formData.defaultHotel || "",
        room: formData.defaultRoom || ""
      },
      pricing: {
        amount: bookings.reduce((total, tour) => total + tour.subtotal, 0),
        currency: formData.currency || "CLP",
        breakdown: bookings.map(tour => {
          const items = []
          if (tour.adultPax > 0) {
            items.push({
              item: `${tour.tourName} - Adults`,
              quantity: tour.adultPax,
              unitPrice: tour.adultPrice,
              total: tour.adultPax * tour.adultPrice
            })
          }
          if (tour.childPax > 0) {
            items.push({
              item: `${tour.tourName} - Children`,
              quantity: tour.childPax,
              unitPrice: tour.childPrice,
              total: tour.childPax * tour.childPrice
            })
          }
          if (tour.infantPax > 0) {
            items.push({
              item: `${tour.tourName} - Infants`,
              quantity: tour.infantPax,
              unitPrice: tour.infantPrice,
              total: tour.infantPax * tour.infantPrice
            })
          }
          return items
        }).flat()
      },
      leadSource: formData.origin || "website",
      assignedTo: formData.salesperson || "Thiago Andrade",
      agency: undefined,
      status: "confirmed",
      validUntil: validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      additionalNotes: formData.accommodationComments,
      termsAccepted: {
        accepted: false
      },
      // Include booking configuration options
      quotationComments,
      includePayment,
      copyComments,
      sendPurchaseOrder,
      sendQuotationAccess,
      shareableLink: shareableLink, // Include the generated shareable link
      // Include payment details if payment is included
      paymentDetails: includePayment ? {
        date: paymentDate,
        method: paymentMethod,
        percentage: paymentPercentage,
        amountPaid,
        comments: paymentComments,
        status: paymentStatus,
        receiptFile
      } : undefined
    }
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

    const tour = await tourCatalogService.getTourById(currentTour.tourId)
    if (!tour) return

    const newTourBooking: TourBooking = {
      id: editingTourId || Date.now().toString(),
      tourId: currentTour.tourId,
      tourName: tour.name,
      tourCode: tour.code,
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

    // Create booking data with all form information using helper function
    const bookingData = createBookingData(tourBookings)

    // Store the generated shareableLink for fallback
    const generatedShareableLink = bookingData.shareableLink

    // Send data to booking API endpoint using React Query
    createBookingMutation.mutate(bookingData, {
      onSuccess: (newBooking) => {
        // Use the shareable link from the booking response, or fallback to the one we generated
        const shareableLink = newBooking.shareableLink || generatedShareableLink || generateShareableLink();

        console.log('ShareableLink debug:', {
          fromResponse: newBooking.shareableLink,
          generated: generatedShareableLink,
          final: shareableLink
        });

        // Store the successful API response in React Query cache for SharedQuotePage
        queryClient.setQueryData(['shared-quote', shareableLink], newBooking);

        console.log('Quote data stored in cache after API success:', {
          shareableLink,
          cacheKey: ['shared-quote', shareableLink],
          data: newBooking
        });

        Swal.fire({
          title: 'Success!',
          text: 'Quote created successfully',
          icon: 'success',
          confirmButtonText: 'View Quote',
          confirmButtonColor: '#10b981'
        }).then(() => {
          // Redirect to the customer-facing quote view
          navigate(`/quotes/share/${shareableLink}`)
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
    const fullBookingData = createBookingData(tourBookings)

    // Prepare payment data to send to the backend for booking conversion
    const paymentData = {
      customer: {
        name: formData.name || t('quotes.guest'),
        email: formData.email || "noemail@example.com",
        phone: formData.phone || "",
      },
      tours: tourBookings,
      tourDetails: fullBookingData.tourDetails,
      pricing: fullBookingData.pricing,
      paymentDetails: {
        date: paymentDate,
        method: paymentMethod,
        percentage: paymentPercentage,
        amountPaid: amountPaid,
        comments: paymentComments,
        status: paymentStatus,
        receiptFile: receiptFile
      },
      bookingOptions: {
        includePayment,
        copyComments,
        sendPurchaseOrder,
        quotationComments,
        sendQuotationAccess
      }
    }

    // Send payment data to the backend to convert quotation to confirmed reservation
    createBookingPaymentMutation.mutate(paymentData, {
      onSuccess: (response) => {
        console.log('Booking conversion successful:', response)

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
            navigate('/reservations/all')
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('quotes.configTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salesperson">{t('quotes.salesperson')}</Label>
                <Select value={formData.salesperson} onValueChange={(value) => handleInputChange("salesperson", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectSalesperson')} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">{t('quotes.internalTeam')}</div>
                    <SelectItem value="thiago">Thiago Andrade</SelectItem>
                    <SelectItem value="ana">Ana Martinez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Travel Plus</div>
                    <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">World Tours</div>
                    <SelectItem value="ana-silva">Ana Silva</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Adventure Agency</div>
                    <SelectItem value="sofia">Sofia Gonzalez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Sunset Travel</div>
                    <SelectItem value="juan">Juan Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">{t('quotes.currency')}</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.chileanPesos')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">{t('quotes.chileanPesos')}</SelectItem>
                    <SelectItem value="USD">{t('quotes.usDollars')}</SelectItem>
                    <SelectItem value="EUR">{t('quotes.euros')}</SelectItem>
                    <SelectItem value="BRL">{t('quotes.brazilianReais')}</SelectItem>
                    <SelectItem value="ARS">{t('quotes.argentinePesos')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">{t('quotes.origin')}</Label>
                <Select value={formData.origin} onValueChange={(value) => handleInputChange("origin", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectOrigin')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">{t('quotes.instagram')}</SelectItem>
                    <SelectItem value="youtube">{t('quotes.youtube')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('quotes.clientInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('quotes.fullName')}</Label>
                <Input
                  id="name"
                  placeholder={t('quotes.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="idPassport">{t('quotes.idPassport')}</Label>
                <Input
                  id="idPassport"
                  placeholder={t('quotes.idPassportPlaceholder')}
                  value={formData.idPassport}
                  onChange={(e) => handleInputChange("idPassport", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">{t('quotes.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('quotes.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('quotes.phone')}</Label>
                <Input
                  id="phone"
                  placeholder={t('quotes.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="language">{t('quotes.language')}</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t('quotes.spanish')}</SelectItem>
                    <SelectItem value="en">{t('quotes.english')}</SelectItem>
                    <SelectItem value="pt">{t('quotes.portuguese')}</SelectItem>
                    <SelectItem value="fr">{t('quotes.french')}</SelectItem>
                    <SelectItem value="de">{t('quotes.german')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countryOfOrigin">{t('quotes.countryOfOrigin')}</Label>
                <Input
                  id="countryOfOrigin"
                  placeholder={t('quotes.countryPlaceholder')}
                  value={formData.countryOfOrigin}
                  onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cpf">{t('quotes.cpf')}</Label>
                <Input
                  id="cpf"
                  placeholder=""
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">{t('quotes.address')}</Label>
              <Input
                id="address"
                placeholder={t('quotes.addressPlaceholder')}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultHotel">{t('quotes.defaultHotel')}</Label>
                  <Input
                    id="defaultHotel"
                    placeholder={t('quotes.hotelPlaceholder')}
                    value={formData.defaultHotel}
                    onChange={(e) => handleInputChange("defaultHotel", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="defaultRoom">{t('quotes.roomNumber')}</Label>
                  <Input
                    id="defaultRoom"
                    placeholder={t('quotes.roomPlaceholder')}
                    value={formData.defaultRoom}
                    onChange={(e) => handleInputChange("defaultRoom", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accommodationComments">{t('quotes.accommodationComments')}</Label>
                <Textarea
                  id="accommodationComments"
                  rows={3}
                  placeholder={t('quotes.accommodationPlaceholder')}
                  value={formData.accommodationComments}
                  onChange={(e) => handleInputChange("accommodationComments", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('quotes.addTourBooking')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>{t('quotes.destination')}</Label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectDestination')} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map(dest => (
                      <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('quotes.tour')}</Label>
                <Select 
                  value={currentTour.tourId} 
                  onValueChange={handleTourSelection}
                  disabled={!selectedDestination}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectTour')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTours.map(tour => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.name} ({tour.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('quotes.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !currentTour.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentTour.date ? format(currentTour.date, "dd/MM/yyyy") : t('quotes.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentTour.date}
                      onSelect={(date) => handleTourFieldChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{t('quotes.operator')}</Label>
                <Select 
                  value={currentTour.operator} 
                  onValueChange={(value) => handleTourFieldChange("operator", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('quotes.selectOperator')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="own-operation">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {t('quotes.ownOperation')}
                      </div>
                    </SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('quotes.pickupAddress')}
                </Label>
                <Input
                  placeholder={t('quotes.pickupPlaceholder')}
                  value={currentTour.pickupAddress}
                  onChange={(e) => handleTourFieldChange("pickupAddress", e.target.value)}
                  className="border-blue-300"
                />
              </div>

              <div>
                <Label>{t('quotes.pickupTime')}</Label>
                <Input
                  type="time"
                  value={currentTour.pickupTime}
                  onChange={(e) => handleTourFieldChange("pickupTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label>{t('quotes.adultsPax')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.adultPax}
                  onChange={(e) => handleTourFieldChange("adultPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>{t('quotes.adultPrice')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.adultPrice}
                  onChange={(e) => handleTourFieldChange("adultPrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>{t('quotes.childrenPax')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.childPax}
                  onChange={(e) => handleTourFieldChange("childPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>{t('quotes.childPrice')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.childPrice}
                  onChange={(e) => handleTourFieldChange("childPrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>{t('quotes.infantsPax')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.infantPax}
                  onChange={(e) => handleTourFieldChange("infantPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>{t('quotes.infantPrice')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.infantPrice}
                  onChange={(e) => handleTourFieldChange("infantPrice", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label>{t('quotes.tourComments')}</Label>
              <Textarea
                rows={2}
                placeholder={t('quotes.tourCommentsPlaceholder')}
                value={currentTour.comments}
                onChange={(e) => handleTourFieldChange("comments", e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                Subtotal: {getCurrencySymbol(formData.currency)} {calculateSubtotal(currentTour).toLocaleString()}
              </div>
              <Button 
                type="button"
                onClick={addTour}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingTourId ? t('quotes.updateTour') : t('quotes.addTour')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('quotes.tourBookingsList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">{t('quotes.operationDate')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.pickupTime')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.tour')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.operator')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.adultPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.adultPrice')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.childPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.childPrice')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.infantPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.infantPrice')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.subTotal')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tourBookings.length > 0 ? tourBookings.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell>{format(tour.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{tour.pickupTime || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tour.tourName}</div>
                          {tour.pickupAddress && (
                            <div className="text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {tour.pickupAddress}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {tour.operator === "own-operation" && <Building className="w-3 h-3" />}
                          <span className="text-sm">
                            {tour.operator === "own-operation" ? t('quotes.ownOperation') : tour.operator}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{tour.adultPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.adultPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{tour.childPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.childPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{tour.infantPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.infantPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {getCurrencySymbol(formData.currency)} {tour.subtotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editTour(tour)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTour(tour.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                        {t('quotes.noBookingsAdded')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout - Visible only on mobile and tablets */}
            <div className="lg:hidden space-y-4">
              {tourBookings.length > 0 ? tourBookings.map((tour) => (
                <Card key={tour.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-base">{tour.tourName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(tour.date, "dd/MM/yyyy")}
                          {tour.pickupTime && ` • ${tour.pickupTime}`}
                        </div>
                        {tour.pickupAddress && (
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {tour.pickupAddress}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editTour(tour)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTour(tour.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {tour.operator === "own-operation" && <Building className="w-3 h-3" />}
                        <span className="text-muted-foreground">{t('quotes.operator')}:</span>
                        <span>{tour.operator === "own-operation" ? t('quotes.ownOperation') : tour.operator}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">{t('quotes.adultPax')}</div>
                          <div className="font-medium">{tour.adultPax}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencySymbol(formData.currency)} {tour.adultPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('quotes.childPax')}</div>
                          <div className="font-medium">{tour.childPax}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencySymbol(formData.currency)} {tour.childPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">{t('quotes.infantPax')}</div>
                          <div className="font-medium">{tour.infantPax}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencySymbol(formData.currency)} {tour.infantPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t('quotes.subTotal')}:</span>
                          <span className="font-bold text-lg text-green-600">
                            {getCurrencySymbol(formData.currency)} {tour.subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  {t('quotes.noBookingsAdded')}
                </div>
              )}
            </div>

              {tourBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">{t('quotes.grandTotal')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {getCurrencySymbol(formData.currency)} {calculateGrandTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Payment Details Section - Only show when Include Payment is enabled */}
        {includePayment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">{t('quotes.paymentDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Payment Date */}
                <div>
                  <Label htmlFor="payment-date" className="text-sm font-medium">
                    {t('quotes.paymentDate')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !paymentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentDate ? format(paymentDate, "dd/MM/yyyy") : t('quotes.selectDate')}
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

                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method" className="text-sm font-medium">
                    {t('quotes.paymentMethod')}
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('quotes.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">{t('quotes.creditCard')}</SelectItem>
                      <SelectItem value="bank-transfer">{t('quotes.bankTransfer')}</SelectItem>
                      <SelectItem value="cash-office">{t('quotes.cashOffice')}</SelectItem>
                      <SelectItem value="mercado-pago">{t('quotes.mercadoPago')}</SelectItem>
                      <SelectItem value="van-is-broken">{t('quotes.vanIsBroken')}</SelectItem>
                      <SelectItem value="pix">{t('quotes.pix')}</SelectItem>
                      <SelectItem value="test">{t('quotes.test')}</SelectItem>
                      <SelectItem value="transfer">{t('quotes.transfer')}</SelectItem>
                      <SelectItem value="nubank-transfer">{t('quotes.nubankTransfer')}</SelectItem>
                      <SelectItem value="wise">{t('quotes.wise')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Price */}
                <div>
                  <Label className="text-sm font-medium">{t('quotes.totalPrice')} {getCurrencySymbol(formData.currency)}</Label>
                  <div className="mt-1 p-2 bg-green-100 border rounded-md">
                    <span className="font-semibold">{calculateGrandTotal().toLocaleString()}</span>
                  </div>
                </div>

                {/* Percentage */}
                <div>
                  <Label htmlFor="payment-percentage" className="text-sm font-medium">{t('quotes.percentage')}</Label>
                  <Input
                    id="payment-percentage"
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
                    className="mt-1"
                  />
                </div>

                {/* Amount Paid */}
                <div>
                  <Label htmlFor="amount-paid" className="text-sm font-medium">
                    {t('quotes.amountPaid')} {getCurrencySymbol(formData.currency)}
                  </Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    min="0"
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
                    className="mt-1"
                  />
                </div>

                {/* Amount Pending */}
                <div>
                  <Label className="text-sm font-medium">{t('quotes.amountPending')} {getCurrencySymbol(formData.currency)}</Label>
                  <div className="mt-1 p-2 bg-gray-100 border rounded-md">
                    <span className="font-semibold text-red-600">
                      {(calculateGrandTotal() - amountPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Receipt Upload */}
                <div>
                  <Label htmlFor="receipt-upload" className="text-sm font-medium">{t('quotes.receipt')}</Label>
                  <div className="mt-1">
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
                    />
                    {!receiptFile && (
                      <span className="text-xs text-gray-500">{t('quotes.noFileChosen')}</span>
                    )}
                  </div>
                </div>

                {/* Payment Comments */}
                <div>
                  <Label htmlFor="payment-comments" className="text-sm font-medium">{t('quotes.commentsOnPayment')}</Label>
                  <Textarea
                    id="payment-comments"
                    rows={3}
                    className="mt-1"
                    placeholder={t('quotes.paymentCommentsPlaceholder')}
                    value={paymentComments}
                    onChange={(e) => setPaymentComments(e.target.value)}
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <Label htmlFor="payment-status" className="text-sm font-medium">
                    {t('quotes.paymentStatus')}
                  </Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('quotes.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('quotes.pending')}</SelectItem>
                      <SelectItem value="partial">{t('quotes.partial')}</SelectItem>
                      <SelectItem value="paid">{t('quotes.paid')}</SelectItem>
                      <SelectItem value="refunded">{t('quotes.refunded')}</SelectItem>
                      <SelectItem value="cancelled">{t('quotes.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Options Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-payment" className="text-base font-medium">
                    {t('quotes.includePayment')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include-payment"
                      checked={includePayment}
                      onCheckedChange={setIncludePayment}
                      className={includePayment ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {includePayment ? t('quotes.yes') : t('quotes.no')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="copy-comments" className="text-base font-medium">
                    {t('quotes.copyCommentsToOrder')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="copy-comments"
                      checked={copyComments}
                      onCheckedChange={setCopyComments}
                      className={copyComments ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {copyComments ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="send-purchase-order" className="text-base font-medium">
                      {t('quotes.sendPurchaseOrderAccess')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="send-purchase-order"
                        checked={sendPurchaseOrder}
                        onCheckedChange={setSendPurchaseOrder}
                        className={sendPurchaseOrder ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                      />
                      <span className="text-sm font-medium min-w-[30px]">
                        {sendPurchaseOrder ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-0">
                    {formData.email || "admin@teampulse.com"}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={tourBookings.length === 0 || createBookingPaymentMutation.isPending}
                    onClick={handleBookReservation}
                  >
                    {createBookingPaymentMutation.isPending ? "Processing..." : t('quotes.reserve')}
                  </Button>
                  
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${tourBookings.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${tourBookings.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className={`font-medium ${tourBookings.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                      {t('quotes.readyToBook')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="valid-until" className="text-base font-medium">
                      {t('quotes.validUntil')}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !validUntilDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {validUntilDate ? format(validUntilDate, "dd/MM/yyyy") : t('quotes.selectDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={validUntilDate}
                          onSelect={setValidUntilDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="quotation-comments" className="text-base font-medium">
                      {t('quotes.commentsOnQuotation')}
                    </Label>
                    <Textarea
                      id="quotation-comments"
                      rows={1}
                      className="mt-2 min-h-[40px] resize-none"
                      placeholder={t('quotes.quotationCommentsPlaceholder')}
                      value={quotationComments}
                      onChange={(e) => setQuotationComments(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="send-quotation-access" className="text-base font-medium">
                      {t('quotes.sendQuotationAccess')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="send-quotation-access"
                        checked={sendQuotationAccess}
                        onCheckedChange={setSendQuotationAccess}
                        className={sendQuotationAccess ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                      />
                      <span className="text-sm font-medium min-w-[30px]">
                        {sendQuotationAccess ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-0">
                    {formData.email || "admin@teampulse.com"}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={tourBookings.length === 0 || createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? 'Saving...' : t('quotes.saveQuotation')}
                  </Button>
                  
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${tourBookings.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${tourBookings.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className={`font-medium ${tourBookings.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                      {t('quotes.readyToQuote')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  )
}

export default BookQuotePage