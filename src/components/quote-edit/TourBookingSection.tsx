import React from "react";
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
            <Select value={tourBooking?.destination || ""} onValueChange={(value) => onTourBookingChange?.('destination', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectDestination")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seven Lakes Route">Seven Lakes Route</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("quotes.tour")}</Label>
            <Select value={tourBooking?.tourId || ""} onValueChange={(value) => onTourBookingChange?.('tourId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectTour")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Seven Lakes Route (BAR-7L01)</SelectItem>
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