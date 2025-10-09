import { TourBooking } from "@/types/tour"
import { BookingData } from "@/services/bookingService"

/**
 * Interface definitions for the booking data structure
 * This makes the request form data clear and easy to understand
 */

// Configuration section data (from "Booking or quotation configuration" section)
export interface BookingConfiguration {
  leadSource: string // Origin of the lead (website, instagram, youtube, etc.)
  assignedTo: string // Salesperson assigned to this booking
  agency: string | undefined // External agency (if applicable)
  status: string // Booking status (confirmed, pending, etc.)
  validUntil: Date // Date until when the quotation is valid
  quotationComments: string // Comments about the quotation
  copyComments: boolean // Whether to copy comments to purchase order
  sendPurchaseOrder: boolean // Whether to send purchase order access to customer
  sendQuotationAccess: boolean // Whether to send quotation access to customer
  shareableLink: string // Unique shareable link for the quote
  termsAccepted: {
    accepted: boolean // Whether terms were accepted
  }
}

// Customer section data (from "Customer Information" section)
export interface CustomerInformation {
  name: string // Full name of the customer
  email: string // Customer email address
  phone: string // Customer phone number
  language: string // Preferred language (en, es, pt, fr, de)
  country: string // Country of origin
  idNumber: string // ID/Passport number
  cpf: string // CPF (Brazilian tax ID)
  address: string // Customer address
  defaultHotel: string // Default hotel/accommodation
  defaultRoom: string // Room/unit number
  accommodationComments: string // Additional accommodation details
}

// Tour details for each tour in the booking
export interface TourDetails {
  id: string // Unique tour booking ID
  tourId: string // ID of the tour from catalog
  tourName: string // Name of the tour
  tourCode: string // Tour code/reference
  date: Date // Operation date
  pickupTime: string // Pickup time
  pickupAddress: string // Pickup address
  adultPax: number // Number of adult passengers
  childPax: number // Number of child passengers
  infantPax: number // Number of infant passengers
  adultPrice: number // Price per adult
  childPrice: number // Price per child
  infantPrice: number // Price per infant
  subtotal: number // Total price for this tour
  destination: string // Destination name
  passengers: number // Total number of passengers
  pricing: {
    amount: number // Total amount for this tour
    currency: string // Currency (CLP, USD, EUR, etc.)
    breakdown: Array<{
      item: string // Description of the item (e.g., "Tour Name - Adults")
      quantity: number // Quantity
      unitPrice: number // Price per unit
      total: number // Total for this line item
    }>
  }
}

// Payment section data (from "Payment details" section)
export interface PaymentInformation {
  date: Date | undefined // Payment date
  method: string // Payment method (credit-card, bank-transfer, etc.)
  percentage: number // Percentage of total amount paid
  amountPaid: number // Actual amount paid
  comments: string // Payment comments
  status: string // Payment status (pending, partial, paid, etc.)
  receiptFile: File | null // Receipt file upload
  totalAmount: number // Total booking amount
  currency: string // Payment currency
}

// Complete booking data structure organized by sections
export interface BookingDataStructure {
  configuration: BookingConfiguration[] // Configuration array (single item)
  customer: CustomerInformation[] // Customer array (single item)
  tour_list: TourDetails[] // Tours array (multiple items)
  payment: PaymentInformation[] // Payment array (single item if payment included)
}

/**
 * Utility function to create structured booking data
 * This organizes all form data into clear, logical sections for the backend API
 */
export const createBookingData = (
  formData: Record<string, any>,
  tourBookings: TourBooking[],
  salesPersons: Array<{ id: string; full_name: string }>,
  paymentData: Record<string, any>,
  includePayment: boolean,
  t: (key: string) => string
): BookingDataStructure => {
  // Generate a unique shareable link
  const generateShareableLink = () => {
    const timestamp = Date.now().toString()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `${timestamp}-${randomString}`
  }

  const shareableLink = generateShareableLink()

  return {
    // Configuration section - Contains booking/quotation setup
    configuration: [
      {
        leadSource: formData.origin || "website",
        assignedTo: formData.salesperson
          ? (salesPersons.find(sp => sp.id === formData.salesperson)?.full_name || formData.salesperson)
          : (salesPersons.length > 0 ? salesPersons[0].full_name : ""),
        agency: undefined, // Not implemented in current form
        status: "pending",
        validUntil: paymentData.validUntilDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quotationComments: paymentData.quotationComments || "",
        copyComments: paymentData.copyComments || false,
        sendPurchaseOrder: paymentData.sendPurchaseOrder || false,
        sendQuotationAccess: paymentData.sendQuotationAccess || false,
        shareableLink: shareableLink,
        termsAccepted: {
          accepted: false // Default to false, can be updated based on form
        }
      }
    ],

    // Customer section - Contains customer information
    customer: [
      {
        name: formData.name || t('quotes.guest'),
        email: formData.email || "noemail@example.com",
        phone: formData.phone || "",
        language: formData.language || "en",
        country: formData.countryOfOrigin || "",
        idNumber: formData.idPassport || "",
        cpf: formData.cpf || "",
        address: formData.address || "",
        defaultHotel: formData.defaultHotel || "",
        defaultRoom: formData.defaultRoom || "",
        accommodationComments: formData.accommodationComments || ""
      }
    ],

    // Tour list section - Contains all selected tours with detailed pricing
    tour_list: tourBookings.map(tour => ({
      id: tour.id,
      tourId: tour.tourId,
      tourName: tour.tourName,
      tourCode: tour.tourCode,
      date: tour.date,
      pickupTime: tour.pickupTime || "",
      pickupAddress: tour.pickupAddress || "",
      adultPax: tour.adultPax,
      childPax: tour.childPax,
      infantPax: tour.infantPax,
      adultPrice: tour.adultPrice,
      childPrice: tour.childPrice,
      infantPrice: tour.infantPrice,
      subtotal: tour.subtotal,
      destination: tour.destination || "",
      passengers: tour.adultPax + tour.childPax + tour.infantPax,
      pricing: {
        amount: tour.subtotal,
        currency: formData.currency || "CLP",
        breakdown: [
          // Add adult pricing if there are adult passengers
          ...(tour.adultPax > 0 ? [{
            item: `${tour.tourName} - Adults`,
            quantity: tour.adultPax,
            unitPrice: tour.adultPrice,
            total: tour.adultPax * tour.adultPrice
          }] : []),
          // Add child pricing if there are child passengers
          ...(tour.childPax > 0 ? [{
            item: `${tour.tourName} - Children`,
            quantity: tour.childPax,
            unitPrice: tour.childPrice,
            total: tour.childPax * tour.childPrice
          }] : []),
          // Add infant pricing if there are infant passengers
          ...(tour.infantPax > 0 ? [{
            item: `${tour.tourName} - Infants`,
            quantity: tour.infantPax,
            unitPrice: tour.infantPrice,
            total: tour.infantPax * tour.infantPrice
          }] : [])
        ]
      }
    })),

    // Payment section - Contains payment information (only if payment is included)
    payment: includePayment ? [
      {
        date: paymentData.paymentDate,
        method: paymentData.paymentMethod || "",
        percentage: paymentData.paymentPercentage || 0,
        amountPaid: paymentData.amountPaid || 0,
        comments: paymentData.paymentComments || "",
        status: paymentData.paymentStatus || "pending",
        receiptFile: paymentData.receiptFile || null,
        totalAmount: tourBookings.reduce((total, tour) => total + tour.subtotal, 0),
        currency: formData.currency || "CLP"
      }
    ] : []
  }
}

/**
 * Utility function to validate booking data before submission
 */
export const validateBookingData = (data: BookingDataStructure): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate configuration
  if (!data.configuration || data.configuration.length === 0) {
    errors.push("Configuration is required")
  }

  // Validate customer
  if (!data.customer || data.customer.length === 0) {
    errors.push("Customer information is required")
  }

  // Validate tours
  if (!data.tour_list || data.tour_list.length === 0) {
    errors.push("At least one tour must be selected")
  }

  // Validate each tour has required fields
  data.tour_list?.forEach((tour, index) => {
    if (!tour.tourId) errors.push(`Tour ${index + 1}: Tour ID is required`)
    if (!tour.date) errors.push(`Tour ${index + 1}: Date is required`)
    if (tour.adultPax + tour.childPax + tour.infantPax === 0) {
      errors.push(`Tour ${index + 1}: At least one passenger is required`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Utility function to calculate totals from booking data
 */
export const calculateBookingTotals = (data: BookingDataStructure) => {
  const totalAmount = data.tour_list.reduce((total, tour) => total + tour.subtotal, 0)
  const totalPassengers = data.tour_list.reduce(
    (total, tour) => total + tour.passengers, 0
  )
  const totalTours = data.tour_list.length

  return {
    totalAmount,
    totalPassengers,
    totalTours,
    currency: data.tour_list[0]?.pricing.currency || 'CLP'
  }
}

/**
 * Convert structured booking data to the format expected by the booking service
 */
export const convertToBookingData = (
  structuredData: BookingDataStructure
): BookingData => {
  const config = structuredData.configuration[0]
  const customer = structuredData.customer[0]
  const firstTour = structuredData.tour_list[0]
  const payment = structuredData.payment[0]

  // Calculate aggregated tour details
  const totalPassengers = structuredData.tour_list.reduce(
    (total, tour) => total + tour.passengers, 0
  )
  const totalAmount = structuredData.tour_list.reduce(
    (total, tour) => total + tour.subtotal, 0
  )

  // Get date range from tours
  const tourDates = structuredData.tour_list.map(tour => new Date(tour.date))
  const startDate = new Date(Math.min(...tourDates.map(d => d.getTime())))
  const endDate = new Date(Math.max(...tourDates.map(d => d.getTime())))

  // Count passenger types
  const passengerBreakdown = structuredData.tour_list.reduce(
    (breakdown, tour) => ({
      adults: breakdown.adults + tour.adultPax,
      children: breakdown.children + tour.childPax,
      infants: breakdown.infants + tour.infantPax
    }),
    { adults: 0, children: 0, infants: 0 }
  )

  // Create comprehensive pricing breakdown
  const pricingBreakdown: Array<{
    item: string
    quantity: number
    unitPrice: number
    total: number
  }> = []

  structuredData.tour_list.forEach(tour => {
    tour.pricing.breakdown.forEach(item => {
      pricingBreakdown.push(item)
    })
  })

  return {
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      language: customer.language,
      country: customer.country,
      idNumber: customer.idNumber,
      cpf: customer.cpf,
      address: customer.address
    },
    tours: structuredData.tour_list.map(tour => ({
      id: tour.id,
      tourId: tour.tourId,
      tourName: tour.tourName,
      tourCode: tour.tourCode,
      date: tour.date,
      pickupAddress: tour.pickupAddress,
      pickupTime: tour.pickupTime,
      adultPax: tour.adultPax,
      adultPrice: tour.adultPrice,
      childPax: tour.childPax,
      childPrice: tour.childPrice,
      infantPax: tour.infantPax,
      infantPrice: tour.infantPrice,
      subtotal: tour.subtotal,
      operator: 'own-operation', // Default
      comments: ''
    })),
    tourDetails: {
      destination: firstTour?.destination || '',
      tourType: firstTour?.tourName || 'custom',
      startDate,
      endDate,
      passengers: totalPassengers,
      passengerBreakdown,
      hotel: customer.defaultHotel,
      room: customer.defaultRoom
    },
    pricing: {
      amount: totalAmount,
      currency: firstTour?.pricing.currency || 'CLP',
      breakdown: pricingBreakdown
    },
    leadSource: config.leadSource,
    assignedTo: config.assignedTo,
    agency: config.agency,
    status: config.status,
    validUntil: config.validUntil,
    additionalNotes: customer.accommodationComments,
    hasMultipleAddresses: false, // Default
    termsAccepted: config.termsAccepted,
    quotationComments: config.quotationComments,
    includePayment: structuredData.payment.length > 0,
    copyComments: config.copyComments,
    sendPurchaseOrder: config.sendPurchaseOrder,
    sendQuotationAccess: config.sendQuotationAccess,
    shareableLink: config.shareableLink,
    paymentDetails: payment ? {
      date: payment.date,
      method: payment.method,
      percentage: payment.percentage,
      amountPaid: payment.amountPaid,
      comments: payment.comments,
      status: payment.status,
      receiptFile: payment.receiptFile
    } : undefined
  }
}

/**
 * Convert structured booking data to payment data format
 */
export const convertToPaymentData = (
  structuredData: BookingDataStructure
) => {
  const config = structuredData.configuration[0]
  const customer = structuredData.customer[0]
  const payment = structuredData.payment[0]

  return {
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    },
    tours: structuredData.tour_list,
    tourDetails: {
      destination: structuredData.tour_list[0]?.destination || '',
      passengers: structuredData.tour_list.reduce((total, tour) => total + tour.passengers, 0)
    },
    pricing: {
      amount: structuredData.tour_list.reduce((total, tour) => total + tour.subtotal, 0),
      currency: structuredData.tour_list[0]?.pricing.currency || 'CLP'
    },
    paymentDetails: {
      date: payment?.date,
      method: payment?.method,
      percentage: payment?.percentage,
      amountPaid: payment?.amountPaid,
      comments: payment?.comments,
      status: payment?.status,
      receiptFile: payment?.receiptFile
    },
    bookingOptions: {
      includePayment: structuredData.payment.length > 0,
      copyComments: config.copyComments,
      sendPurchaseOrder: config.sendPurchaseOrder,
      quotationComments: config.quotationComments,
      sendQuotationAccess: config.sendQuotationAccess
    }
  }
}

/**
 * Generate a unique shareable link
 */
export const generateShareableLink = (): string => {
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomString}`
}