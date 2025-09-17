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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Trash2,
  Edit2,
  Plus,
  MapPin,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const QuoteEditFormPage = () => {
  const { t } = useLanguage();

  // Sample data for display purposes
  const sampleBooking = {
    id: "555e486b-c39e-4bf7-ac6c-a35fd1b7c370",
    customer: {
      id: "20f8f3a0-c685-4633-a549-51e971ab598b",
      name: "John Doe",
      email: "mason@gmail.com",
      phone: "+56 5 6565 6564",
      language: "pt",
      country: "China",
      idNumber: "222.234.344-R",
      cpf: "222",
      address: "101 Street1",
      company: "",
      location: "",
      status: "active",
      totalBookings: 0,
      totalSpent: 0.0,
      lastBooking: null,
      notes: "",
      avatar: "",
      createdAt: "2025-09-11T02:45:15.809022Z",
      updatedAt: "2025-09-16T22:15:00.636559Z"
    },
    tours: [
      {
        id: "1758060207725",
        tourId: "8",
        tourName: "Seven Lakes Route",
        tourCode: "BAR-7L01",
        date: "2025-09-23T21:00:00Z",
        pickupAddress: "101 Street1",
        pickupTime: "08:00",
        adultPax: 1,
        adultPrice: 1105.0,
        childPax: 0,
        childPrice: 680.0,
        infantPax: 0,
        infantPrice: 0.0,
        subtotal: 1105.0,
        operator: "others",
        comments: "",
        createdAt: "2025-09-16T22:03:34.314817Z",
        updatedAt: "2025-09-16T22:03:34.314829Z"
      }
    ],
    tourDetails: {
      destination: "Seven Lakes Route",
      tourType: "BAR-7L01",
      startDate: "2025-09-23T21:00:00Z",
      endDate: "2025-09-23T21:00:00Z",
      passengers: 1,
      passengerBreakdown: {
        adults: 1,
        children: 0,
        infants: 0
      },
      hotel: "Hotel 2",
      room: "44"
    },
    pricing: {
      amount: 1105.0,
      currency: "BRL",
      breakdown: [
        {
          item: "Seven Lakes Route - Adults",
          quantity: 1,
          unitPrice: 1105.0,
          total: 1105.0
        }
      ]
    },
    leadSource: "youtube",
    assignedTo: "ana",
    agency: null,
    status: "confirmed",
    validUntil: new Date("2025-10-16T22:02:05.852000Z"),
    additionalNotes: "",
    hasMultipleAddresses: false,
    termsAccepted: {
      accepted: false
    },
    quotationComments: "",
    includePayment: false,
    copyComments: true,
    sendPurchaseOrder: true,
    sendQuotationAccess: true,
    paymentDetails: {
      date: new Date(),
      method: "",
      percentage: 50,
      amountPaid: 0,
      comments: "",
      status: "",
      receiptFile: null
    },
    allPayments: [],
    bookingOptions: {
      copyComments: true,
      includePayment: false,
      quoteComments: "",
      sendPurchaseOrder: true,
      sendQuotationAccess: true
    },
    createdBy: {
      id: "d20681e4-1ad5-4b66-b6f4-7f25f8bb03d3",
      email: "mason@gmail.com",
      fullName: "Mason Lee",
      phone: null,
      company: null
    },
    createdAt: "2025-09-16T22:03:34.118644Z",
    updatedAt: "2025-09-16T22:03:34.118653Z"
  };

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
    return (sampleBooking.tours || []).reduce((total: number, tour: any) => total + (tour.subtotal || 0), 0);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold">Edit Quote</h1>
        <p className="text-muted-foreground">Update quote information and tours</p>
      </div>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {t("quotes.configTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salesperson">{t("quotes.salesperson")}</Label>
                <Select value={sampleBooking.assignedTo || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("quotes.selectSalesperson")} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      {t("quotes.internalTeam")}
                    </div>
                    <SelectItem value="thiago">Thiago Andrade</SelectItem>
                    <SelectItem value="ana">Ana Martinez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Travel Plus
                    </div>
                    <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      World Tours
                    </div>
                    <SelectItem value="ana-silva">Ana Silva</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Adventure Agency
                    </div>
                    <SelectItem value="sofia">Sofia Gonzalez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Sunset Travel
                    </div>
                    <SelectItem value="juan">Juan Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">{t("quotes.currency")}</Label>
                <Select value={sampleBooking.pricing?.currency || "CLP"}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("quotes.chileanPesos")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">
                      {t("quotes.chileanPesos")}
                    </SelectItem>
                    <SelectItem value="USD">{t("quotes.usDollars")}</SelectItem>
                    <SelectItem value="EUR">{t("quotes.euros")}</SelectItem>
                    <SelectItem value="BRL">
                      {t("quotes.brazilianReais")}
                    </SelectItem>
                    <SelectItem value="ARS">
                      {t("quotes.argentinePesos")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">{t("quotes.origin")}</Label>
                <Select value={sampleBooking.leadSource || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("quotes.selectOrigin")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">
                      {t("quotes.instagram")}
                    </SelectItem>
                    <SelectItem value="youtube">
                      {t("quotes.youtube")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {t("quotes.clientInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t("quotes.fullName")}</Label>
                <Input
                  id="name"
                  placeholder={t("quotes.fullNamePlaceholder")}
                  value={sampleBooking.customer?.name || ""}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="idPassport">{t("quotes.idPassport")}</Label>
                <Input
                  id="idPassport"
                  placeholder={t("quotes.idPassportPlaceholder")}
                  value={sampleBooking.customer?.idNumber || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">{t("quotes.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("quotes.emailPlaceholder")}
                  value={sampleBooking.customer?.email || ""}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="phone">{t("quotes.phone")}</Label>
                <Input
                  id="phone"
                  placeholder={t("quotes.phonePlaceholder")}
                  value={sampleBooking.customer?.phone || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="language">{t("quotes.language")}</Label>
                <Select value={sampleBooking.customer?.language || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("quotes.selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t("quotes.spanish")}</SelectItem>
                    <SelectItem value="en">{t("quotes.english")}</SelectItem>
                    <SelectItem value="pt">{t("quotes.portuguese")}</SelectItem>
                    <SelectItem value="fr">{t("quotes.french")}</SelectItem>
                    <SelectItem value="de">{t("quotes.german")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countryOfOrigin">
                  {t("quotes.countryOfOrigin")}
                </Label>
                <Input
                  id="countryOfOrigin"
                  placeholder={t("quotes.countryPlaceholder")}
                  value={sampleBooking.customer?.country || ""}
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="cpf">{t("quotes.cpf")}</Label>
                <Input
                  id="cpf"
                  placeholder=""
                  value={sampleBooking.customer?.cpf || ""}
                  readOnly
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">{t("quotes.address")}</Label>
              <Input
                id="address"
                placeholder={t("quotes.addressPlaceholder")}
                value={sampleBooking.customer?.address || ""}
                readOnly
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultHotel">
                    {t("quotes.defaultHotel")}
                  </Label>
                  <Input
                    id="defaultHotel"
                    placeholder={t("quotes.hotelPlaceholder")}
                    value={sampleBooking.tourDetails?.hotel || ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="defaultRoom">{t("quotes.roomNumber")}</Label>
                  <Input
                    id="defaultRoom"
                    placeholder={t("quotes.roomPlaceholder")}
                    value={sampleBooking.tourDetails?.room || ""}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accommodationComments">
                  {t("quotes.accommodationComments")}
                </Label>
                <Textarea
                  id="accommodationComments"
                  rows={3}
                  placeholder={t("quotes.accommodationPlaceholder")}
                  value={sampleBooking.additionalNotes || ""}
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
                Subtotal: {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
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
                  {sampleBooking.tours.map((tour) => (
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
                        {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                        {tour.adultPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {tour.childPax}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                        {tour.childPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {tour.infantPax}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                        {tour.infantPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
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
              {sampleBooking.tours.map((tour) => (
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
                            {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                            {tour.adultPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            {t("quotes.childPax")}
                          </div>
                          <div className="font-medium">{tour.childPax}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                            {tour.childPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            {t("quotes.infantPax")}
                          </div>
                          <div className="font-medium">{tour.infantPax}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
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
                            {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
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
                  {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}{" "}
                  {calculateGrandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Section - Only show when Include Payment is enabled */}
        {sampleBooking.includePayment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {t("quotes.paymentDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Payment Date */}
                <div>
                  <Label htmlFor="payment-date" className="text-sm font-medium">
                    {t("quotes.paymentDate")}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                        disabled
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(), "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Payment Method */}
                <div>
                  <Label
                    htmlFor="payment-method"
                    className="text-sm font-medium"
                  >
                    {t("quotes.paymentMethod")}
                  </Label>
                  <Select value="">
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t("quotes.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">
                        {t("quotes.creditCard")}
                      </SelectItem>
                      <SelectItem value="bank-transfer">
                        {t("quotes.bankTransfer")}
                      </SelectItem>
                      <SelectItem value="cash-office">
                        {t("quotes.cashOffice")}
                      </SelectItem>
                      <SelectItem value="mercado-pago">
                        {t("quotes.mercadoPago")}
                      </SelectItem>
                      <SelectItem value="van-is-broken">
                        {t("quotes.vanIsBroken")}
                      </SelectItem>
                      <SelectItem value="pix">{t("quotes.pix")}</SelectItem>
                      <SelectItem value="test">{t("quotes.test")}</SelectItem>
                      <SelectItem value="transfer">
                        {t("quotes.transfer")}
                      </SelectItem>
                      <SelectItem value="nubank-transfer">
                        {t("quotes.nubankTransfer")}
                      </SelectItem>
                      <SelectItem value="wise">{t("quotes.wise")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Price */}
                <div>
                  <Label className="text-sm font-medium">
                    {t("quotes.totalPrice")}{" "}
                    {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}
                  </Label>
                  <div className="mt-1 p-2 bg-green-100 border rounded-md">
                    <span className="font-semibold">
                      {calculateGrandTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div>
                  <Label
                    htmlFor="payment-percentage"
                    className="text-sm font-medium"
                  >
                    {t("quotes.percentage")}
                  </Label>
                  <Input
                    id="payment-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={50}
                    className="mt-1"
                    readOnly
                  />
                </div>

                {/* Amount Paid */}
                <div>
                  <Label htmlFor="amount-paid" className="text-sm font-medium">
                    {t("quotes.amountPaid")}{" "}
                    {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}
                  </Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    min="0"
                    value={0}
                    className="mt-1"
                    readOnly
                  />
                </div>

                {/* Amount Pending */}
                <div>
                  <Label className="text-sm font-medium">
                    {t("quotes.amountPending")}{" "}
                    {getCurrencySymbol(sampleBooking.pricing?.currency || "CLP")}
                  </Label>
                  <div className="mt-1 p-2 bg-gray-100 border rounded-md">
                    <span className="font-semibold text-red-600">
                      {(calculateGrandTotal() - 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Receipt Upload */}
                <div>
                  <Label
                    htmlFor="receipt-upload"
                    className="text-sm font-medium"
                  >
                    {t("quotes.receipt")}
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
                      disabled
                    />
                    <span className="text-xs text-gray-500">
                      {t("quotes.noFileChosen")}
                    </span>
                  </div>
                </div>

                {/* Payment Comments */}
                <div>
                  <Label
                    htmlFor="payment-comments"
                    className="text-sm font-medium"
                  >
                    {t("quotes.commentsOnPayment")}
                  </Label>
                  <Textarea
                    id="payment-comments"
                    rows={3}
                    className="mt-1"
                    placeholder={t("quotes.paymentCommentsPlaceholder")}
                    value=""
                    readOnly
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <Label
                    htmlFor="payment-status"
                    className="text-sm font-medium"
                  >
                    {t("quotes.paymentStatus")}
                  </Label>
                  <Select value="">
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t("quotes.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t("quotes.pending")}
                      </SelectItem>
                      <SelectItem value="partial">
                        {t("quotes.partial")}
                      </SelectItem>
                      <SelectItem value="paid">{t("quotes.paid")}</SelectItem>
                      <SelectItem value="refunded">
                        {t("quotes.refunded")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("quotes.cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Options Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="include-payment"
                    className="text-base font-medium"
                  >
                    {t("quotes.includePayment")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include-payment"
                      checked={sampleBooking.includePayment || false}
                      className="data-[state=unchecked]:bg-red-500"
                      disabled
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {sampleBooking.includePayment ? t("quotes.yes") : t("quotes.no")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="copy-comments"
                    className="text-base font-medium"
                  >
                    {t("quotes.copyCommentsToOrder")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="copy-comments"
                      checked={sampleBooking.copyComments !== undefined ? sampleBooking.copyComments : true}
                      className="data-[state=checked]:bg-green-500"
                      disabled
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {(sampleBooking.copyComments !== undefined ? sampleBooking.copyComments : true) ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="send-purchase-order"
                      className="text-base font-medium"
                    >
                      {t("quotes.sendPurchaseOrderAccess")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="send-purchase-order"
                        checked={sampleBooking.sendPurchaseOrder !== undefined ? sampleBooking.sendPurchaseOrder : true}
                        className="data-[state=checked]:bg-green-500"
                        disabled
                      />
                      <span className="text-sm font-medium min-w-[30px]">
                        {(sampleBooking.sendPurchaseOrder !== undefined ? sampleBooking.sendPurchaseOrder : true) ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-0">
                    {sampleBooking.customer?.email || "admin@teampulse.com"}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    {t("quotes.reserve")}
                  </Button>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-green-500">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium text-green-700">
                      {t("quotes.readyToBook")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label
                      htmlFor="valid-until"
                      className="text-base font-medium"
                    >
                      {t("quotes.validUntil")}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-2"
                          disabled
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(sampleBooking.validUntil, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={sampleBooking.validUntil}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label
                      htmlFor="quotation-comments"
                      className="text-base font-medium"
                    >
                      {t("quotes.commentsOnQuotation")}
                    </Label>
                    <Textarea
                      id="quotation-comments"
                      rows={1}
                      className="mt-2 min-h-[40px] resize-none"
                      placeholder={t("quotes.quotationCommentsPlaceholder")}
                      value={sampleBooking.quotationComments || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="send-quotation-access"
                      className="text-base font-medium"
                    >
                      {t("quotes.sendQuotationAccess")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="send-quotation-access"
                        checked={sampleBooking.sendQuotationAccess !== undefined ? sampleBooking.sendQuotationAccess : true}
                        className="data-[state=checked]:bg-green-500"
                        disabled
                      />
                      <span className="text-sm font-medium min-w-[30px]">
                        {(sampleBooking.sendQuotationAccess !== undefined ? sampleBooking.sendQuotationAccess : true) ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-0">
                    {sampleBooking.customer?.email || "admin@teampulse.com"}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Update Quotation
                  </Button>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-green-500">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium text-green-700">
                      {t("quotes.readyToQuote")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default QuoteEditFormPage;