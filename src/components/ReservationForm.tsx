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
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// Validation schema
const reservationSchema = z.object({
  // Customer Information
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerId: z.string().min(5, "ID must be at least 5 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerCountry: z.string().min(2, "Please select a country"),
  customerLanguage: z.string().min(2, "Please select a language"),
  
  // Reservation Details
  travelDate: z.date({
    required_error: "Travel date is required",
  }),
  returnDate: z.date().optional(),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  tourType: z.string().min(1, "Please select a tour type"),
  departureTime: z.string().min(1, "Please select departure time"),
  
  // Passenger Information
  adultsCount: z.number().min(1, "At least 1 adult is required").max(50),
  childrenCount: z.number().min(0).max(50),
  infantsCount: z.number().min(0).max(10),
  
  // Pricing
  pricePerAdult: z.number().min(0, "Price must be positive"),
  pricePerChild: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0).max(100),
  currency: z.string().min(1, "Please select a currency"),
  
  // Additional Information
  specialRequests: z.string().optional(),
  internalNotes: z.string().optional(),
  externalAgency: z.string().optional(),
  responsiblePerson: z.string().min(2, "Please assign a responsible person"),
  status: z.enum(["quoted", "pending", "confirmed", "cancelled"]),
})

type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData) => void
  initialData?: Partial<ReservationFormData>
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
]

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
]

const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "ARS", label: "ARS - Argentine Peso", symbol: "$" },
  { value: "BRL", label: "BRL - Brazilian Real", symbol: "R$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
]

const teamMembers = [
  { name: "Thiago Andrade", agency: "Internal" },
  { name: "Ana Martinez", agency: "Internal" },
  { name: "Carlos Rodriguez", agency: "Travel Plus" },
  { name: "Ana Silva", agency: "World Tours" },
  { name: "Sofia Gonzalez", agency: "Adventure Agency" },
  { name: "Juan Rodriguez", agency: "Sunset Travel" },
]

const groupedTeamMembers = teamMembers.reduce((acc, member) => {
  if (!acc[member.agency]) {
    acc[member.agency] = []
  }
  acc[member.agency].push(member.name)
  return acc
}, {} as Record<string, string[]>)

export function ReservationForm({ onSubmit, initialData, mode = "create" }: ReservationFormProps) {
  const [totalPrice, setTotalPrice] = useState(0)
  
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customerName: initialData?.customerName || "",
      customerId: initialData?.customerId || "",
      customerEmail: initialData?.customerEmail || "",
      customerPhone: initialData?.customerPhone || "",
      customerCountry: initialData?.customerCountry || "",
      customerLanguage: initialData?.customerLanguage || "",
      travelDate: initialData?.travelDate || undefined,
      returnDate: initialData?.returnDate || undefined,
      destination: initialData?.destination || "",
      tourType: initialData?.tourType || "",
      departureTime: initialData?.departureTime || "",
      adultsCount: initialData?.adultsCount || 1,
      childrenCount: initialData?.childrenCount || 0,
      infantsCount: initialData?.infantsCount || 0,
      pricePerAdult: initialData?.pricePerAdult || 0,
      pricePerChild: initialData?.pricePerChild || 0,
      discount: initialData?.discount || 0,
      currency: initialData?.currency || "USD",
      specialRequests: initialData?.specialRequests || "",
      internalNotes: initialData?.internalNotes || "",
      externalAgency: initialData?.externalAgency || "",
      responsiblePerson: initialData?.responsiblePerson || "",
      status: initialData?.status || "quoted",
    }
  })

  // Calculate total price when values change
  const watchAdults = form.watch("adultsCount")
  const watchChildren = form.watch("childrenCount")
  const watchPriceAdult = form.watch("pricePerAdult")
  const watchPriceChild = form.watch("pricePerChild")
  const watchDiscount = form.watch("discount")
  const watchCurrency = form.watch("currency")

  const calculateTotal = () => {
    const adultTotal = watchAdults * watchPriceAdult
    const childTotal = watchChildren * watchPriceChild
    const subtotal = adultTotal + childTotal
    const discountAmount = (subtotal * watchDiscount) / 100
    setTotalPrice(subtotal - discountAmount)
  }

  const getCurrencySymbol = (currency: string) => {
    return currencies.find(c => c.value === currency)?.symbol || "$"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Complete customer details for the reservation
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID/Passport Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
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

        {/* Travel Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Travel Details
            </CardTitle>
            <CardDescription>
              Specify the tour information and dates
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
            
            <FormField
              control={form.control}
              name="departureTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departure Time *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
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

        {/* Passenger Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              Passenger Information
            </CardTitle>
            <CardDescription>
              Specify the number of passengers by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="adultsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults (12+ years) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="50" 
                        {...field} 
                        onChange={e => {
                          field.onChange(parseInt(e.target.value) || 0)
                          calculateTotal()
                        }}
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
                    <FormLabel>Children (2-11 years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="50" 
                        {...field} 
                        onChange={e => {
                          field.onChange(parseInt(e.target.value) || 0)
                          calculateTotal()
                        }}
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
                    <FormLabel>Infants (0-2 years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="10" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Infants usually travel free</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Total Passengers: {watchAdults + watchChildren + form.watch("infantsCount")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              Pricing Information
            </CardTitle>
            <CardDescription>
              Set the prices and calculate totals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
              
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={e => {
                          field.onChange(parseInt(e.target.value) || 0)
                          calculateTotal()
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pricePerAdult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Adult *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          {getCurrencySymbol(watchCurrency)}
                        </span>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          className="pl-8"
                          {...field} 
                          onChange={e => {
                            field.onChange(parseFloat(e.target.value) || 0)
                            calculateTotal()
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pricePerChild"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Child</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          {getCurrencySymbol(watchCurrency)}
                        </span>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          className="pl-8"
                          {...field} 
                          onChange={e => {
                            field.onChange(parseFloat(e.target.value) || 0)
                            calculateTotal()
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({watchAdults} adults × {getCurrencySymbol(watchCurrency)}{watchPriceAdult} + {watchChildren} children × {getCurrencySymbol(watchCurrency)}{watchPriceChild}):</span>
                <span>{getCurrencySymbol(watchCurrency)}{(watchAdults * watchPriceAdult + watchChildren * watchPriceChild).toFixed(2)}</span>
              </div>
              {watchDiscount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount ({watchDiscount}%):</span>
                  <span>-{getCurrencySymbol(watchCurrency)}{((watchAdults * watchPriceAdult + watchChildren * watchPriceChild) * watchDiscount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{getCurrencySymbol(watchCurrency)}{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Internal management and special requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsiblePerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible Person *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(groupedTeamMembers).map(([agency, members], index) => (
                          <div key={agency}>
                            {index > 0 && <div className="h-px bg-border my-1" />}
                            <div className="px-2 py-1 text-sm font-medium text-muted-foreground">{agency}</div>
                            {members.map((member) => (
                              <SelectItem key={member} value={member}>
                                {member}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quoted">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            Quoted
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-warning" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            Confirmed
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                            Cancelled
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This information will be shared with service providers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Internal comments for team members only"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes are only visible to staff members
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              {mode === "create" ? "Create Reservation" : "Update Reservation"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}