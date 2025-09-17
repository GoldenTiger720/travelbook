import React from "react";
import {
  QuoteConfigSection,
  CustomerInfoSection,
  TourBookingSection,
  TourListSection,
  PaymentDetailsSection,
  BookingOptionsSection,
} from "@/components/quote-edit";

const QuoteEditFormPage = () => {
  // Sample data for display purposes
  const sampleBooking = {
    id: "555e486b-c39e-4bf7-ac6c-a35fd1b7c370",
    customer: {
      id: "20f8f3a0-c685-4633-a549-51e971ab598b",
      name: "John Doe",
      email: "mason@gmail.com",
      phone: "+56 5 6565 6564",
      language: "pt",
      country: "China",
      idNumber: "222.234.344-R",
      cpf: "222",
      address: "101 Street1",
      company: "",
      location: "",
      status: "active",
      totalBookings: 0,
      totalSpent: 0.0,
      lastBooking: null,
      notes: "",
      avatar: "",
      createdAt: "2025-09-11T02:45:15.809022Z",
      updatedAt: "2025-09-16T22:15:00.636559Z"
    },
    tours: [
      {
        id: "1758060207725",
        tourId: "8",
        tourName: "Seven Lakes Route",
        tourCode: "BAR-7L01",
        date: "2025-09-23T21:00:00Z",
        pickupAddress: "101 Street1",
        pickupTime: "08:00",
        adultPax: 1,
        adultPrice: 1105.0,
        childPax: 0,
        childPrice: 680.0,
        infantPax: 0,
        infantPrice: 0.0,
        subtotal: 1105.0,
        operator: "others",
        comments: "",
        createdAt: "2025-09-16T22:03:34.314817Z",
        updatedAt: "2025-09-16T22:03:34.314829Z"
      }
    ],
    tourDetails: {
      destination: "Seven Lakes Route",
      tourType: "BAR-7L01",
      startDate: "2025-09-23T21:00:00Z",
      endDate: "2025-09-23T21:00:00Z",
      passengers: 1,
      passengerBreakdown: {
        adults: 1,
        children: 0,
        infants: 0
      },
      hotel: "Hotel 2",
      room: "44"
    },
    pricing: {
      amount: 1105.0,
      currency: "BRL",
      breakdown: [
        {
          item: "Seven Lakes Route - Adults",
          quantity: 1,
          unitPrice: 1105.0,
          total: 1105.0
        }
      ]
    },
    leadSource: "youtube",
    assignedTo: "ana",
    agency: null,
    status: "confirmed",
    validUntil: new Date("2025-10-16T22:02:05.852000Z"),
    additionalNotes: "",
    hasMultipleAddresses: false,
    termsAccepted: {
      accepted: false
    },
    quotationComments: "",
    includePayment: false,
    copyComments: true,
    sendPurchaseOrder: true,
    sendQuotationAccess: true,
    paymentDetails: {
      date: new Date(),
      method: "",
      percentage: 50,
      amountPaid: 0,
      comments: "",
      status: "",
      receiptFile: null
    },
    allPayments: [],
    bookingOptions: {
      copyComments: true,
      includePayment: false,
      quoteComments: "",
      sendPurchaseOrder: true,
      sendQuotationAccess: true
    },
    createdBy: {
      id: "d20681e4-1ad5-4b66-b6f4-7f25f8bb03d3",
      email: "mason@gmail.com",
      fullName: "Mason Lee",
      phone: null,
      company: null
    },
    createdAt: "2025-09-16T22:03:34.118644Z",
    updatedAt: "2025-09-16T22:03:34.118653Z"
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      CLP: "CLP$",
      USD: "USD$",
      EUR: "€",
      BRL: "R$",
      ARS: "ARS$",
    };
    return symbols[currency] || currency + "$";
  };

  const calculateGrandTotal = () => {
    return (sampleBooking.tours || []).reduce((total: number, tour: any) => total + (tour.subtotal || 0), 0);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">Edit Quote</h1>
        <p className="text-muted-foreground">Update quote information and tours</p>
      </div>

      <form className="space-y-6">
        <QuoteConfigSection
          assignedTo={sampleBooking.assignedTo}
          currency={sampleBooking.pricing.currency}
          leadSource={sampleBooking.leadSource}
        />

        <CustomerInfoSection
          customer={sampleBooking.customer}
          tourDetails={sampleBooking.tourDetails}
          additionalNotes={sampleBooking.additionalNotes}
        />

        <TourBookingSection
          currency={sampleBooking.pricing.currency}
          getCurrencySymbol={getCurrencySymbol}
        />

        <TourListSection
          tours={sampleBooking.tours}
          currency={sampleBooking.pricing.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <PaymentDetailsSection
          includePayment={sampleBooking.includePayment}
          currency={sampleBooking.pricing.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <BookingOptionsSection
          includePayment={sampleBooking.includePayment}
          copyComments={sampleBooking.copyComments}
          sendPurchaseOrder={sampleBooking.sendPurchaseOrder}
          sendQuotationAccess={sampleBooking.sendQuotationAccess}
          validUntil={sampleBooking.validUntil}
          quotationComments={sampleBooking.quotationComments}
          customerEmail={sampleBooking.customer.email}
        />
      </form>
    </div>
  );
};

export default QuoteEditFormPage;