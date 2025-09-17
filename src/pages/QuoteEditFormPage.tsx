import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "@/hooks/useBookings";
import {
  QuoteConfigSection,
  CustomerInfoSection,
  TourBookingSection,
  TourListSection,
  PaymentDetailsSection,
  BookingOptionsSection,
} from "@/components/quote-edit";

const QuoteEditFormPage = () => {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useBooking(quoteId || "");

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <p className="text-muted-foreground">Loading quote data...</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !booking) {
    return (
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <p className="text-muted-foreground text-red-600">
            {error ? "Error loading quote data" : "Quote not found"}
          </p>
        </div>
        <button
          onClick={() => navigate("/my-quotes")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Back to Quotes
        </button>
      </div>
    );
  }

  // Use the actual booking data from the API
  const bookingData = booking;

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
    return (bookingData.tours || []).reduce((total: number, tour: any) => total + (tour.subtotal || 0), 0);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">Edit Quote</h1>
        <p className="text-muted-foreground">Update quote information and tours</p>
      </div>

      <form className="space-y-6">
        <QuoteConfigSection
          assignedTo={bookingData.assignedTo}
          currency={bookingData.pricing?.currency}
          leadSource={bookingData.leadSource}
        />

        <CustomerInfoSection
          customer={bookingData.customer}
          tourDetails={bookingData.tourDetails}
          additionalNotes={bookingData.additionalNotes}
        />

        <TourBookingSection
          currency={bookingData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
        />

        <TourListSection
          tours={bookingData.tours}
          currency={bookingData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <PaymentDetailsSection
          includePayment={bookingData.includePayment}
          currency={bookingData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <BookingOptionsSection
          includePayment={bookingData.includePayment}
          copyComments={bookingData.copyComments}
          sendPurchaseOrder={bookingData.sendPurchaseOrder}
          sendQuotationAccess={bookingData.sendQuotationAccess}
          validUntil={bookingData.validUntil}
          quotationComments={bookingData.quotationComments}
          customerEmail={bookingData.customer?.email}
        />
      </form>
    </div>
  );
};

export default QuoteEditFormPage;