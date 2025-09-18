import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking, useUpdateBooking } from "@/hooks/useBookings";
import { useToast } from "@/components/ui/use-toast";
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
  const updateBookingMutation = useUpdateBooking();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<any>(null);

  // Helper function to get current tour booking data
  const getCurrentTourBooking = () => {
    // Use the first tour if it exists, otherwise return default values
    const firstTour = formData?.tours?.[0];
    if (firstTour) {
      return {
        destination: formData?.tourDetails?.destination || firstTour.tourName || "",
        tourId: firstTour.tourId || "",
        tourName: firstTour.tourName || "",
        date: firstTour.date ? new Date(firstTour.date) : new Date(),
        operator: firstTour.operator || "",
        pickupAddress: firstTour.pickupAddress || "",
        pickupTime: firstTour.pickupTime || "",
        adultPax: firstTour.adultPax || 0,
        adultPrice: firstTour.adultPrice || 0,
        childPax: firstTour.childPax || 0,
        childPrice: firstTour.childPrice || 0,
        infantPax: firstTour.infantPax || 0,
        infantPrice: firstTour.infantPrice || 0,
        comments: firstTour.comments || "",
      };
    }

    // Default empty values for new tour
    return {
      destination: "",
      tourId: "",
      tourName: "",
      date: new Date(),
      operator: "",
      pickupAddress: "",
      pickupTime: "",
      adultPax: 0,
      adultPrice: 0,
      childPax: 0,
      childPrice: 0,
      infantPax: 0,
      infantPrice: 0,
      comments: "",
    };
  };

  // Initialize form data when booking loads
  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested field changes
  const handleNestedFieldChange = (parentField: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value,
      },
    }));
  };

  // Handle tour booking changes
  const handleTourBookingChange = (field: string, value: any) => {
    // If there's an existing tour, update it; otherwise prepare data for new tour
    if (formData?.tours?.[0]) {
      // Update the existing first tour
      setFormData((prev: any) => ({
        ...prev,
        tours: prev.tours.map((tour: any, index: number) => {
          if (index === 0) {
            // Update the first tour
            return {
              ...tour,
              [field]: value,
              // Update related fields
              ...(field === 'date' && { date: value.toISOString() }),
              // Recalculate subtotal if price/pax changes
              ...((['adultPax', 'adultPrice', 'childPax', 'childPrice', 'infantPax', 'infantPrice'].includes(field)) && {
                subtotal: (() => {
                  const updatedTour = { ...tour, [field]: value };
                  const adultTotal = (updatedTour.adultPax || 0) * (updatedTour.adultPrice || 0);
                  const childTotal = (updatedTour.childPax || 0) * (updatedTour.childPrice || 0);
                  const infantTotal = (updatedTour.infantPax || 0) * (updatedTour.infantPrice || 0);
                  return adultTotal + childTotal + infantTotal;
                })()
              })
            };
          }
          return tour;
        }),
        // Also update tourDetails if destination changes
        ...(field === 'destination' && {
          tourDetails: {
            ...prev.tourDetails,
            destination: value
          }
        })
      }));
    }
    // If no existing tours, this would be handled by handleAddTour
  };

  // Handle updating the tour
  const handleUpdateTour = () => {
    // The tour data is already being updated in real-time via handleTourBookingChange
    // This is just a confirmation that the update is complete
    toast({
      title: "Tour Updated",
      description: "Tour information has been updated successfully",
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !quoteId) return;

    try {
      // Format the data to match the backend expectations (same as quotes page)
      // Remove agency, hasMultipleAddresses, and paymentDetails
      const bookingData = {
        customer: {
          name: formData.customer?.name || '',
          email: formData.customer?.email || '',
          phone: formData.customer?.phone || '',
          language: formData.customer?.language || 'en',
          country: formData.customer?.country || '',
          idNumber: formData.customer?.idNumber || '',
          cpf: formData.customer?.cpf || '',
          address: formData.customer?.address || '',
        },
        tours: formData.tours || [],
        tourDetails: {
          destination: formData.tourDetails?.destination || '',
          tourType: formData.tourDetails?.tourType || '',
          startDate: formData.tourDetails?.startDate || new Date(),
          endDate: formData.tourDetails?.endDate || new Date(),
          passengers: formData.tourDetails?.passengers || 0,
          passengerBreakdown: formData.tourDetails?.passengerBreakdown || {
            adults: 0,
            children: 0,
            infants: 0,
          },
          hotel: formData.tourDetails?.hotel || '',
          room: formData.tourDetails?.room || '',
        },
        pricing: {
          amount: formData.pricing?.amount || 0,
          currency: formData.pricing?.currency || 'USD',
          breakdown: formData.pricing?.breakdown || [],
        },
        leadSource: formData.leadSource || '',
        assignedTo: formData.assignedTo || '',
        status: formData.status || 'pending',
        validUntil: formData.validUntil || new Date(),
        additionalNotes: formData.additionalNotes || '',
        termsAccepted: formData.termsAccepted || { accepted: false },
        quotationComments: formData.quotationComments || '',
        includePayment: formData.includePayment || false,
        copyComments: formData.copyComments || true,
        sendPurchaseOrder: formData.sendPurchaseOrder || true,
        sendQuotationAccess: formData.sendQuotationAccess || true,
      };

      await updateBookingMutation.mutateAsync({
        id: quoteId,
        data: bookingData,
      });

      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });

      navigate("/my-quotes");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quotation",
        variant: "destructive",
      });
    }
  };

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
  if (error || (!isLoading && !booking)) {
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

  // Don't render form until formData is ready
  if (!formData) {
    return (
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-bold">Edit Quote</h1>
          <p className="text-muted-foreground">Initializing form...</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
    return (formData.tours || []).reduce((total: number, tour: any) => total + (tour.subtotal || 0), 0);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6 max-w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-bold">Edit Quote</h1>
            <p className="text-muted-foreground">Update quote information and tours</p>
          </div>

          <form className="space-y-6 w-full max-w-full overflow-x-hidden" onSubmit={handleSubmit}>
        <div className="w-full max-w-full overflow-x-hidden">
        <QuoteConfigSection
          assignedTo={formData.assignedTo}
          currency={formData.pricing?.currency}
          leadSource={formData.leadSource}
          onAssignedToChange={(value) => handleFieldChange('assignedTo', value)}
          onCurrencyChange={(value) => handleNestedFieldChange('pricing', 'currency', value)}
          onLeadSourceChange={(value) => handleFieldChange('leadSource', value)}
        />

        <CustomerInfoSection
          customer={formData.customer}
          tourDetails={formData.tourDetails}
          additionalNotes={formData.additionalNotes}
          onCustomerChange={(field, value) => handleNestedFieldChange('customer', field, value)}
          onTourDetailsChange={(field, value) => handleNestedFieldChange('tourDetails', field, value)}
          onAdditionalNotesChange={(value) => handleFieldChange('additionalNotes', value)}
        />

        <TourBookingSection
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          tourBooking={getCurrentTourBooking()}
          onTourBookingChange={handleTourBookingChange}
          onUpdateTour={handleUpdateTour}
        />

        <TourListSection
          tours={formData.tours}
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <PaymentDetailsSection
          includePayment={formData.includePayment}
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        <BookingOptionsSection
          includePayment={formData.includePayment}
          copyComments={formData.copyComments}
          sendPurchaseOrder={formData.sendPurchaseOrder}
          sendQuotationAccess={formData.sendQuotationAccess}
          validUntil={formData.validUntil}
          quotationComments={formData.quotationComments}
          customerEmail={formData.customer?.email}
          onIncludePaymentChange={(value) => handleFieldChange('includePayment', value)}
          onCopyCommentsChange={(value) => handleFieldChange('copyComments', value)}
          onSendPurchaseOrderChange={(value) => handleFieldChange('sendPurchaseOrder', value)}
          onSendQuotationAccessChange={(value) => handleFieldChange('sendQuotationAccess', value)}
          onValidUntilChange={(value) => handleFieldChange('validUntil', value)}
          onQuotationCommentsChange={(value) => handleFieldChange('quotationComments', value)}
        />
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteEditFormPage;