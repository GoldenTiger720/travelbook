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
      <CardContent className="overflow-x-hidden">
        {/* Responsive Table Layout */}
        <div className="overflow-x-auto">
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