import React from "react"
import { format } from "date-fns"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarIcon,
  Trash2,
  Edit2,
  Plus,
  MapPin,
  Building
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tour, TourBooking } from "@/types/tour"

interface DestinationTour {
  id: string
  name: string
  description: string
  adult_price: string
  child_price: string
  currency: string
  starting_point: string
  departure_time: string
  capacity: number
  active: boolean
  created_at: string
  updated_at: string
}

interface Destination {
  id: string
  name: string
  country: string
  region: string
  language: string
  status: string
  created_at: string
  updated_at: string
  tours: DestinationTour[]
  tours_count: number
}

interface CurrentTour {
  tourId: string
  date: Date | undefined
  pickupAddress: string
  pickupTime: string
  adultPax: number
  adultPrice: number
  childPax: number
  childPrice: number
  infantPax: number
  infantPrice: number
  operator: string
  comments: string
}

interface Supplier {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
}

interface TourSelectionProps {
  destinations: Destination[]
  availableTours: (DestinationTour | Tour)[]
  selectedDestination: string
  currentTour: CurrentTour
  tourBookings: TourBooking[]
  editingTourId: string | null
  currency: string
  defaultHotel: string
  suppliers?: Supplier[]
  onDestinationChange: (destination: string) => void
  onTourSelection: (tourId: string) => void
  onTourFieldChange: (field: string, value: string | number | Date | undefined) => void
  onAddTour: () => void
  onEditTour: (tour: TourBooking) => void
  onDeleteTour: (tourId: string) => void
  getCurrencySymbol: (currency: string) => string
  calculateSubtotal: (tour: CurrentTour) => number
  calculateGrandTotal: () => number
}

