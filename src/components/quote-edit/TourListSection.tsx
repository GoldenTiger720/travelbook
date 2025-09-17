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
      <CardContent>
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("quotes.operationDate")}</TableHead>
                <TableHead>{t("quotes.pickupTime")}</TableHead>
                <TableHead>{t("quotes.tour")}</TableHead>
                <TableHead>{t("quotes.operator")}</TableHead>
                <TableHead className="text-center">
                  {t("quotes.adultPax")}
                </TableHead>
                <TableHead className="text-right">
                  {t("quotes.adultPrice")}
                </TableHead>
                <TableHead className="text-center">
                  {t("quotes.childPax")}
                </TableHead>
                <TableHead className="text-right">
                  {t("quotes.childPrice")}
                </TableHead>
                <TableHead className="text-center">
                  {t("quotes.infantPax")}
                </TableHead>
                <TableHead className="text-right">
                  {t("quotes.infantPrice")}
                </TableHead>
                <TableHead className="text-right">
                  {t("quotes.subTotal")}
                </TableHead>
                <TableHead className="text-center">
                  {t("quotes.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((tour) => (
                <TableRow key={tour.id}>
                  <TableCell>{format(new Date(tour.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{tour.pickupTime || "-"}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tour.tourName}</div>
                      {tour.pickupAddress && (
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {tour.pickupAddress}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {tour.operator === "own-operation" && (
                        <Building className="w-3 h-3" />
                      )}
                      <span className="text-sm">
                        {tour.operator === "own-operation"
                          ? t("quotes.ownOperation")
                          : tour.operator}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {tour.adultPax}
                  </TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(currency || "CLP")}{" "}
                    {tour.adultPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {tour.childPax}
                  </TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(currency || "CLP")}{" "}
                    {tour.childPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {tour.infantPax}
                  </TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(currency || "CLP")}{" "}
                    {tour.infantPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {getCurrencySymbol(currency || "CLP")}{" "}
                    {tour.subtotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        disabled
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card Layout - Visible only on mobile and tablets */}
        <div className="lg:hidden space-y-4">
          {tours.map((tour) => (
            <Card key={tour.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-base">
                      {tour.tourName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(tour.date), "dd/MM/yyyy")}
                      {tour.pickupTime && ` • ${tour.pickupTime}`}
                    </div>
                    {tour.pickupAddress && (
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {tour.pickupAddress}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      disabled
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.adultPax")}
                      </div>
                      <div className="font-medium">{tour.adultPax}</div>
                      <div className="text-xs text-muted-foreground">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.adultPrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.childPax")}
                      </div>
                      <div className="font-medium">{tour.childPax}</div>
                      <div className="text-xs text-muted-foreground">
                        {getCurrencySymbol(currency || "CLP")}{" "}
                        {tour.childPrice.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {t("quotes.infantPax")}
                      </div>
                      <div className="font-medium">{tour.infantPax}</div>
                      <div className="text-xs text-muted-foreground">
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
                      <span className="font-bold text-lg text-green-600">
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
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
              {t("quotes.grandTotal")}
            </span>
            <span className="text-2xl font-bold text-green-600">
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