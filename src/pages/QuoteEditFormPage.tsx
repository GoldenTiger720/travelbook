import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking, useUpdateBooking } from "@/hooks/useBookings";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from "@/config/api";
import {
  QuoteConfigSection,
  CustomerInfoSection,
  TourBookingSection,
  TourListSection,
  PaymentDetailsSection,
  BookingOptionsSection,
} from "@/components/quote-edit";

// Interfaces for API responses
interface DestinationTour {
  id: string;
  name: string;
  description: string;
  adult_price: string;
  child_price: string;
  currency: string;
  starting_point: string;
  departure_time: string;
  capacity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  language: string;
  status: string;
  created_at: string;
  updated_at: string;
  tours: DestinationTour[];
  tours_count: number;
}

interface DestinationsApiResponse {
  success: boolean;
  message: string;
  data: Destination[];
  statistics: {
    total_destinations: number;
    active_destinations: number;
    total_tours: number;
  };
  count: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  commission: string;
  status: string;
}

interface UsersApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

const QuoteEditFormPage = () => {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useBooking(quoteId || "");
  const updateBookingMutation = useUpdateBooking();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<any>(null);

  // API data state
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // State to track which tour is being edited (-1 means adding new tour)
  const [editingTourIndex, setEditingTourIndex] = useState<number>(-1);

  // Helper function to get current tour booking data
  const getCurrentTourBooking = () => {
    // If editing an existing tour, return its data
    if (editingTourIndex >= 0 && formData?.tours?.[editingTourIndex]) {
      const tour = formData.tours[editingTourIndex];
      return {
        destination: formData?.tourDetails?.destination || tour.tourName || "",
        tourId: tour.tourId || "",
        tourName: tour.tourName || "",
        date: tour.date ? new Date(tour.date) : new Date(),
        operator: tour.operator || "",
        pickupAddress: tour.pickupAddress || "",
        pickupTime: tour.pickupTime || "",
        adultPax: tour.adultPax || 0,
        adultPrice: tour.adultPrice || 0,
        childPax: tour.childPax || 0,
        childPrice: tour.childPrice || 0,
        infantPax: tour.infantPax || 0,
        infantPrice: tour.infantPrice || 0,
        comments: tour.comments || "",
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

  // Load destinations and users data on component mount
  useEffect(() => {
    loadDestinationsData();
    loadUsersData();
  }, []);

  // Initialize form data when booking loads
  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  // Load destinations from API
  const loadDestinationsData = async () => {
    try {
      const response = await apiCall('/api/destinations/', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: DestinationsApiResponse = await response.json();
      console.log('Destinations loaded:', apiResponse);

      if (apiResponse.success && apiResponse.data) {
        setDestinations(apiResponse.data);
        console.log('Available destinations:', apiResponse.data.map(dest => dest.name));
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
      toast({
        title: "Error",
        description: "Failed to load destinations data",
        variant: "destructive",
      });
    }
  };

  // Load users from API
  const loadUsersData = async () => {
    try {
      const response = await apiCall('/api/users/', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: UsersApiResponse = await response.json();
      console.log('Users loaded:', apiResponse);

      if (apiResponse.results) {
        setUsers(apiResponse.results);
        console.log('Available users:', apiResponse.results.length);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users data",
        variant: "destructive",
      });
    }
  };

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
    // If editing an existing tour (editingTourIndex >= 0)
    if (editingTourIndex >= 0 && formData?.tours?.[editingTourIndex]) {
      setFormData((prev: any) => ({
        ...prev,
        tours: prev.tours.map((tour: any, index: number) => {
          if (index === editingTourIndex) {
            // Update the tour being edited
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
  };

  // Handle updating the tour
  const handleUpdateTour = () => {
    // The tour data is already being updated in real-time via handleTourBookingChange
    // Reset editing mode
    setEditingTourIndex(-1);

    toast({
      title: "Tour Updated",
      description: "Tour information has been updated successfully",
    });
  };

  // Handle editing a tour from the list
  const handleEditTourFromList = (tour: any, index: number) => {
    setEditingTourIndex(index);
    toast({
      title: "Edit Mode",
      description: `Now editing: ${tour.tourName}`,
    });
  };

  // Handle deleting a tour
  const handleDeleteTour = (tourId: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      tours: prev.tours.filter((_: any, i: number) => i !== index)
    }));

    // If we were editing this tour, reset editing mode
    if (editingTourIndex === index) {
      setEditingTourIndex(-1);
    } else if (editingTourIndex > index) {
      // Adjust editing index if a tour before the current one was deleted
      setEditingTourIndex(editingTourIndex - 1);
    }

    toast({
      title: "Tour Deleted",
      description: "Tour has been removed from the booking",
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
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Quote</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Update quote information and tours</p>
          </div>

          <form className="w-full max-w-full overflow-x-hidden" onSubmit={handleSubmit}>
        <div className="w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-8 lg:space-y-12">

        {/* Booking or quotation configuration */}
        <QuoteConfigSection
          assignedTo={formData.assignedTo}
          currency={formData.pricing?.currency}
          leadSource={formData.leadSource}
          users={users}
          onAssignedToChange={(value) => handleFieldChange('assignedTo', value)}
          onCurrencyChange={(value) => handleNestedFieldChange('pricing', 'currency', value)}
          onLeadSourceChange={(value) => handleFieldChange('leadSource', value)}
        />

        {/* Client Information */}
        <CustomerInfoSection
          customer={formData.customer}
          tourDetails={formData.tourDetails}
          additionalNotes={formData.additionalNotes}
          onCustomerChange={(field, value) => handleNestedFieldChange('customer', field, value)}
          onTourDetailsChange={(field, value) => handleNestedFieldChange('tourDetails', field, value)}
          onAdditionalNotesChange={(value) => handleFieldChange('additionalNotes', value)}
        />

        {/* Add Tour */}
        <TourBookingSection
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          tourBooking={getCurrentTourBooking()}
          destinations={destinations}
          onTourBookingChange={handleTourBookingChange}
          onUpdateTour={handleUpdateTour}
        />

        {/* Bookings List */}
        <TourListSection
          tours={formData.tours}
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
          onEditTour={handleEditTourFromList}
          onDeleteTour={handleDeleteTour}
        />

        {/* Payment details */}
        <PaymentDetailsSection
          includePayment={formData.includePayment}
          currency={formData.pricing?.currency}
          getCurrencySymbol={getCurrencySymbol}
          calculateGrandTotal={calculateGrandTotal}
        />

        {/* Booking Options */}
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