import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Plus,
  MapPin,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { tourCatalogService } from "@/services/tourCatalogService";
import { Tour } from "@/types/tour";

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

interface TourBookingSectionProps {
  currency: string;
  getCurrencySymbol: (currency: string) => string;
  tourBooking?: {
    destination: string;
    tourId: string;
    tourName: string;
    date: Date;
    operator: string;
    pickupAddress: string;
    pickupTime: string;
    adultPax: number;
    adultPrice: number;
    childPax: number;
    childPrice: number;
    infantPax: number;
    infantPrice: number;
    comments: string;
  };
  destinations?: Destination[];
  onTourBookingChange?: (field: string, value: any) => void;
  onUpdateTour?: () => void;
}

const TourBookingSection: React.FC<TourBookingSectionProps> = ({
  currency,
  getCurrencySymbol,
  tourBooking,
  destinations = [],
  onTourBookingChange,
  onUpdateTour,
}) => {
  const { t } = useLanguage();
  const [availableTours, setAvailableTours] = useState<(Tour | DestinationTour)[]>([]);
  const [localDestinations, setLocalDestinations] = useState<string[]>([]);
  const [filteredTours, setFilteredTours] = useState<(Tour | DestinationTour)[]>([]);

  // Load tour data on component mount (fallback if destinations prop is not provided)
  useEffect(() => {
    if (destinations.length === 0) {
      loadTourData();
    } else {
      // Use destinations from props
      setLocalDestinations(destinations.map(dest => dest.name));
    }
  }, [destinations]);

  // Filter tours by selected destination
  useEffect(() => {
    if (tourBooking?.destination) {
      // First check if we have API destinations data
      if (destinations.length > 0) {
        const selectedDest = destinations.find(dest => dest.name === tourBooking.destination);
        if (selectedDest) {
          setFilteredTours(selectedDest.tours.filter(tour => tour.active));
        } else {
          setFilteredTours([]);
        }
      } else {
        // Fallback to old catalog service filtering
        const filtered = availableTours.filter(
          (tour) => {
            if ('destination' in tour) {
              return tour.destination === tourBooking.destination;
            }
            return false;
          }
        );
        setFilteredTours(filtered);
      }
    } else {
      setFilteredTours(availableTours);
    }
  }, [tourBooking?.destination, availableTours, destinations]);

  const loadTourData = async () => {
    try {
      const tours = await tourCatalogService.getAllTours();
      const dests = await tourCatalogService.getDestinations();
      setAvailableTours(tours);
      setLocalDestinations(dests);
      setFilteredTours(tours);
    } catch (error) {
      console.error("Error loading tour data:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t("quotes.addTourBooking")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>{t("quotes.destination")}</Label>
            <Select
              value={tourBooking?.destination || ""}
              onValueChange={(value) => {
                onTourBookingChange?.('destination', value);
                // Reset tour selection when destination changes
                onTourBookingChange?.('tourId', '');
                onTourBookingChange?.('tourName', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectDestination")} />
              </SelectTrigger>
              <SelectContent>
                {localDestinations.map((destination) => (
                  <SelectItem key={destination} value={destination}>
                    {destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("quotes.tour")}</Label>
            <Select
              value={tourBooking?.tourId || ""}
              onValueChange={async (value) => {
                const selectedTour = filteredTours.find(tour => tour.id === value);
                if (selectedTour) {
                  onTourBookingChange?.('tourId', value);
                  onTourBookingChange?.('tourName', selectedTour.name);

                  // Check if it's a DestinationTour (from API) or Tour (from catalog)
                  const isDestinationTour = 'adult_price' in selectedTour;

                  let adultPrice: number;
                  let childPrice: number;
                  let infantPrice: number;
                  let tourCurrency: string;

                  if (isDestinationTour) {
                    // DestinationTour from API
                    const destTour = selectedTour as DestinationTour;
                    adultPrice = parseFloat(destTour.adult_price);
                    childPrice = parseFloat(destTour.child_price);
                    infantPrice = 0; // API doesn't have infant price
                    tourCurrency = destTour.currency;
                  } else {
                    // Tour from catalog
                    const tour = selectedTour as Tour;
                    adultPrice = tour.basePricing.adultPrice;
                    childPrice = tour.basePricing.childPrice;
                    infantPrice = tour.basePricing.infantPrice;
                    tourCurrency = tour.basePricing.currency;
                  }

                  // Convert prices if currencies don't match
                  if (currency && currency !== tourCurrency) {
                    const conversionRates: { [key: string]: { [key: string]: number } } = {
                      'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
                      'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
                      'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
                      'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
                      'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
                    };

                    const rate = conversionRates[tourCurrency]?.[currency] || 1;
                    adultPrice = Math.round(adultPrice * rate);
                    childPrice = Math.round(childPrice * rate);
                    infantPrice = Math.round(infantPrice * rate);
                  }

                  onTourBookingChange?.('adultPrice', adultPrice);
                  onTourBookingChange?.('childPrice', childPrice);
                  onTourBookingChange?.('infantPrice', infantPrice);

                  // Set default pickup time if available
                  if (isDestinationTour) {
                    const destTour = selectedTour as DestinationTour;
                    if (destTour.departure_time && !tourBooking?.pickupTime) {
                      onTourBookingChange?.('pickupTime', destTour.departure_time);
                    }
                  } else {
                    const tour = selectedTour as Tour;
                    if (tour.defaultPickupTime && !tourBooking?.pickupTime) {
                      onTourBookingChange?.('pickupTime', tour.defaultPickupTime);
                    }
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectTour")} />
              </SelectTrigger>
              <SelectContent>
                {filteredTours.map((tour) => {
                  // Check if it's DestinationTour or Tour to display appropriate info
                  const isDestinationTour = 'adult_price' in tour;
                  const displayText = isDestinationTour
                    ? tour.name
                    : `${tour.name} (${(tour as Tour).code})`;

                  return (
                    <SelectItem key={tour.id} value={tour.id}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("quotes.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tourBooking?.date ? format(tourBooking.date, "dd/MM/yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={tourBooking?.date}
                  onSelect={(date) => date && onTourBookingChange?.('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>{t("quotes.operator")}</Label>
            <Select value={tourBooking?.operator || ""} onValueChange={(value) => onTourBookingChange?.('operator', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectOperator")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="own-operation">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {t("quotes.ownOperation")}
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
              {t("quotes.pickupAddress")}
            </Label>
            <Input
              placeholder={t("quotes.pickupPlaceholder")}
              value={tourBooking?.pickupAddress || ""}
              className="border-blue-300"
              onChange={(e) => onTourBookingChange?.('pickupAddress', e.target.value)}
            />
          </div>

          <div>
            <Label>{t("quotes.pickupTime")}</Label>
            <Input
              type="time"
              value={tourBooking?.pickupTime || ""}
              onChange={(e) => onTourBookingChange?.('pickupTime', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <Label>{t("quotes.adultsPax")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.adultPax || 0}
              onChange={(e) => onTourBookingChange?.('adultPax', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>{t("quotes.adultPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.adultPrice || 0}
              onChange={(e) => onTourBookingChange?.('adultPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>{t("quotes.childrenPax")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.childPax || 0}
              onChange={(e) => onTourBookingChange?.('childPax', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>{t("quotes.childPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.childPrice || 0}
              onChange={(e) => onTourBookingChange?.('childPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>{t("quotes.infantsPax")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.infantPax || 0}
              onChange={(e) => onTourBookingChange?.('infantPax', parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>{t("quotes.infantPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={tourBooking?.infantPrice || 0}
              onChange={(e) => onTourBookingChange?.('infantPrice', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <Label>{t("quotes.tourComments")}</Label>
          <Textarea
            rows={2}
            placeholder={t("quotes.tourCommentsPlaceholder")}
            value={tourBooking?.comments || ""}
            onChange={(e) => onTourBookingChange?.('comments', e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="text-lg font-semibold break-words">
            Subtotal: {getCurrencySymbol(currency || "CLP")}{" "}
            {(() => {
              if (!tourBooking) return "0";
              const adultTotal = (tourBooking.adultPax || 0) * (tourBooking.adultPrice || 0);
              const childTotal = (tourBooking.childPax || 0) * (tourBooking.childPrice || 0);
              const infantTotal = (tourBooking.infantPax || 0) * (tourBooking.infantPrice || 0);
              return (adultTotal + childTotal + infantTotal).toLocaleString();
            })()}
          </div>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onUpdateTour}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.updateTour") || "Update Tour"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourBookingSection;