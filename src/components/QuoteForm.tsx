import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  AlertCircle,
  Check,
  X,
  Plus,
  Trash2,
  FileText,
  Building
} from "lucide-react"
import { cn } from "@/lib/utils"

// Service item type
interface ServiceItem {
  id: string
  date: Date
  destination: string
  tour: string
  adults: number
  children: number
  adultPrice: number
  childPrice: number
  subtotal: number
  notes: string
}

// Validation schema
const quoteSchema = z.object({
  // Customer Information
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerCountry: z.string().min(2, "Please select a country"),
  customerLanguage: z.string().min(2, "Please select a language"),
  companyName: z.string().optional(),
  documentType: z.string().min(1, "Please select a document type"),
  documentNumber: z.string().min(3, "Document number is required"),
  customerAddress: z.string().optional(),
  customerHotel: z.string().optional(),
  
  // Quote Details
  quoteNumber: z.string().min(1, "Quote number is required"),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  validUntil: z.date({
    required_error: "Valid until date is required",
  }),
  
  // Travel Information
  travelDate: z.date({
    required_error: "Travel date is required",
  }),
  returnDate: z.date().optional(),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  tourType: z.string().min(1, "Please select a tour type"),
  
  // Passenger Information
  adultsCount: z.number().min(1, "At least 1 adult is required").max(50),
  childrenCount: z.number().min(0).max(50),
  infantsCount: z.number().min(0).max(10),
  
  // Pricing
  currency: z.string().min(1, "Please select a currency"),
  paymentTerms: z.string().min(1, "Please select payment terms"),
  
  // Additional Information
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
  termsConditions: z.string().optional(),
  specialNotes: z.string().optional(),
  
  // Management
  responsiblePerson: z.string().min(2, "Please assign a responsible person"),
  externalAgency: z.string().optional(),
  commissionPercentage: z.number().min(0).max(100).optional(),
  sourceOfBooking: z.string().min(1, "Please select the source of booking"),
  
  // Pickup and Drop-off Addresses
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  
  // Quote settings
  immediatePayment: z.boolean().optional(),
  allowPurchaseOrder: z.boolean().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  onSubmit: (data: QuoteFormData & { services: ServiceItem[] }) => void
  initialData?: Partial<QuoteFormData>
  mode?: "create" | "edit"
}

const countries = [
  { value: "AR", label: "Argentina" },
  { value: "BR", label: "Brazil" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "Mexico" },
  { value: "PE", label: "Peru" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "ES", label: "Spain" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "IT", label: "Italy" },
  { value: "UK", label: "United Kingdom" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
]

const languages = [
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
]

const tourTypes = [
  { value: "city-tour", label: "City Tour", color: "bg-primary" },
  { value: "beach-tour", label: "Beach Tour", color: "bg-accent" },
  { value: "adventure", label: "Adventure", color: "bg-success" },
  { value: "wine-tour", label: "Wine Tour", color: "bg-purple-500" },
  { value: "nature", label: "Nature", color: "bg-green-500" },
  { value: "cultural", label: "Cultural", color: "bg-orange-500" },
  { value: "gastronomy", label: "Gastronomy", color: "bg-pink-500" },
  { value: "shopping", label: "Shopping", color: "bg-blue-500" },
  { value: "custom", label: "Custom Package", color: "bg-gray-500" },
]

const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "ARS", label: "ARS - Argentine Peso", symbol: "$" },
  { value: "BRL", label: "BRL - Brazilian Real", symbol: "R$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
]

const paymentTermsOptions = [
  { value: "full-advance", label: "100% in advance" },
  { value: "50-advance", label: "50% advance, 50% on arrival" },
  { value: "30-advance", label: "30% advance, 70% on arrival" },
  { value: "on-arrival", label: "Payment on arrival" },
  { value: "custom", label: "Custom terms" },
]

const teamMembers = [
  "Carlos Mendez",
  "Ana Costa",
  "Diego Ramirez",
  "Maria Silva",
  "João Santos",
]

const documentTypes = [
  { value: "dni", label: "DNI (Argentina)" },
  { value: "rg", label: "RG (Brazil)" },
  { value: "passport", label: "Passport" },
  { value: "cpf", label: "CPF (Brazil)" },
  { value: "cnpj", label: "CNPJ (Brazil)" },
  { value: "id", label: "National ID" },
]

const bookingSources = [
  { value: "direct", label: "Direct Booking" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "walk-in", label: "Walk-in" },
  { value: "external-agency", label: "External Agency" },
  { value: "referral", label: "Referral" },
  { value: "social-media", label: "Social Media" },
]

export function QuoteForm({ onSubmit, initialData, mode = "create" }: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItem[]>([
    { 
      id: "1", 
      date: new Date(), 
      destination: "", 
      tour: "", 
      adults: 1, 
      children: 0, 
      adultPrice: 0, 
      childPrice: 0, 
      subtotal: 0,
      notes: ""
    }
  ])
  
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: initialData?.customerName || "",
      customerEmail: initialData?.customerEmail || "",
      customerPhone: initialData?.customerPhone || "",
      customerCountry: initialData?.customerCountry || "",
      customerLanguage: initialData?.customerLanguage || "",
      companyName: initialData?.companyName || "",
      documentType: initialData?.documentType || "",
      documentNumber: initialData?.documentNumber || "",
      customerAddress: initialData?.customerAddress || "",
      customerHotel: initialData?.customerHotel || "",
      quoteNumber: initialData?.quoteNumber || `Q-${Date.now()}`,
      issueDate: initialData?.issueDate || new Date(),
      validUntil: initialData?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      travelDate: initialData?.travelDate || undefined,
      returnDate: initialData?.returnDate || undefined,
      destination: initialData?.destination || "",
      tourType: initialData?.tourType || "",
      adultsCount: initialData?.adultsCount || 1,
      childrenCount: initialData?.childrenCount || 0,
      infantsCount: initialData?.infantsCount || 0,
      currency: initialData?.currency || "USD",
      paymentTerms: initialData?.paymentTerms || "50-advance",
      inclusions: initialData?.inclusions || "",
      exclusions: initialData?.exclusions || "",
      termsConditions: initialData?.termsConditions || "",
      specialNotes: initialData?.specialNotes || "",
      responsiblePerson: initialData?.responsiblePerson || "",
      externalAgency: initialData?.externalAgency || "",
      commissionPercentage: initialData?.commissionPercentage || 0,
      sourceOfBooking: initialData?.sourceOfBooking || "",
      pickupAddress: initialData?.pickupAddress || "",
      dropoffAddress: initialData?.dropoffAddress || "",
      immediatePayment: initialData?.immediatePayment || false,
      allowPurchaseOrder: initialData?.allowPurchaseOrder || true,
    }
  })

  const watchCurrency = form.watch("currency")
  const watchCommission = form.watch("commissionPercentage")

  const getCurrencySymbol = (currency: string) => {
    return currencies.find(c => c.value === currency)?.symbol || "$"
  }

  // Service management functions
  const addService = () => {
    setServices([...services, {
      id: Date.now().toString(),
      date: new Date(),
      destination: "",
      tour: "",
      adults: 1,
      children: 0,
      adultPrice: 0,
      childPrice: 0,
      subtotal: 0,
      notes: ""
    }])
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const updateService = (id: string, field: keyof ServiceItem, value: any) => {
    setServices(services.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value }
        if (field === "adults" || field === "children" || field === "adultPrice" || field === "childPrice") {
          updated.subtotal = (updated.adults * updated.adultPrice) + (updated.children * updated.childPrice)
        }
        return updated
      }
      return service
    }))
  }

  const calculateSubtotal = () => {
    return services.reduce((sum, service) => sum + service.subtotal, 0)
  }

  const calculateCommission = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * (watchCommission || 0)) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal()
  }

  const handleFormSubmit = (data: QuoteFormData) => {
    onSubmit({ ...data, services })
  }

  const generatePurchaseOrder = () => {
    // Generate PO from quotation with the option to copy notes
    console.log("Generating Purchase Order with services:", services)
    // This would typically open a modal or redirect to PO generation
  }

  const sendEmailToClient = () => {
    // Email access to the client
    console.log("Sending email to client with quote details")
    // This would typically open email composition or send via API
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Quote Header Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Quote Information
            </CardTitle>
            <CardDescription>
              Basic quote details and validity
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quoteNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quote Number *</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly={mode === "edit"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Issue Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Valid Until *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues("issueDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Customer Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Client contact details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="ABC Corporation" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="john@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="+1234567890" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {country.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pickup and Drop-off Addresses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Pickup & Drop-off Locations
            </CardTitle>
            <CardDescription>
              Define different pickup and drop-off addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pickupAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea 
                        placeholder="Hotel, airport, or specific address for pickup"
                        className="pl-10 resize-none"
                        rows={2}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dropoffAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop-off Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea 
                        placeholder="Hotel, airport, or specific address for drop-off"
                        className="pl-10 resize-none"
                        rows={2}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Travel Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Travel Details
            </CardTitle>
            <CardDescription>
              Tour information and dates
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="travelDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Travel Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Return Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick return date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues("travelDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination *</FormLabel>
                  <FormControl>
                    <Input placeholder="Buenos Aires, Patagonia, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tourType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tour type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tourTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="adultsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="50" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="childrenCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="50" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="infantsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Infants</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="10" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Individual Bookings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              Individual Bookings
            </CardTitle>
            <CardDescription>
              Add individual bookings within the quotation with PAX and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Currency *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[12%]">Date</TableHead>
                    <TableHead className="w-[15%]">Destination</TableHead>
                    <TableHead className="w-[15%]">Tour</TableHead>
                    <TableHead className="w-[8%]">Adults</TableHead>
                    <TableHead className="w-[8%]">Children</TableHead>
                    <TableHead className="w-[10%]">Adult Price</TableHead>
                    <TableHead className="w-[10%]">Child Price</TableHead>
                    <TableHead className="w-[10%]">Subtotal</TableHead>
                    <TableHead className="w-[10%]">Notes</TableHead>
                    <TableHead className="w-[2%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal text-xs p-1"
                            >
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {format(service.date, "MMM dd")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={service.date}
                              onSelect={(date) => date && updateService(service.id, "date", date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Destination"
                          className="text-xs"
                          value={service.destination}
                          onChange={(e) => updateService(service.id, "destination", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Tour name"
                          className="text-xs"
                          value={service.tour}
                          onChange={(e) => updateService(service.id, "tour", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className="text-xs"
                          value={service.adults}
                          onChange={(e) => updateService(service.id, "adults", parseInt(e.target.value) || 1)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          className="text-xs"
                          value={service.children}
                          onChange={(e) => updateService(service.id, "children", parseInt(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                            {getCurrencySymbol(watchCurrency)}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="pl-6 text-xs"
                            value={service.adultPrice}
                            onChange={(e) => updateService(service.id, "adultPrice", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                            {getCurrencySymbol(watchCurrency)}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="pl-6 text-xs"
                            value={service.childPrice}
                            onChange={(e) => updateService(service.id, "childPrice", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs">
                          {getCurrencySymbol(watchCurrency)}{service.subtotal.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notes"
                          className="text-xs"
                          value={service.notes}
                          onChange={(e) => updateService(service.id, "notes", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          disabled={services.length === 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addService}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Booking
            </Button>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{getCurrencySymbol(watchCurrency)}{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{getCurrencySymbol(watchCurrency)}{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Payment Terms *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTermsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Terms and Conditions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Additional Information</CardTitle>
            <CardDescription>
              Define what's included and any special terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="inclusions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inclusions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's included in the package (e.g., transportation, guide, meals, etc.)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="exclusions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exclusions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's not included (e.g., flights, personal expenses, tips, etc.)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="termsConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Cancellation policy, payment terms, and other conditions"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information or special requirements"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Management Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Management Information</CardTitle>
            <CardDescription>
              Internal tracking, commission details, and booking source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sourceOfBooking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source of Booking *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select booking source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookingSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsiblePerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Salesperson *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="externalAgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Agency (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Agency name if applicable" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="commissionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission %</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="0"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {watchCommission > 0 && (
                      <FormDescription>
                        Commission: {getCurrencySymbol(watchCurrency)}{calculateCommission().toFixed(2)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quote Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Quote Settings
            </CardTitle>
            <CardDescription>
              Validity and payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="immediatePayment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Immediate Payment Required
                      </FormLabel>
                      <FormDescription>
                        Skip immediate payment option for this quote
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowPurchaseOrder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Purchase Order Generation
                      </FormLabel>
                      <FormDescription>
                        Enable PO generation from this quote
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All fields marked with * are required
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {mode === "edit" && (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={generatePurchaseOrder}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PO
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={sendEmailToClient}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Client
                </Button>
              </>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              {mode === "create" ? "Create Quote" : "Update Quote"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}