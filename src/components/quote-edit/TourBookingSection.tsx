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
}

const TourBookingSection: React.FC<TourBookingSectionProps> = ({
  currency,
  getCurrencySymbol,
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
            <Select value="Seven Lakes Route">
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
            <Select value="8">
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
                  {format(new Date("2025-09-23T21:00:00Z"), "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date("2025-09-23T21:00:00Z")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>{t("quotes.operator")}</Label>
            <Select value="others">
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
              value="101 Street1"
              className="border-blue-300"
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.pickupTime")}</Label>
            <Input
              type="time"
              value="08:00"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label>{t("quotes.adultsPax")}</Label>
            <Input
              type="number"
              min="0"
              value={1}
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.adultPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={1105.0}
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.childrenPax")}</Label>
            <Input
              type="number"
              min="0"
              value={0}
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.childPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={680.0}
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.infantsPax")}</Label>
            <Input
              type="number"
              min="0"
              value={0}
              readOnly
            />
          </div>

          <div>
            <Label>{t("quotes.infantPrice")}</Label>
            <Input
              type="number"
              min="0"
              value={0.0}
              readOnly
            />
          </div>
        </div>

        <div>
          <Label>{t("quotes.tourComments")}</Label>
          <Textarea
            rows={2}
            placeholder={t("quotes.tourCommentsPlaceholder")}
            value=""
            readOnly
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Subtotal: {getCurrencySymbol(currency || "CLP")}{" "}
            {(1105.0).toLocaleString()}
          </div>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            disabled
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