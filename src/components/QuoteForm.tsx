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
  Building,
  Share2,
  Instagram,
  MessageCircle,
  Link2,
  Cake
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Quote } from "@/types/quote"

interface PriceBreakdownItem {
  id: string
  item: string
  quantity: number
  unitPrice: number
  total: number
}

const quoteSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerCompany: z.string().optional(),
  customerBirthday: z.date().optional(),
  destination: z.string().min(3, "Destination is required"),
  tourType: z.string().min(1, "Please select a tour type"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  passengers: z.number().min(1, "At least 1 passenger is required"),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().min(1, "Please select a currency"),
  leadSource: z.string().min(1, "Please select lead source"),
  assignedTo: z.string().min(1, "Please assign to someone"),
  agency: z.string().optional(),
  operator: z.string().optional(),
  validUntil: z.date({ required_error: "Valid until date is required" }),
  description: z.string().optional(),
  notes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  onSubmit: (data: any) => void
  onCancel?: () => void
  initialData?: Quote | null
  mode?: "create" | "edit"
}

const tourTypes = [
  { value: "city-tour", label: "City Tour" },
  { value: "beach-tour", label: "Beach Tour" },
  { value: "adventure", label: "Adventure" },
  { value: "wine-tour", label: "Wine Tour" },
  { value: "nature", label: "Nature" },
  { value: "cultural", label: "Cultural" },
  { value: "gastronomy", label: "Gastronomy" },
  { value: "shopping", label: "Shopping" },
  { value: "custom", label: "Custom Package" },
]

const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "ARS", label: "ARS - Argentine Peso", symbol: "$" },
  { value: "BRL", label: "BRL - Brazilian Real", symbol: "R$" },
  { value: "CLP", label: "CLP - Chilean Peso", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
]

const leadSources = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "website", label: "Website", icon: Globe },
  { value: "email", label: "Email", icon: Mail },
  { value: "referral", label: "Referral", icon: Users },
  { value: "direct", label: "Direct", icon: Building },
  { value: "other", label: "Other", icon: FileText },
]

const teamMembers = [
  "Carlos Mendez",
  "Ana Costa",
  "Diego Ramirez",
  "Maria Silva",
  "João Santos",
]

const suppliers = [
  "ABC Travel Agency",
  "Global Tours",
  "Adventure Expeditions",
  "Luxury Destinations",
  "Local Experience Tours",
  "Mountain Guides Co.",
  "Beach Resort Partners",
  "City Tours Express",
  "Heritage Tours Ltd.",
  "Safari Adventures Inc."
]

export function QuoteForm({ onSubmit, onCancel, initialData, mode = "create" }: QuoteFormProps) {
  const [breakdown, setBreakdown] = useState<PriceBreakdownItem[]>(
    initialData?.pricing?.breakdown || []
  )
  
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: initialData?.customer?.name || "",
      customerEmail: initialData?.customer?.email || "",
      customerPhone: initialData?.customer?.phone || "",
      customerCompany: initialData?.customer?.company || "",
      customerBirthday: initialData?.customer?.birthday || undefined,
      destination: initialData?.tourDetails?.destination || "",
      tourType: initialData?.tourDetails?.tourType || "",
      startDate: initialData?.tourDetails?.startDate || undefined,
      endDate: initialData?.tourDetails?.endDate || undefined,
      passengers: initialData?.tourDetails?.passengers || 1,
      amount: initialData?.pricing?.amount || 0,
      currency: initialData?.pricing?.currency || "USD",
      leadSource: initialData?.leadSource || "",
      assignedTo: initialData?.assignedTo || "",
      agency: initialData?.agency || "",
      operator: initialData?.operator || "",
      validUntil: initialData?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: initialData?.tourDetails?.description || "",
      notes: initialData?.notes || "",
    }
  })

  const watchCurrency = form.watch("currency")
  const watchAmount = form.watch("amount")

  const getCurrencySymbol = (currency: string) => {
    return currencies.find(c => c.value === currency)?.symbol || "$"
  }

  const addBreakdownItem = () => {
    setBreakdown([...breakdown, {
      id: Date.now().toString(),
      item: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }])
  }

  const removeBreakdownItem = (id: string) => {
    setBreakdown(breakdown.filter(item => item.id !== id))
  }

  const updateBreakdownItem = (id: string, field: keyof PriceBreakdownItem, value: any) => {
    setBreakdown(breakdown.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const calculateBreakdownTotal = () => {
    return breakdown.reduce((sum, item) => sum + item.total, 0)
  }

  const handleFormSubmit = (data: QuoteFormData) => {
    const quoteData = {
      customer: {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        company: data.customerCompany,
        birthday: data.customerBirthday,
      },
      tourDetails: {
        destination: data.destination,
        tourType: data.tourType,
        startDate: data.startDate,
        endDate: data.endDate,
        passengers: data.passengers,
        description: data.description,
      },
      pricing: {
        amount: data.amount,
        currency: data.currency as any,
        breakdown: breakdown.filter(item => item.item && item.total > 0),
      },
      status: initialData?.status || 'draft',
      leadSource: data.leadSource as any,
      assignedTo: data.assignedTo,
      agency: data.agency,
      operator: data.operator,
      validUntil: data.validUntil,
      notes: data.notes,
    }
    
    onSubmit(quoteData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
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
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
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
                  <FormLabel>Phone</FormLabel>
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
              name="customerCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
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
              name="customerBirthday"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birthday</FormLabel>
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
                          <Cake className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select birthday</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 max-w-[95vw] sm:max-w-none" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        classNames={{
                          caption_dropdowns: "flex gap-2",
                          dropdown_month: "flex-1",
                          dropdown_year: "flex-1",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs">
                    Optional: Customer's date of birth for personalized offers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tour Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tour Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
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
                          disabled={(date) => date < new Date()}
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
                              <span>Pick end date</span>
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
                            date < form.getValues("startDate") || date < new Date()
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
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passengers (PAX) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          min="1" 
                          className="pl-10"
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Complete city tour including Recoleta, La Boca, and Tango show..."
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

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount *</FormLabel>
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
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price Breakdown */}
            {breakdown.length > 0 && (
              <div className="space-y-2">
                <Label>Price Breakdown</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-32">Unit Price</TableHead>
                        <TableHead className="w-32">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              placeholder="Description"
                              value={item.item}
                              onChange={(e) => updateBreakdownItem(item.id, "item", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateBreakdownItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <span className="absolute left-2 top-3 text-muted-foreground text-sm">
                                {getCurrencySymbol(watchCurrency)}
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-7"
                                value={item.unitPrice}
                                onChange={(e) => updateBreakdownItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {getCurrencySymbol(watchCurrency)}{item.total.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBreakdownItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {breakdown.length > 0 && (
                  <div className="text-right text-sm text-muted-foreground">
                    Breakdown Total: {getCurrencySymbol(watchCurrency)}{calculateBreakdownTotal().toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBreakdownItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Price Breakdown
            </Button>
          </CardContent>
        </Card>

        {/* Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="leadSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadSources.map((source) => {
                          const Icon = source.icon
                          return (
                            <SelectItem key={source.value} value={source.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {source.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Salesperson *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select salesperson" />
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
              
              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency</FormLabel>
                    <FormControl>
                      <Input placeholder="Agency name (if applicable)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Operator</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || "own-operation"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="own-operation">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Own Operation
                          </div>
                        </SelectItem>
                        <Separator className="my-1" />
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Select if the tour is handled internally or by an external supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quote Valid Until *</FormLabel>
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
                              <span>Pick expiry date</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes or special requirements..."
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

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All fields marked with * are required
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
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