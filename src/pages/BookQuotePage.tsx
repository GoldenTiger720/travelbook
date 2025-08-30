import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  CalendarIcon, 
  AlertCircle, 
  Trash2, 
  Edit2, 
  Plus,
  MapPin
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { quoteService } from "@/services/quoteService"
import { tourCatalogService } from "@/services/tourCatalogService"
import { Tour, TourBooking } from "@/types/tour"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BookQuotePage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [assignFromExternal, setAssignFromExternal] = useState(false)
  const [hasMultipleAddresses, setHasMultipleAddresses] = useState(false)
  const [availableTours, setAvailableTours] = useState<Tour[]>([])
  const [selectedDestination, setSelectedDestination] = useState("")
  const [destinations, setDestinations] = useState<string[]>([])
  const [editingTourId, setEditingTourId] = useState<string | null>(null)
  
  // Customer data
  const [formData, setFormData] = useState({
    salesperson: "",
    currency: "CLP",
    origin: "",
    name: "",
    idPassport: "",
    email: "",
    phone: "",
    language: "",
    countryOfOrigin: "",
    address: "",
    cpf: "",
    defaultHotel: "",
    defaultRoom: "",
    accommodationComments: ""
  })

  // Current tour being added/edited
  const [currentTour, setCurrentTour] = useState({
    tourId: "",
    date: undefined as Date | undefined,
    pickupAddress: "",
    pickupTime: "",
    adultPax: 1,
    adultPrice: 0,
    childPax: 0,
    childPrice: 0,
    infantPax: 0,
    infantPrice: 0,
    comments: ""
  })

  // List of added tours
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([])

  useEffect(() => {
    loadTourData()
  }, [])

  useEffect(() => {
    if (selectedDestination) {
      loadToursByDestination(selectedDestination)
    }
  }, [selectedDestination])

  const loadTourData = async () => {
    const tours = await tourCatalogService.getAllTours()
    const dests = await tourCatalogService.getDestinations()
    setAvailableTours(tours)
    setDestinations(dests)
  }

  const loadToursByDestination = async (destination: string) => {
    const tours = await tourCatalogService.getToursByDestination(destination)
    setAvailableTours(tours)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTourFieldChange = (field: string, value: any) => {
    setCurrentTour(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTourSelection = async (tourId: string) => {
    const tour = await tourCatalogService.getTourById(tourId)
    if (tour) {
      const currency = formData.currency || tour.basePricing.currency
      let adultPrice = tour.basePricing.adultPrice
      let childPrice = tour.basePricing.childPrice
      let infantPrice = tour.basePricing.infantPrice

      // Convert prices if currencies don't match
      if (currency !== tour.basePricing.currency) {
        // Simple conversion for demo (in real app, use actual exchange rates)
        const conversionRates: { [key: string]: { [key: string]: number } } = {
          'CLP': { 'ARS': 0.35, 'USD': 0.0012, 'EUR': 0.0011, 'BRL': 0.006 },
          'ARS': { 'CLP': 2.85, 'USD': 0.0034, 'EUR': 0.0031, 'BRL': 0.017 },
          'USD': { 'CLP': 850, 'ARS': 295, 'EUR': 0.92, 'BRL': 5.1 },
          'EUR': { 'CLP': 920, 'ARS': 320, 'USD': 1.09, 'BRL': 5.5 },
          'BRL': { 'CLP': 170, 'ARS': 59, 'USD': 0.20, 'EUR': 0.18 }
        }
        
        const rate = conversionRates[tour.basePricing.currency]?.[currency] || 1
        adultPrice = Math.round(adultPrice * rate)
        childPrice = Math.round(childPrice * rate)
        infantPrice = Math.round(infantPrice * rate)
      }

      setCurrentTour(prev => ({
        ...prev,
        tourId,
        adultPrice,
        childPrice,
        infantPrice,
        pickupTime: tour.defaultPickupTime || prev.pickupTime
      }))
    }
  }

  const calculateSubtotal = (tour: typeof currentTour) => {
    const adultTotal = (tour.adultPax || 0) * (tour.adultPrice || 0)
    const childTotal = (tour.childPax || 0) * (tour.childPrice || 0)
    const infantTotal = (tour.infantPax || 0) * (tour.infantPrice || 0)
    return adultTotal + childTotal + infantTotal
  }

  const calculateGrandTotal = () => {
    return tourBookings.reduce((total, tour) => total + tour.subtotal, 0)
  }

  const addTour = async () => {
    if (!currentTour.tourId || !currentTour.date) {
      toast({
        title: "Validation Error",
        description: "Please select a tour and date",
        variant: "destructive"
      })
      return
    }

    const tour = await tourCatalogService.getTourById(currentTour.tourId)
    if (!tour) return

    const newTourBooking: TourBooking = {
      id: editingTourId || Date.now().toString(),
      tourId: currentTour.tourId,
      tourName: tour.name,
      tourCode: tour.code,
      date: currentTour.date,
      pickupAddress: hasMultipleAddresses ? currentTour.pickupAddress : formData.defaultHotel,
      pickupTime: currentTour.pickupTime,
      adultPax: currentTour.adultPax || 0,
      adultPrice: currentTour.adultPrice || 0,
      childPax: currentTour.childPax || 0,
      childPrice: currentTour.childPrice || 0,
      infantPax: currentTour.infantPax || 0,
      infantPrice: currentTour.infantPrice || 0,
      subtotal: calculateSubtotal(currentTour),
      comments: currentTour.comments
    }

    if (editingTourId) {
      setTourBookings(prev => 
        prev.map(t => t.id === editingTourId ? newTourBooking : t)
      )
      setEditingTourId(null)
    } else {
      setTourBookings(prev => [...prev, newTourBooking])
    }

    // Reset form
    setCurrentTour({
      tourId: "",
      date: undefined,
      pickupAddress: "",
      pickupTime: "",
      adultPax: 1,
      adultPrice: 0,
      childPax: 0,
      childPrice: 0,
      infantPax: 0,
      infantPrice: 0,
      comments: ""
    })
  }

  const editTour = (tour: TourBooking) => {
    setCurrentTour({
      tourId: tour.tourId,
      date: tour.date,
      pickupAddress: tour.pickupAddress || "",
      pickupTime: tour.pickupTime || "",
      adultPax: tour.adultPax,
      adultPrice: tour.adultPrice,
      childPax: tour.childPax,
      childPrice: tour.childPrice,
      infantPax: tour.infantPax,
      infantPrice: tour.infantPrice,
      comments: tour.comments || ""
    })
    setEditingTourId(tour.id)
  }

  const deleteTour = (tourId: string) => {
    setTourBookings(prev => prev.filter(t => t.id !== tourId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (tourBookings.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one tour to the booking",
          variant: "destructive"
        })
        setSubmitting(false)
        return
      }

      // Create quote with new structure
      const quoteData = {
        customer: {
          name: formData.name || "Guest",
          email: formData.email || "noemail@example.com",
          phone: formData.phone || "",
          language: formData.language || "en",
          country: formData.countryOfOrigin || "",
          idNumber: formData.idPassport || "",
          cpf: formData.cpf || "",
          address: formData.address || ""
        },
        tours: tourBookings,
        tourDetails: {
          destination: tourBookings[0].tourName,
          tourType: tourBookings[0].tourCode,
          startDate: tourBookings[0].date,
          endDate: tourBookings[tourBookings.length - 1].date,
          passengers: tourBookings[0].adultPax + tourBookings[0].childPax + tourBookings[0].infantPax,
          hotel: formData.defaultHotel || "",
          room: formData.defaultRoom || ""
        },
        pricing: {
          amount: calculateGrandTotal(),
          currency: formData.currency || "CLP"
        },
        leadSource: "website",
        assignedTo: formData.salesperson || "Thiago Andrade",
        agency: assignFromExternal ? "External Agency" : undefined,
        status: "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        additionalNotes: formData.accommodationComments,
        hasMultipleAddresses,
        termsAccepted: {
          accepted: false
        }
      }

      const newQuote = await quoteService.createQuote(quoteData)
      
      toast({
        title: "Booking Created",
        description: `Quote #${newQuote.quoteNumber} has been created with ${tourBookings.length} tour(s).`
      })

      navigate(`/quotes/${newQuote.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      CLP: 'CLP$',
      USD: 'USD$',
      EUR: '€',
      BRL: 'R$',
      ARS: 'ARS$'
    }
    return symbols[currency] || currency + '$'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book Quotation</h1>
        <p className="text-muted-foreground">Create a new booking or quotation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Booking or quotation configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="external-agency">Assign from external agency</Label>
              <Switch
                id="external-agency"
                checked={assignFromExternal}
                onCheckedChange={setAssignFromExternal}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salesperson">Salesperson</Label>
                <Select value={formData.salesperson} onValueChange={(value) => handleInputChange("salesperson", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thiago">Thiago Andrade</SelectItem>
                    <SelectItem value="maria">Maria Silva</SelectItem>
                    <SelectItem value="juan">Juan Rodriguez</SelectItem>
                    <SelectItem value="ana">Ana Martinez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="CLP$ - Chilean pesos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">CLP$ - Chilean pesos</SelectItem>
                    <SelectItem value="USD">USD$ - US Dollars</SelectItem>
                    <SelectItem value="EUR">EUR€ - Euros</SelectItem>
                    <SelectItem value="BRL">R$ - Brazilian reais</SelectItem>
                    <SelectItem value="ARS">ARS$ - Argentine pesos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">Origin</Label>
                <Select value={formData.origin} onValueChange={(value) => handleInputChange("origin", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Juan Diaz"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="idPassport">DNI/CPF/CNPJ</Label>
                <Input
                  id="idPassport"
                  placeholder="11.111.111-X"
                  value={formData.idPassport}
                  onChange={(e) => handleInputChange("idPassport", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+56 9 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countryOfOrigin">Country of origin</Label>
                <Input
                  id="countryOfOrigin"
                  placeholder="Chile"
                  value={formData.countryOfOrigin}
                  onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder=""
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address, City, Country"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="multiple-addresses" className="text-base font-medium">
                    Different pickup address for each tour
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable if passenger stays at different hotels during the trip
                  </p>
                </div>
                <Switch
                  id="multiple-addresses"
                  checked={hasMultipleAddresses}
                  onCheckedChange={setHasMultipleAddresses}
                />
              </div>

              {!hasMultipleAddresses && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultHotel">Default Hotel/Accommodation</Label>
                      <Input
                        id="defaultHotel"
                        placeholder="e.g., Hotel Icon, Airbnb Las Condes"
                        value={formData.defaultHotel}
                        onChange={(e) => handleInputChange("defaultHotel", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="defaultRoom">Room/Unit Number</Label>
                      <Input
                        id="defaultRoom"
                        placeholder="e.g., 1503, Apt 2B"
                        value={formData.defaultRoom}
                        onChange={(e) => handleInputChange("defaultRoom", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accommodationComments">Accommodation Comments</Label>
                    <Textarea
                      id="accommodationComments"
                      rows={3}
                      placeholder="Additional details (check-in time, special instructions, contact info, etc.)"
                      value={formData.accommodationComments}
                      onChange={(e) => handleInputChange("accommodationComments", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Add Tour Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Destination</Label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map(dest => (
                      <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tour</Label>
                <Select 
                  value={currentTour.tourId} 
                  onValueChange={handleTourSelection}
                  disabled={!selectedDestination}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTours.map(tour => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.name} ({tour.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
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
                      {currentTour.date ? format(currentTour.date, "dd/MM/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentTour.date}
                      onSelect={(date) => handleTourFieldChange("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {hasMultipleAddresses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Pickup Address for this tour
                  </Label>
                  <Input
                    placeholder="Hotel name or street address"
                    value={currentTour.pickupAddress}
                    onChange={(e) => handleTourFieldChange("pickupAddress", e.target.value)}
                    className="border-blue-300"
                  />
                </div>

                <div>
                  <Label>Pickup Time</Label>
                  <Input
                    type="time"
                    value={currentTour.pickupTime}
                    onChange={(e) => handleTourFieldChange("pickupTime", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>Adults PAX</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.adultPax}
                  onChange={(e) => handleTourFieldChange("adultPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Adult Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.adultPrice}
                  onChange={(e) => handleTourFieldChange("adultPrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Children PAX</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.childPax}
                  onChange={(e) => handleTourFieldChange("childPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Child Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.childPrice}
                  onChange={(e) => handleTourFieldChange("childPrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Infants PAX</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.infantPax}
                  onChange={(e) => handleTourFieldChange("infantPax", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Infant Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentTour.infantPrice}
                  onChange={(e) => handleTourFieldChange("infantPrice", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label>Comments for this tour</Label>
              <Textarea
                rows={2}
                placeholder="Special requests, dietary requirements, etc."
                value={currentTour.comments}
                onChange={(e) => handleTourFieldChange("comments", e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                Subtotal: {getCurrencySymbol(formData.currency)} {calculateSubtotal(currentTour).toLocaleString()}
              </div>
              <Button 
                type="button"
                onClick={addTour}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingTourId ? "Update Tour" : "Add Tour"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {tourBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Tour Bookings List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation Date</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead className="text-center">Adult PAX</TableHead>
                    <TableHead className="text-right">Adult Price</TableHead>
                    <TableHead className="text-center">Child PAX</TableHead>
                    <TableHead className="text-right">Child Price</TableHead>
                    <TableHead className="text-center">Infant PAX</TableHead>
                    <TableHead className="text-right">Infant Price</TableHead>
                    <TableHead className="text-right">Sub-Total</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tourBookings.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell>{format(tour.date, "dd/MM/yyyy")}</TableCell>
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
                      <TableCell className="text-center">{tour.adultPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.adultPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{tour.childPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.childPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">{tour.infantPax}</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(formData.currency)} {tour.infantPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {getCurrencySymbol(formData.currency)} {tour.subtotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editTour(tour)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTour(tour.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">GRAND TOTAL</span>
                  <span className="text-2xl font-bold text-green-600">
                    {getCurrencySymbol(formData.currency)} {calculateGrandTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please ensure all tour details are correct before submitting. Each tour must have at least one passenger (adult, child, or infant) and valid pricing information.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/my-quotes")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-8"
            disabled={submitting || tourBookings.length === 0}
          >
            {submitting ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BookQuotePage