const TourSelection: React.FC<TourSelectionProps> = ({
  destinations,
  availableTours,
  selectedDestination,
  currentTour,
  tourBookings,
  editingTourId,
  currency,
  defaultHotel,
  suppliers = [],
  onDestinationChange,
  onTourSelection,
  onTourFieldChange,
  onAddTour,
  onEditTour,
  onDeleteTour,
  getCurrencySymbol,
  calculateSubtotal,
  calculateGrandTotal
}) => {
  const { t } = useLanguage()

  return (
    <>
      {/* Tour Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('quotes.addTourBooking')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>{t('quotes.destination')}</Label>
              <Select value={selectedDestination} onValueChange={onDestinationChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('quotes.selectDestination')} />
                </SelectTrigger>
                <SelectContent>
                  {destinations && destinations.length > 0 ? destinations.map((dest, index) => (
                    <SelectItem key={`dest-${dest.id}-${index}`} value={dest.name}>{dest.name}</SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('quotes.tour')}</Label>
              <Select
                value={currentTour.tourId}
                onValueChange={onTourSelection}
                disabled={!selectedDestination}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('quotes.selectTour')} />
                </SelectTrigger>
                <SelectContent>
                  {availableTours && availableTours.length > 0 ? availableTours.map((tour, index) => (
                    <SelectItem key={`tour-${tour.id}-${index}`} value={tour.id}>
                      {tour.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('quotes.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !currentTour.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentTour.date ? format(currentTour.date, "dd/MM/yyyy") : t('quotes.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentTour.date}
                    onSelect={(date) => onTourFieldChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t('quotes.operator')}</Label>
              <Select
                value={currentTour.operator}
                onValueChange={(value) => onTourFieldChange("operator", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('quotes.selectOperator')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own-operation">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {t('quotes.ownOperation')}
                    </div>
                  </SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.full_name}>
                      {supplier.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('quotes.pickupAddress')}
              </Label>
              <Input
                placeholder={t('quotes.pickupPlaceholder')}
                value={currentTour.pickupAddress}
                onChange={(e) => onTourFieldChange("pickupAddress", e.target.value)}
                className="border-blue-300"
              />
            </div>

            <div>
              <Label>{t('quotes.pickupTime')}</Label>
              <Input
                type="time"
                value={currentTour.pickupTime}
                onChange={(e) => onTourFieldChange("pickupTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>{t('quotes.adultsPax')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.adultPax}
                onChange={(e) => onTourFieldChange("adultPax", parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>{t('quotes.adultPrice')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.adultPrice}
                onChange={(e) => onTourFieldChange("adultPrice", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>{t('quotes.childrenPax')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.childPax}
                onChange={(e) => onTourFieldChange("childPax", parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>{t('quotes.childPrice')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.childPrice}
                onChange={(e) => onTourFieldChange("childPrice", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>{t('quotes.infantsPax')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.infantPax}
                onChange={(e) => onTourFieldChange("infantPax", parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>{t('quotes.infantPrice')}</Label>
              <Input
                type="number"
                min="0"
                value={currentTour.infantPrice}
                onChange={(e) => onTourFieldChange("infantPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label>{t('quotes.tourComments')}</Label>
            <Textarea
              rows={2}
              placeholder={t('quotes.tourCommentsPlaceholder')}
              value={currentTour.comments}
              onChange={(e) => onTourFieldChange("comments", e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Subtotal: {getCurrencySymbol(currency)} {calculateSubtotal(currentTour).toLocaleString()}
            </div>
            <Button
              type="button"
              onClick={onAddTour}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingTourId ? t('quotes.updateTour') : t('quotes.addTour')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tour Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('quotes.tourBookingsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">{t('quotes.operationDate')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.pickupTime')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.tour')}</TableHead>
                  <TableHead className="text-sm">{t('quotes.operator')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.adultPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.adultPrice')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.childPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.childPrice')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.infantPax')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.infantPrice')}</TableHead>
                  <TableHead className="text-right text-sm">{t('quotes.subTotal')}</TableHead>
                  <TableHead className="text-center text-sm">{t('quotes.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tourBookings.length > 0 ? tourBookings.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>{format(tour.date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{tour.pickupTime || '-'}</TableCell>
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
                        {tour.operator === "own-operation" && <Building className="w-3 h-3" />}
                        <span className="text-sm">
                          {tour.operator === "own-operation" ? t('quotes.ownOperation') : tour.operator}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{tour.adultPax}</TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbol(currency)} {tour.adultPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">{tour.childPax}</TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbol(currency)} {tour.childPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">{tour.infantPax}</TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbol(currency)} {tour.infantPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {getCurrencySymbol(currency)} {tour.subtotal.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTour(tour)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTour(tour.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                      {t('quotes.noBookingsAdded')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout - Visible only on mobile and tablets */}
          <div className="lg:hidden space-y-4">
            {tourBookings.length > 0 ? tourBookings.map((tour) => (
              <Card key={tour.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-base">{tour.tourName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(tour.date, "dd/MM/yyyy")}
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
                        onClick={() => onEditTour(tour)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTour(tour.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {tour.operator === "own-operation" && <Building className="w-3 h-3" />}
                      <span className="text-muted-foreground">{t('quotes.operator')}:</span>
                      <span>{tour.operator === "own-operation" ? t('quotes.ownOperation') : tour.operator}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">{t('quotes.adultPax')}</div>
                        <div className="font-medium">{tour.adultPax}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCurrencySymbol(currency)} {tour.adultPrice.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('quotes.childPax')}</div>
                        <div className="font-medium">{tour.childPax}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCurrencySymbol(currency)} {tour.childPrice.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('quotes.infantPax')}</div>
                        <div className="font-medium">{tour.infantPax}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCurrencySymbol(currency)} {tour.infantPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{t('quotes.subTotal')}:</span>
                        <span className="font-bold text-lg text-green-600">
                          {getCurrencySymbol(currency)} {tour.subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center text-muted-foreground py-8">
                {t('quotes.noBookingsAdded')}
              </div>
            )}
          </div>

          {tourBookings.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">{t('quotes.grandTotal')}</span>
                <span className="text-2xl font-bold text-green-600">
                  {getCurrencySymbol(currency)} {calculateGrandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default TourSelection