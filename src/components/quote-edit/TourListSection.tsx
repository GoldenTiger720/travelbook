import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit2,
  MapPin,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Tour {
  id: string;
  tourId: string;
  tourName: string;
  tourCode: string;
  date: string;
  pickupAddress: string;
  pickupTime: string;
  adultPax: number;
  adultPrice: number;
  childPax: number;
  childPrice: number;
  infantPax: number;
  infantPrice: number;
  subtotal: number;
  operator: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

interface TourListSectionProps {
  tours: Tour[];
  currency: string;
  getCurrencySymbol: (currency: string) => string;
  calculateGrandTotal: () => number;
}

const TourListSection: React.FC<TourListSectionProps> = ({
  tours,
  currency,
  getCurrencySymbol,
  calculateGrandTotal,
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t("quotes.tourBookingsList")}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        {/* Responsive Card Layout for all screen sizes */}
        <div className="space-y-4">
          {tours.map((tour) => (
            <Card key={tour.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="mb-3">
                  <div>
                    <div className="font-semibold text-base break-words">
                      {tour.tourName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(tour.date), "dd/MM/yyyy")}
                      {tour.pickupTime && ` • ${tour.pickupTime}`}
                    </div>
                    {tour.pickupAddress && (
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="break-words">{tour.pickupAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {tour.operator === "own-operation" && (
                      <Building className="w-3 h-3" />
                    )}
                    <span className="text-muted-foreground">
                      {t("quotes.operator")}:
                    </span>
                    <span>
                      {tour.operator === "own-operation"
                        ? t("quotes.ownOperation")
                        : tour.operator}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.adultPax")}
                      </div>
                      <div className="font-medium">{tour.adultPax}</div>
                      <div className="text-xs text-muted-foreground break-words">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.adultPrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.childPax")}
                      </div>
                      <div className="font-medium">{tour.childPax}</div>
                      <div className="text-xs text-muted-foreground break-words">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.childPrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.infantPax")}
                      </div>
                      <div className="font-medium">{tour.infantPax}</div>
                      <div className="text-xs text-muted-foreground break-words">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.infantPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {t("quotes.subTotal")}:
                      </span>
                      <span className="font-bold text-lg text-green-600 break-words">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center gap-4">
            <span className="text-xl font-bold flex-shrink-0">
              {t("quotes.grandTotal")}
            </span>
            <span className="text-2xl font-bold text-green-600 break-words text-right">
              {getCurrencySymbol(currency || "CLP")}{" "}
              {calculateGrandTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourListSection;