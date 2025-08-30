import { useState } from "react"
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
import { CalendarIcon, AlertCircle, Plus, Trash2, MapPin } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { quoteService } from "@/services/quoteService"

interface TourBooking {
  id: string
  date: Date | undefined
  destination: string
  tour: string
  adultsPax: string
  adultsPrice: string
  childrenPax: string
  childrenPrice: string
  pickupAddress?: string
  comments: string
}

const BookQuotePage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [assignFromExternal, setAssignFromExternal] = useState(false)
  const [hasMultipleAddresses, setHasMultipleAddresses] = useState(false)
  
  const [formData, setFormData] = useState({
    salesperson: "",
    currency: "",
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
    defaultRoom: ""
  })

  const [tourBookings, setTourBookings] = useState<TourBooking[]>([
    {
      id: "1",
      date: undefined,
      destination: "",
      tour: "",
      adultsPax: "",
      adultsPrice: "",
      childrenPax: "",
      childrenPrice: "",
      pickupAddress: "",
      comments: ""
    }
  ])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTourChange = (tourId: string, field: keyof TourBooking, value: any) => {
    setTourBookings(prev => prev.map(tour => 
      tour.id === tourId ? { ...tour, [field]: value } : tour
    ))
  }

  const addTourBooking = () => {
    const newTour: TourBooking = {
      id: Date.now().toString(),
      date: undefined,
      destination: "",
      tour: "",
      adultsPax: "",
      adultsPrice: "",
      childrenPax: "",
      childrenPrice: "",
      pickupAddress: "",
      comments: ""
    }
    setTourBookings(prev => [...prev, newTour])
  }

  const removeTourBooking = (tourId: string) => {
    if (tourBookings.length > 1) {
      setTourBookings(prev => prev.filter(tour => tour.id !== tourId))
    }
  }

  const calculateTourSubtotal = (tour: TourBooking) => {
    const adults = parseFloat(tour.adultsPrice) || 0
    const adultsPax = parseFloat(tour.adultsPax) || 1
    const children = parseFloat(tour.childrenPrice) || 0
    const childrenPax = parseInt(tour.childrenPax) || 0
    return (adults * adultsPax) + (children * childrenPax)
  }

  const calculateGrandTotal = () => {
    return tourBookings.reduce((total, tour) => total + calculateTourSubtotal(tour), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate that at least one tour has required fields
      const validTours = tourBookings.filter(tour => 
        tour.destination && tour.tour && tour.adultsPrice
      )
      
      if (validTours.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one complete tour booking",
          variant: "destructive"
        })
        setSubmitting(false)
        return
      }

      // For now, we'll create a single quote with the first tour's details
      // In a real implementation, you might want to handle multiple tours differently
      const primaryTour = validTours[0]
      
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
        tourDetails: {
          destination: primaryTour.destination,
          tourType: primaryTour.tour,
          startDate: primaryTour.date || new Date(),
          endDate: primaryTour.date || new Date(),
          passengers: parseInt(primaryTour.adultsPax) || 1,
          hotel: formData.defaultHotel || "",
          room: formData.defaultRoom || "",
          // Store all tours information in additionalInfo
          allTours: tourBookings.map(tour => ({
            ...tour,
            subtotal: calculateTourSubtotal(tour)
          }))
        },
        pricing: {
          amount: calculateGrandTotal(),
          currency: formData.currency || "CLP",
          adultsPrice: parseFloat(primaryTour.adultsPrice) || 0,
          childrenPrice: parseFloat(primaryTour.childrenPrice) || 0,
          childrenCount: parseInt(primaryTour.childrenPax) || 0
        },
        leadSource: "website",
        assignedTo: formData.salesperson || "Thiago Andrade",
        agency: assignFromExternal ? "External Agency" : undefined,
        status: "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        additionalNotes: tourBookings.map((tour, index) => {
          let note = `Tour ${index + 1}: ${tour.tour} - ${tour.destination}`
          if (hasMultipleAddresses && tour.pickupAddress) {
            note += ` | Pickup: ${tour.pickupAddress}`
          }
          if (tour.comments) {
            note += ` | Notes: ${tour.comments}`
          }
          return note
        }).join('\n'),
        termsAccepted: {
          accepted: false
        }
      }

      const newQuote = await quoteService.createQuote(quoteData)
      
      toast({
        title: "Booking Created",
        description: `Quote #${newQuote.quoteNumber} has been created successfully with ${validTours.length} tour(s).`
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Booking or quotation configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salesperson">Salesperson</Label>
                <Select value={formData.salesperson} onValueChange={(value) => handleInputChange("salesperson", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Thiago Andrade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thiago Andrade">Thiago Andrade</SelectItem>
                    <SelectItem value="Sales Agent 1">Sales Agent 1</SelectItem>
                    <SelectItem value="Sales Agent 2">Sales Agent 2</SelectItem>
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
                    <SelectItem value="BRL">BRL R$ - Brazilian reais</SelectItem>
                    <SelectItem value="ARS">ARS$ - Argentine pesos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">Origen</Label>
                <Select value={formData.origin} onValueChange={(value) => handleInputChange("origin", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="external-agency">Assign booking origin from an external agency</Label>
              <Switch
                id="external-agency"
                checked={assignFromExternal}
                onCheckedChange={setAssignFromExternal}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Client's information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="name">Name and surname</Label>
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

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@mail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  placeholder="56975497307"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="countryOfOrigin">Country of origin</Label>
                <Select value={formData.countryOfOrigin} onValueChange={(value) => handleInputChange("countryOfOrigin", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chile">Chile</SelectItem>
                    <SelectItem value="argentina">Argentina</SelectItem>
                    <SelectItem value="brazil">Brazil</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Dirección Particular</Label>
                <Input
                  id="address"
                  placeholder="Alonso de Córdova 6050"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
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

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultHotel">Default Hotel/Accommodation</Label>
                  <Input
                    id="defaultHotel"
                    placeholder="Hotel Icon"
                    value={formData.defaultHotel}
                    onChange={(e) => handleInputChange("defaultHotel", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="defaultRoom">Default Room</Label>
                  <Input
                    id="defaultRoom"
                    placeholder="1503"
                    value={formData.defaultRoom}
                    onChange={(e) => handleInputChange("defaultRoom", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="multiple-addresses" className="text-base font-medium">
                    Different pickup address for each tour
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable this if the passenger will stay at different hotels during the trip
                  </p>
                </div>
                <Switch
                  id="multiple-addresses"
                  checked={hasMultipleAddresses}
                  onCheckedChange={setHasMultipleAddresses}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Tour Bookings</CardTitle>
              <Button 
                type="button"
                onClick={addTourBooking}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Tour
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tourBookings.map((tour, index) => (
              <div key={tour.id} className="relative border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Tour {index + 1}</h4>
                  {tourBookings.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTourBooking(tour.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tour.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tour.date ? format(tour.date, "dd/MM/yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={tour.date}
                          onSelect={(date) => handleTourChange(tour.id, "date", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Destination</Label>
                    <Select 
                      value={tour.destination} 
                      onValueChange={(value) => handleTourChange(tour.id, "destination", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose destination..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santiago">Santiago</SelectItem>
                        <SelectItem value="valparaiso">Valparaíso</SelectItem>
                        <SelectItem value="atacama">Atacama Desert</SelectItem>
                        <SelectItem value="patagonia">Patagonia</SelectItem>
                        <SelectItem value="easter-island">Easter Island</SelectItem>
                        <SelectItem value="bariloche">Bariloche</SelectItem>
                        <SelectItem value="mendoza">Mendoza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tour</Label>
                    <Select 
                      value={tour.tour} 
                      onValueChange={(value) => handleTourChange(tour.id, "tour", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tour..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city-tour">City Tour</SelectItem>
                        <SelectItem value="wine-tour">Wine Tour</SelectItem>
                        <SelectItem value="adventure-tour">Adventure Tour</SelectItem>
                        <SelectItem value="cultural-tour">Cultural Tour</SelectItem>
                        <SelectItem value="circuito-chico">Circuito Chico</SelectItem>
                        <SelectItem value="la-cueva">La Cueva</SelectItem>
                        <SelectItem value="seven-lakes">Seven Lakes Route</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasMultipleAddresses && (
                    <div>
                      <Label>
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Pickup Address for this tour
                      </Label>
                      <Input
                        placeholder="Hotel name or street address"
                        value={tour.pickupAddress}
                        onChange={(e) => handleTourChange(tour.id, "pickupAddress", e.target.value)}
                        className="border-blue-300"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Adults PAX</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={tour.adultsPax}
                      onChange={(e) => handleTourChange(tour.id, "adultsPax", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Adults Price {formData.currency || "CLP"}$</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={tour.adultsPrice}
                      onChange={(e) => handleTourChange(tour.id, "adultsPrice", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Children PAX</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={tour.childrenPax}
                      onChange={(e) => handleTourChange(tour.id, "childrenPax", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Children Price {formData.currency || "CLP"}$</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={tour.childrenPrice}
                      onChange={(e) => handleTourChange(tour.id, "childrenPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Comments for this tour</Label>
                    <Textarea
                      rows={2}
                      placeholder="Special requests, dietary requirements, etc."
                      value={tour.comments}
                      onChange={(e) => handleTourChange(tour.id, "comments", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <Label>Subtotal</Label>
                    <div className="text-2xl font-semibold text-blue-600">
                      {formData.currency || "CLP"}$ {calculateTourSubtotal(tour).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">GRAND TOTAL</span>
                <span className="text-2xl font-bold text-green-600">
                  {formData.currency || "CLP"}$ {calculateGrandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Attention, to add a booking the following fields must be completed:</strong> Fecha Reserva, Destino, Tour, PAX Adultos, Precio Adulto
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
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BookQuotePage