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
  onTourBookingChange?: (field: string, value: any) => void;
  onAddTour?: () => void;
}

const TourBookingSection: React.FC<TourBookingSectionProps> = ({
  currency,
  getCurrencySymbol,
  tourBooking,
  onTourBookingChange,
  onAddTour,
}) => {
  const { t } = useLanguage();
  const [availableTours, setAvailableTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);

  // Load tour data on component mount
  useEffect(() => {
    loadTourData();
  }, []);

  // Filter tours by selected destination
  useEffect(() => {
    if (tourBooking?.destination) {
      const filtered = availableTours.filter(
        tour => tour.destination === tourBooking.destination
      );
      setFilteredTours(filtered);
    } else {
      setFilteredTours(availableTours);
    }
  }, [tourBooking?.destination, availableTours]);

  const loadTourData = async () => {
    try {
      const tours = await tourCatalogService.getAllTours();
      const dests = await tourCatalogService.getDestinations();
      setAvailableTours(tours);
      setDestinations(dests);
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
      <CardContent className="space-y-4">
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
                {destinations.map((destination) => (
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
                const selectedTour = availableTours.find(tour => tour.id === value);
                if (selectedTour) {
                  onTourBookingChange?.('tourId', value);
                  onTourBookingChange?.('tourName', selectedTour.name);

                  // Update prices based on selected tour and currency
                  let adultPrice = selectedTour.basePricing.adultPrice;
                  let childPrice = selectedTour.basePricing.childPrice;
                  let infantPrice = selectedTour.basePricing.infantPrice;

                  // Convert prices if currencies don't match
                  if (currency && currency !== selectedTour.basePricing.currency) {
                    const conversionRates: { [key: string]: { [key: string]: number } } = {
                      'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
                      'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
                      'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
                      'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
                      'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
                    };

                    const rate = conversionRates[selectedTour.basePricing.currency]?.[currency] || 1;
                    adultPrice = Math.round(adultPrice * rate);
                    childPrice = Math.round(childPrice * rate);
                    infantPrice = Math.round(infantPrice * rate);
                  }

                  onTourBookingChange?.('adultPrice', adultPrice);
                  onTourBookingChange?.('childPrice', childPrice);
                  onTourBookingChange?.('infantPrice', infantPrice);

                  // Set default pickup time if available
                  if (selectedTour.defaultPickupTime && !tourBooking?.pickupTime) {
                    onTourBookingChange?.('pickupTime', selectedTour.defaultPickupTime);
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectTour")} />
              </SelectTrigger>
              <SelectContent>
                {filteredTours.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.name} ({tour.code})
                  </SelectItem>
                ))}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
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
            onClick={onAddTour}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("quotes.addTour")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourBookingSection;