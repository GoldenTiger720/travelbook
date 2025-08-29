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
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { quoteService } from "@/services/quoteService"

const BookQuotePage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [assignFromExternal, setAssignFromExternal] = useState(false)
  const [bookingsWithDifferentAddresses, setBookingsWithDifferentAddresses] = useState(false)
  const [date, setDate] = useState<Date>()

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
    addressAlternative: "",
    commune: "",
    hotel: "",
    room: "",
    destination: "",
    tour: "",
    adultsPrice: "",
    childrenPax: "",
    childrenPrice: "",
    subtotal: "",
    comments: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateSubtotal = () => {
    const adults = parseFloat(formData.adultsPrice) || 0
    const children = parseFloat(formData.childrenPrice) || 0
    const childrenCount = parseInt(formData.childrenPax) || 0
    return adults + (children * childrenCount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const requiredFields = ["destination", "tour", "adultsPrice"]
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields: " + missingFields.join(", "),
          variant: "destructive"
        })
        setSubmitting(false)
        return
      }

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
          destination: formData.destination,
          tourType: formData.tour,
          startDate: date || new Date(),
          endDate: date || new Date(),
          passengers: 1,
          hotel: formData.hotel || "",
          room: formData.room || ""
        },
        pricing: {
          amount: calculateSubtotal(),
          currency: formData.currency || "CLP",
          adultsPrice: parseFloat(formData.adultsPrice) || 0,
          childrenPrice: parseFloat(formData.childrenPrice) || 0,
          childrenCount: parseInt(formData.childrenPax) || 0
        },
        leadSource: "website",
        assignedTo: formData.salesperson || "Thiago Andrade",
        agency: assignFromExternal ? "External Agency" : undefined,
        status: "draft",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        additionalNotes: formData.comments,
        termsAccepted: {
          accepted: false
        }
      }

      const newQuote = await quoteService.createQuote(quoteData)
      
      toast({
        title: "Booking Created",
        description: `Quote #${newQuote.quoteNumber} has been created successfully.`
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
                <Label htmlFor="idPassport">RUT/ID/Passport/CPF/CNP3</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="different-addresses">Bookings with different addresses</Label>
                <Switch
                  id="different-addresses"
                  checked={bookingsWithDifferentAddresses}
                  onCheckedChange={setBookingsWithDifferentAddresses}
                />
              </div>

              {bookingsWithDifferentAddresses && (
                <div>
                  <Label htmlFor="addressAlternative">Address</Label>
                  <Input
                    id="addressAlternative"
                    placeholder="Alonso de Córdova 6050"
                    value={formData.addressAlternative}
                    onChange={(e) => handleInputChange("addressAlternative", e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="commune">Commune</Label>
                  <Select value={formData.commune} onValueChange={(value) => handleInputChange("commune", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="santiago">Santiago</SelectItem>
                      <SelectItem value="providencia">Providencia</SelectItem>
                      <SelectItem value="las-condes">Las Condes</SelectItem>
                      <SelectItem value="vitacura">Vitacura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hotel">Hotel</Label>
                  <Input
                    id="hotel"
                    placeholder="Icon"
                    value={formData.hotel}
                    onChange={(e) => handleInputChange("hotel", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    placeholder="1503"
                    value={formData.room}
                    onChange={(e) => handleInputChange("room", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Add booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">
                  Date <span className="text-red-500">Requerido</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "dd/mm/aaaa"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="destination">
                  Destination <span className="text-red-500">Requerido</span>
                </Label>
                <Select value={formData.destination} onValueChange={(value) => handleInputChange("destination", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="valparaiso">Valparaíso</SelectItem>
                    <SelectItem value="atacama">Atacama Desert</SelectItem>
                    <SelectItem value="patagonia">Patagonia</SelectItem>
                    <SelectItem value="easter-island">Easter Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tour">
                  Tour <span className="text-red-500">Requerido</span>
                </Label>
                <Select value={formData.tour} onValueChange={(value) => handleInputChange("tour", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city-tour">City Tour</SelectItem>
                    <SelectItem value="wine-tour">Wine Tour</SelectItem>
                    <SelectItem value="adventure-tour">Adventure Tour</SelectItem>
                    <SelectItem value="cultural-tour">Cultural Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adultsPrice">
                    Adults PAX <span className="text-red-500">Requerido</span>
                  </Label>
                  <Input
                    id="adultsPrice"
                    placeholder="0"
                    value={formData.adultsPrice}
                    onChange={(e) => handleInputChange("adultsPrice", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="adultsPrice">
                    Adults price CLP$ <span className="text-red-500">Requerido</span>
                  </Label>
                  <Input
                    id="adultsPrice"
                    type="number"
                    placeholder="$"
                    value={formData.adultsPrice}
                    onChange={(e) => handleInputChange("adultsPrice", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="childrenPax">Children PAX</Label>
                <Input
                  id="childrenPax"
                  type="number"
                  placeholder="0"
                  value={formData.childrenPax}
                  onChange={(e) => handleInputChange("childrenPax", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="childrenPrice">Children price CLP$</Label>
                <Input
                  id="childrenPrice"
                  type="number"
                  placeholder="$"
                  value={formData.childrenPrice}
                  onChange={(e) => handleInputChange("childrenPrice", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="subtotal">SUBTOTAL CLP$</Label>
                <Input
                  id="subtotal"
                  type="number"
                  placeholder="$"
                  value={calculateSubtotal()}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Minimo: CLP $1.234
            </div>

            <div>
              <Label htmlFor="comments">Comments on tour</Label>
              <Textarea
                id="comments"
                rows={4}
                placeholder="Enter any special requests or comments..."
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
              />
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

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-8"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Add booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BookQuotePage