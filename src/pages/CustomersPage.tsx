import { useState } from "react"
import { useCreateCustomer } from "@/hooks/useCustomers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  Loader2
} from "lucide-react"

// Helper function to generate avatar URL
const generateAvatar = (name: string, seed?: string) => {
  const colors = ["6366f1", "22c55e", "ec4899", "f59e0b", "64748b", "8b5cf6", "14b8a6", "ef4444"];
  const colorIndex = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length);
  const bgColor = colors[colorIndex];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=128&bold=true`;
};

// Mock data for customers
const mockCustomers = [
  {
    id: "C001",
    name: "Maria González",
    email: "maria.gonzalez@email.com",
    phone: "+54 11 4567-8901",
    location: "Buenos Aires, Argentina",
    status: "active",
    totalBookings: 12,
    totalSpent: "$28,450",
    lastBooking: "2024-01-10",
    avatar: generateAvatar("Maria González", "C001")
  },
  {
    id: "C002",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+55 21 98765-4321",
    location: "Rio de Janeiro, Brazil",
    status: "active",
    totalBookings: 8,
    totalSpent: "$15,890",
    lastBooking: "2024-01-08",
    avatar: generateAvatar("João Silva", "C002")
  },
  {
    id: "C003",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 212-555-0123",
    location: "New York, USA",
    status: "vip",
    totalBookings: 25,
    totalSpent: "$84,200",
    lastBooking: "2024-01-12",
    avatar: generateAvatar("Sarah Johnson", "C003")
  },
  {
    id: "C004",
    name: "Carlos Rodriguez",
    email: "carlos.r@email.com",
    phone: "+52 55 1234-5678",
    location: "Mexico City, Mexico",
    status: "active",
    totalBookings: 6,
    totalSpent: "$9,650",
    lastBooking: "2023-12-28",
    avatar: generateAvatar("Carlos Rodriguez", "C004")
  },
  {
    id: "C005",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    phone: "+44 20 7123 4567",
    location: "London, UK",
    status: "inactive",
    totalBookings: 3,
    totalSpent: "$4,200",
    lastBooking: "2023-10-15",
    avatar: generateAvatar("Emma Wilson", "C005")
  },
  {
    id: "C006",
    name: "Lucas Martins",
    email: "lucas.martins@email.com",
    phone: "+55 11 91234-5678",
    location: "São Paulo, Brazil",
    status: "vip",
    totalBookings: 18,
    totalSpent: "$52,300",
    lastBooking: "2024-01-14",
    avatar: generateAvatar("Lucas Martins", "C006")
  },
  {
    id: "C007",
    name: "Isabella Rossi",
    email: "isabella.rossi@email.com",
    phone: "+39 06 1234 5678",
    location: "Rome, Italy",
    status: "active",
    totalBookings: 9,
    totalSpent: "$18,900",
    lastBooking: "2024-01-11",
    avatar: generateAvatar("Isabella Rossi", "C007")
  },
  {
    id: "C008",
    name: "Robert Chen",
    email: "robert.chen@email.com",
    phone: "+1 415-555-0123",
    location: "San Francisco, USA",
    status: "active",
    totalBookings: 15,
    totalSpent: "$35,600",
    lastBooking: "2024-01-13",
    avatar: generateAvatar("Robert Chen", "C008")
  },
  {
    id: "C009",
    name: "Sakura Tanaka",
    email: "sakura.tanaka@email.com",
    phone: "+81 3-1234-5678",
    location: "Tokyo, Japan",
    status: "vip",
    totalBookings: 22,
    totalSpent: "$67,800",
    lastBooking: "2024-01-15",
    avatar: generateAvatar("Sakura Tanaka", "C009")
  },
  {
    id: "C010",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    phone: "+20 2 1234 5678",
    location: "Cairo, Egypt",
    status: "active",
    totalBookings: 7,
    totalSpent: "$12,300",
    lastBooking: "2024-01-09",
    avatar: generateAvatar("Ahmed Hassan", "C010")
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-success text-success-foreground"
    case "vip": return "bg-primary text-primary-foreground"
    case "inactive": return "bg-muted text-muted-foreground"
    default: return "bg-secondary text-secondary-foreground"
  }
}

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    idPassport: "",
    email: "",
    phone: "",
    language: "",
    countryOfOrigin: "",
    cpf: "",
    address: ""
  })

  // Handle backend field errors
  const handleFieldErrors = (errors: Record<string, string[]>) => {
    setBackendErrors(errors)
  }

  const createCustomerMutation = useCreateCustomer(handleFieldErrors)

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate full name
    if (!newCustomer.fullName.trim()) {
      errors.fullName = "Full name is required"
    } else if (newCustomer.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newCustomer.email.trim()) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(newCustomer.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate phone
    if (!newCustomer.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    // Validate ID/Passport
    if (!newCustomer.idPassport.trim()) {
      errors.idPassport = "ID/Passport is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Clear backend errors
    setBackendErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      await createCustomerMutation.mutateAsync(newCustomer)

      // Reset form on success
      setNewCustomer({
        fullName: "",
        idPassport: "",
        email: "",
        phone: "",
        language: "",
        countryOfOrigin: "",
        cpf: "",
        address: ""
      })
      setValidationErrors({})
      setIsAddCustomerOpen(false)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Customer creation error:', error)
    }
  }
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    { label: "Total Customers", value: "1,247", icon: Users, color: "text-primary" },
    { label: "Active Customers", value: "1,089", icon: Calendar, color: "text-success" },
    { label: "VIP Customers", value: "48", icon: DollarSign, color: "text-accent" },
    { label: "New This Month", value: "127", icon: Plus, color: "text-warning" }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your customer relationships and booking history
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:inline">Add Customer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[525px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer with complete information including personal details, contact info, and preferences.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      value={newCustomer.fullName}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, fullName: e.target.value})
                        // Clear errors when user starts typing
                        if (validationErrors.fullName) {
                          setValidationErrors(prev => ({ ...prev, fullName: '' }))
                        }
                        if (backendErrors.fullName) {
                          setBackendErrors(prev => ({ ...prev, fullName: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.fullName || backendErrors.fullName ? 'border-destructive' : ''}
                    />
                    {validationErrors.fullName && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.fullName}</p>
                    )}
                    {backendErrors.fullName && backendErrors.fullName.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="idPassport">ID/Passport</Label>
                    <Input
                      id="idPassport"
                      placeholder="Enter ID or passport number"
                      value={newCustomer.idPassport}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, idPassport: e.target.value})
                        if (validationErrors.idPassport) {
                          setValidationErrors(prev => ({ ...prev, idPassport: '' }))
                        }
                        if (backendErrors.idPassport) {
                          setBackendErrors(prev => ({ ...prev, idPassport: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.idPassport || backendErrors.idPassport ? 'border-destructive' : ''}
                    />
                    {validationErrors.idPassport && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.idPassport}</p>
                    )}
                    {backendErrors.idPassport && backendErrors.idPassport.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newCustomer.email}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, email: e.target.value})
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }))
                        }
                        if (backendErrors.email) {
                          setBackendErrors(prev => ({ ...prev, email: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.email || backendErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>
                    )}
                    {backendErrors.email && backendErrors.email.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={newCustomer.phone}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, phone: e.target.value})
                        if (validationErrors.phone) {
                          setValidationErrors(prev => ({ ...prev, phone: '' }))
                        }
                        if (backendErrors.phone) {
                          setBackendErrors(prev => ({ ...prev, phone: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.phone || backendErrors.phone ? 'border-destructive' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.phone}</p>
                    )}
                    {backendErrors.phone && backendErrors.phone.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={newCustomer.language}
                      onValueChange={(value) => {
                        setNewCustomer({...newCustomer, language: value})
                        if (validationErrors.language) {
                          setValidationErrors(prev => ({ ...prev, language: '' }))
                        }
                        if (backendErrors.language) {
                          setBackendErrors(prev => ({ ...prev, language: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                    >
                      <SelectTrigger className={validationErrors.language || backendErrors.language ? 'border-destructive' : ''}>
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
                    {validationErrors.language && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.language}</p>
                    )}
                    {backendErrors.language && backendErrors.language.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="countryOfOrigin">Country of origin</Label>
                    <Input
                      id="countryOfOrigin"
                      placeholder="Enter country of origin"
                      value={newCustomer.countryOfOrigin}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, countryOfOrigin: e.target.value})
                        if (validationErrors.countryOfOrigin) {
                          setValidationErrors(prev => ({ ...prev, countryOfOrigin: '' }))
                        }
                        if (backendErrors.countryOfOrigin) {
                          setBackendErrors(prev => ({ ...prev, countryOfOrigin: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.countryOfOrigin || backendErrors.countryOfOrigin ? 'border-destructive' : ''}
                    />
                    {validationErrors.countryOfOrigin && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.countryOfOrigin}</p>
                    )}
                    {backendErrors.countryOfOrigin && backendErrors.countryOfOrigin.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="Enter CPF (Brazilian tax ID)"
                      value={newCustomer.cpf}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, cpf: e.target.value})
                        if (validationErrors.cpf) {
                          setValidationErrors(prev => ({ ...prev, cpf: '' }))
                        }
                        if (backendErrors.cpf) {
                          setBackendErrors(prev => ({ ...prev, cpf: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.cpf || backendErrors.cpf ? 'border-destructive' : ''}
                    />
                    {validationErrors.cpf && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.cpf}</p>
                    )}
                    {backendErrors.cpf && backendErrors.cpf.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter full address"
                    value={newCustomer.address}
                    onChange={(e) => {
                      setNewCustomer({...newCustomer, address: e.target.value})
                      if (validationErrors.address) {
                        setValidationErrors(prev => ({ ...prev, address: '' }))
                      }
                      if (backendErrors.address) {
                        setBackendErrors(prev => ({ ...prev, address: [] }))
                      }
                    }}
                    disabled={createCustomerMutation.isPending}
                    className={validationErrors.address || backendErrors.address ? 'border-destructive' : ''}
                  />
                  {validationErrors.address && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.address}</p>
                  )}
                  {backendErrors.address && backendErrors.address.map((error, idx) => (
                    <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={createCustomerMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createCustomerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Customer...
                    </>
                  ) : (
                    "Add Customer"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Customers Table - Desktop */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Booking</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/10 shadow-sm">
                        <AvatarImage src={customer.avatar} alt={customer.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.totalBookings} bookings
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3" />
                      {customer.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.totalSpent}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.lastBooking}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit customer</DropdownMenuItem>
                        <DropdownMenuItem>View bookings</DropdownMenuItem>
                        <DropdownMenuItem>Send email</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customers Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customer Directory</h2>
          <span className="text-sm text-muted-foreground">
            {filteredCustomers.length} customers
          </span>
        </div>
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-sm">
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{customer.name}</h3>
                      <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{customer.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit customer</DropdownMenuItem>
                    <DropdownMenuItem>View bookings</DropdownMenuItem>
                    <DropdownMenuItem>Send email</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {customer.totalBookings} bookings
                    </span>
                    <span className="font-medium">
                      {customer.totalSpent}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    Last: {customer.lastBooking}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomersPage