import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
      <CardContent className="overflow-x-hidden p-3 sm:p-6">
        {/* Mobile Card Layout - Visible on mobile */}
        <div className="block sm:hidden space-y-4">
          {tours.length > 0 ? tours.map((tour) => (
            <div key={tour.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm break-words">{tour.tourName}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(tour.date), "dd/MM/yyyy")}
                    {tour.pickupTime && ` • ${tour.pickupTime}`}
                  </div>
                  {tour.pickupAddress && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="break-words">{tour.pickupAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {tour.operator === "own-operation" && (
                  <Building className="w-3 h-3 flex-shrink-0" />
                )}
                <span className="text-muted-foreground">Operator:</span>
                <span className="break-words">
                  {tour.operator === "own-operation" ? t("quotes.ownOperation") : tour.operator}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Adults</div>
                  <div className="font-medium">{tour.adultPax}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCurrencySymbol(currency || "CLP")} {tour.adultPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Children</div>
                  <div className="font-medium">{tour.childPax}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCurrencySymbol(currency || "CLP")} {tour.childPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Infants</div>
                  <div className="font-medium">{tour.infantPax}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCurrencySymbol(currency || "CLP")} {tour.infantPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              {t("quotes.noBookingsAdded")}
            </div>
          )}
        </div>

        {/* Desktop Table Layout - Hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">{t("quotes.tour")}</TableHead>
                <TableHead className="min-w-[100px]">{t("quotes.operationDate")}</TableHead>
                <TableHead className="min-w-[80px]">{t("quotes.operator")}</TableHead>
                <TableHead className="min-w-[60px] text-center">{t("quotes.adultPax")}</TableHead>
                <TableHead className="min-w-[80px] text-right">{t("quotes.adultPrice")}</TableHead>
                <TableHead className="min-w-[60px] text-center">{t("quotes.childPax")}</TableHead>
                <TableHead className="min-w-[80px] text-right">{t("quotes.childPrice")}</TableHead>
                <TableHead className="min-w-[60px] text-center">{t("quotes.infantPax")}</TableHead>
                <TableHead className="min-w-[80px] text-right">{t("quotes.infantPrice")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.length > 0 ? tours.map((tour) => (
                <TableRow key={tour.id}>
                  <TableCell className="max-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-medium text-sm break-words">{tour.tourName}</div>
                      {tour.pickupTime && (
                        <div className="text-xs text-muted-foreground">
                          {tour.pickupTime}
                        </div>
                      )}
                      {tour.pickupAddress && (
                        <div className="text-xs text-muted-foreground break-words flex items-center">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{tour.pickupAddress}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(tour.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {tour.operator === "own-operation" && (
                        <Building className="w-3 h-3 flex-shrink-0" />
                      )}
                      <span className="text-xs truncate">
                        {tour.operator === "own-operation"
                          ? t("quotes.ownOperation")
                          : tour.operator}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{tour.adultPax}</TableCell>
                  <TableCell className="text-right text-sm">
                    <div className="break-words">
                      {getCurrencySymbol(currency || "CLP")} {tour.adultPrice.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{tour.childPax}</TableCell>
                  <TableCell className="text-right text-sm">
                    <div className="break-words">
                      {getCurrencySymbol(currency || "CLP")} {tour.childPrice.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{tour.infantPax}</TableCell>
                  <TableCell className="text-right text-sm">
                    <div className="break-words">
                      {getCurrencySymbol(currency || "CLP")} {tour.infantPrice.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {t("quotes.noBookingsAdded")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <span className="text-lg sm:text-xl font-bold">
              {t("quotes.grandTotal")}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-green-600 break-words">
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