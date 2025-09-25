import { useState } from "react"
import { useCreateCustomer, useCustomers, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers"
import Swal from 'sweetalert2'
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
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"

// Helper function to generate avatar URL
const generateAvatar = (name: string, seed?: string) => {
  const colors = ["6366f1", "22c55e", "ec4899", "f59e0b", "64748b", "8b5cf6", "14b8a6", "ef4444"];
  const colorIndex = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length);
  const bgColor = colors[colorIndex];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=128&bold=true`;
};


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
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isViewBookingsOpen, setIsViewBookingsOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({})
  const [editBackendErrors, setEditBackendErrors] = useState<Record<string, string[]>>({})
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    id_number: "",
    email: "",
    phone: "",
    language: "",
    country: "",
    cpf: "",
    address: "",
    hotel: "",
    room: "",
    comments: ""
  })

  const [editCustomer, setEditCustomer] = useState({
    name: "",
    id_number: "",
    email: "",
    phone: "",
    language: "",
    country: "",
    cpf: "",
    address: "",
    hotel: "",
    room: "",
    comments: ""
  })

  // Handle backend field errors
  const handleFieldErrors = (errors: Record<string, string[]>) => {
    setBackendErrors(errors)
  }

  const createCustomerMutation = useCreateCustomer(handleFieldErrors)

  // Handle edit customer backend field errors
  const handleEditFieldErrors = (errors: Record<string, string[]>) => {
    setEditBackendErrors(errors)
  }

  const updateCustomerMutation = useUpdateCustomer(handleEditFieldErrors)
  const deleteCustomerMutation = useDeleteCustomer()

  // Fetch customers from API
  const {
    data: customersResponse,
    isLoading,
    error,
    refetch
  } = useCustomers({ search: searchTerm })

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate full name
    if (!newCustomer.name.trim()) {
      errors.name = "Full name is required"
    } else if (newCustomer.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters"
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
    if (!newCustomer.id_number.trim()) {
      errors.id_number = "ID/Passport is required"
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
        name: "",
        id_number: "",
        email: "",
        phone: "",
        language: "",
        country: "",
        cpf: "",
        address: "",
        hotel: "",
        room: "",
        comments: ""
      })
      setValidationErrors({})
      setIsAddCustomerOpen(false)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Customer creation error:', error)
    }
  }

  // Handle view details
  const handleViewDetails = (customer: any) => {
    // Find the original customer data from API
    const originalCustomer = customers.find(c => c.id === customer.id)
    if (originalCustomer) {
      setSelectedCustomer(originalCustomer)
      setIsViewDetailsOpen(true)
    }
  }

  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    // Find the original customer data from API
    const originalCustomer = customers.find(c => c.id === customer.id)
    if (originalCustomer) {
      setEditCustomer({
        name: originalCustomer.name,
        id_number: originalCustomer.id_number,
        email: originalCustomer.email,
        phone: originalCustomer.phone,
        language: originalCustomer.language,
        country: originalCustomer.country,
        cpf: originalCustomer.cpf,
        address: originalCustomer.address,
        hotel: originalCustomer.hotel || "",
        room: originalCustomer.room || "",
        comments: originalCustomer.comments || ""
      })
      setSelectedCustomer(originalCustomer)
      setEditValidationErrors({})
      setEditBackendErrors({})
      setIsEditCustomerOpen(true)
    }
  }

  // Handle view bookings
  const handleViewBookings = (customer: any) => {
    // Find the original customer data from API
    const originalCustomer = customers.find(c => c.id === customer.id)
    if (originalCustomer) {
      setSelectedCustomer(originalCustomer)
      setIsViewBookingsOpen(true)
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async (customer: any) => {
    const result = await Swal.fire({
      title: 'Delete Customer',
      text: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await deleteCustomerMutation.mutateAsync(customer.id)
      } catch (error) {
        console.error('Delete customer error:', error)
      }
    }
  }

  // Edit form validation
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate full name
    if (!editCustomer.name.trim()) {
      errors.name = "Full name is required"
    } else if (editCustomer.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!editCustomer.email.trim()) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(editCustomer.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate phone
    if (!editCustomer.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    // Validate ID/Passport
    if (!editCustomer.id_number.trim()) {
      errors.id_number = "ID/Passport is required"
    }

    setEditValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle edit form submission
  const handleEditSubmit = async () => {
    // Clear backend errors
    setEditBackendErrors({})

    // Validate form
    if (!validateEditForm()) {
      return
    }

    try {
      await updateCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        data: editCustomer
      })

      // Reset form on success
      setEditCustomer({
        name: "",
        id_number: "",
        email: "",
        phone: "",
        language: "",
        country: "",
        cpf: "",
        address: "",
        hotel: "",
        room: "",
        comments: ""
      })
      setEditValidationErrors({})
      setIsEditCustomerOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Customer update error:', error)
    }
  }
  
  // Get customers from API response or fallback to empty array
  const customers = customersResponse?.results || []

  // Transform API customer data to match UI expectations
  const transformedCustomers = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    location: customer.country || customer.location || 'Unknown',
    status: customer.status,
    totalBookings: customer.total_bookings,
    totalSpent: `$${customer.total_spent}`,
    lastBooking: customer.last_booking || 'Never',
    avatar: generateAvatar(customer.name, customer.id)
  }))

  // Apply search filtering (in addition to API search)
  const filteredCustomers = transformedCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats from real data
  const stats = [
    {
      label: "Total Customers",
      value: customersResponse?.count?.toString() || "0",
      icon: Users,
      color: "text-primary"
    },
    {
      label: "Active Customers",
      value: transformedCustomers.filter(c => c.status === 'active').length.toString(),
      icon: Calendar,
      color: "text-success"
    },
    {
      label: "VIP Customers",
      value: transformedCustomers.filter(c => c.status === 'vip').length.toString(),
      icon: DollarSign,
      color: "text-accent"
    },
    {
      label: "This Month",
      value: transformedCustomers.length.toString(),
      icon: Plus,
      color: "text-warning"
    }
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
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newCustomer.name}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, name: e.target.value})
                        // Clear errors when user starts typing
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: '' }))
                        }
                        if (backendErrors.name) {
                          setBackendErrors(prev => ({ ...prev, name: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.name || backendErrors.name ? 'border-destructive' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>
                    )}
                    {backendErrors.name && backendErrors.name.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="id_number">ID/Passport</Label>
                    <Input
                      id="id_number"
                      placeholder="Enter ID or passport number"
                      value={newCustomer.id_number}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, id_number: e.target.value})
                        if (validationErrors.id_number) {
                          setValidationErrors(prev => ({ ...prev, id_number: '' }))
                        }
                        if (backendErrors.id_number) {
                          setBackendErrors(prev => ({ ...prev, id_number: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.id_number || backendErrors.id_number ? 'border-destructive' : ''}
                    />
                    {validationErrors.id_number && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.id_number}</p>
                    )}
                    {backendErrors.id_number && backendErrors.id_number.map((error, idx) => (
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
                    <Label htmlFor="country">Country of origin</Label>
                    <Input
                      id="country"
                      placeholder="Enter country of origin"
                      value={newCustomer.country}
                      onChange={(e) => {
                        setNewCustomer({...newCustomer, country: e.target.value})
                        if (validationErrors.country) {
                          setValidationErrors(prev => ({ ...prev, country: '' }))
                        }
                        if (backendErrors.country) {
                          setBackendErrors(prev => ({ ...prev, country: [] }))
                        }
                      }}
                      disabled={createCustomerMutation.isPending}
                      className={validationErrors.country || backendErrors.country ? 'border-destructive' : ''}
                    />
                    {validationErrors.country && (
                      <p className="text-xs text-destructive mt-1">{validationErrors.country}</p>
                    )}
                    {backendErrors.country && backendErrors.country.map((error, idx) => (
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

                <div>
                  <Label htmlFor="hotel">Default Hotel/Accommodation</Label>
                  <Input
                    id="hotel"
                    placeholder="Enter hotel or accommodation name"
                    value={newCustomer.hotel}
                    onChange={(e) => {
                      setNewCustomer({...newCustomer, hotel: e.target.value})
                      if (validationErrors.hotel) {
                        setValidationErrors(prev => ({ ...prev, hotel: '' }))
                      }
                      if (backendErrors.hotel) {
                        setBackendErrors(prev => ({ ...prev, hotel: [] }))
                      }
                    }}
                    disabled={createCustomerMutation.isPending}
                    className={validationErrors.hotel || backendErrors.hotel ? 'border-destructive' : ''}
                  />
                  {validationErrors.hotel && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.hotel}</p>
                  )}
                  {backendErrors.hotel && backendErrors.hotel.map((error, idx) => (
                    <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="room">Room/Unit Number</Label>
                  <Input
                    id="room"
                    placeholder="Enter room or unit number"
                    value={newCustomer.room}
                    onChange={(e) => {
                      setNewCustomer({...newCustomer, room: e.target.value})
                      if (validationErrors.room) {
                        setValidationErrors(prev => ({ ...prev, room: '' }))
                      }
                      if (backendErrors.room) {
                        setBackendErrors(prev => ({ ...prev, room: [] }))
                      }
                    }}
                    disabled={createCustomerMutation.isPending}
                    className={validationErrors.room || backendErrors.room ? 'border-destructive' : ''}
                  />
                  {validationErrors.room && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.room}</p>
                  )}
                  {backendErrors.room && backendErrors.room.map((error, idx) => (
                    <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="comments">Accommodation Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Enter accommodation comments or special requirements"
                    value={newCustomer.comments}
                    onChange={(e) => {
                      setNewCustomer({...newCustomer, comments: e.target.value})
                      if (validationErrors.comments) {
                        setValidationErrors(prev => ({ ...prev, comments: '' }))
                      }
                      if (backendErrors.comments) {
                        setBackendErrors(prev => ({ ...prev, comments: [] }))
                      }
                    }}
                    disabled={createCustomerMutation.isPending}
                    className={validationErrors.comments || backendErrors.comments ? 'border-destructive' : ''}
                    rows={3}
                  />
                  {validationErrors.comments && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.comments}</p>
                  )}
                  {backendErrors.comments && backendErrors.comments.map((error, idx) => (
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
      {!isLoading && !error && filteredCustomers.length > 0 && (
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
                          <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>Edit customer</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewBookings(customer)}>View bookings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer)}>
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
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading customers...</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Failed to load customers</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Something went wrong while fetching customer data.'}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* No Data State */}
      {!isLoading && !error && filteredCustomers.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? `No customers match "${searchTerm}". Try adjusting your search.`
                : 'Start by adding your first customer to the directory.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsAddCustomerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Customers Cards - Mobile & Tablet */}
      {!isLoading && !error && filteredCustomers.length > 0 && (
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
                    <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>Edit customer</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewBookings(customer)}>View bookings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer)}>
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
      )}

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="w-[95vw] max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View detailed information about this customer.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input value={selectedCustomer.name} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>ID/Passport</Label>
                  <Input value={selectedCustomer.id_number} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={selectedCustomer.email} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={selectedCustomer.phone} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <Label>Language</Label>
                  <Input value={selectedCustomer.language} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Country of origin</Label>
                  <Input value={selectedCustomer.country} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={selectedCustomer.cpf} readOnly className="bg-muted" />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input value={selectedCustomer.address} readOnly className="bg-muted" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Default Hotel/Accommodation</Label>
                  <Input value={selectedCustomer.hotel || 'Not specified'} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Room/Unit Number</Label>
                  <Input value={selectedCustomer.room || 'Not specified'} readOnly className="bg-muted" />
                </div>
              </div>

              <div>
                <Label>Accommodation Comments</Label>
                <Textarea
                  value={selectedCustomer.comments || 'No comments'}
                  readOnly
                  className="bg-muted"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Input value={selectedCustomer.status} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Total Bookings</Label>
                  <Input value={selectedCustomer.total_bookings?.toString() || '0'} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Total Spent</Label>
                  <Input value={`$${selectedCustomer.total_spent || '0.00'}`} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Last Booking</Label>
                  <Input value={selectedCustomer.last_booking || 'Never'} readOnly className="bg-muted" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="w-[95vw] max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and save changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter full name"
                  value={editCustomer.name}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, name: e.target.value})
                    if (editValidationErrors.name) {
                      setEditValidationErrors(prev => ({ ...prev, name: '' }))
                    }
                    if (editBackendErrors.name) {
                      setEditBackendErrors(prev => ({ ...prev, name: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.name || editBackendErrors.name ? 'border-destructive' : ''}
                />
                {editValidationErrors.name && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.name}</p>
                )}
                {editBackendErrors.name && editBackendErrors.name.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
              <div>
                <Label htmlFor="edit-id_number">ID/Passport</Label>
                <Input
                  id="edit-id_number"
                  placeholder="Enter ID or passport number"
                  value={editCustomer.id_number}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, id_number: e.target.value})
                    if (editValidationErrors.id_number) {
                      setEditValidationErrors(prev => ({ ...prev, id_number: '' }))
                    }
                    if (editBackendErrors.id_number) {
                      setEditBackendErrors(prev => ({ ...prev, id_number: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.id_number || editBackendErrors.id_number ? 'border-destructive' : ''}
                />
                {editValidationErrors.id_number && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.id_number}</p>
                )}
                {editBackendErrors.id_number && editBackendErrors.id_number.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email address"
                  value={editCustomer.email}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, email: e.target.value})
                    if (editValidationErrors.email) {
                      setEditValidationErrors(prev => ({ ...prev, email: '' }))
                    }
                    if (editBackendErrors.email) {
                      setEditBackendErrors(prev => ({ ...prev, email: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.email || editBackendErrors.email ? 'border-destructive' : ''}
                />
                {editValidationErrors.email && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.email}</p>
                )}
                {editBackendErrors.email && editBackendErrors.email.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={editCustomer.phone}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, phone: e.target.value})
                    if (editValidationErrors.phone) {
                      setEditValidationErrors(prev => ({ ...prev, phone: '' }))
                    }
                    if (editBackendErrors.phone) {
                      setEditBackendErrors(prev => ({ ...prev, phone: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.phone || editBackendErrors.phone ? 'border-destructive' : ''}
                />
                {editValidationErrors.phone && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.phone}</p>
                )}
                {editBackendErrors.phone && editBackendErrors.phone.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-language">Language</Label>
                <Select
                  value={editCustomer.language}
                  onValueChange={(value) => {
                    setEditCustomer({...editCustomer, language: value})
                    if (editValidationErrors.language) {
                      setEditValidationErrors(prev => ({ ...prev, language: '' }))
                    }
                    if (editBackendErrors.language) {
                      setEditBackendErrors(prev => ({ ...prev, language: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                >
                  <SelectTrigger className={editValidationErrors.language || editBackendErrors.language ? 'border-destructive' : ''}>
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
                {editValidationErrors.language && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.language}</p>
                )}
                {editBackendErrors.language && editBackendErrors.language.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
              <div>
                <Label htmlFor="edit-country">Country of origin</Label>
                <Input
                  id="edit-country"
                  placeholder="Enter country of origin"
                  value={editCustomer.country}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, country: e.target.value})
                    if (editValidationErrors.country) {
                      setEditValidationErrors(prev => ({ ...prev, country: '' }))
                    }
                    if (editBackendErrors.country) {
                      setEditBackendErrors(prev => ({ ...prev, country: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.country || editBackendErrors.country ? 'border-destructive' : ''}
                />
                {editValidationErrors.country && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.country}</p>
                )}
                {editBackendErrors.country && editBackendErrors.country.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
              <div>
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input
                  id="edit-cpf"
                  placeholder="Enter CPF (Brazilian tax ID)"
                  value={editCustomer.cpf}
                  onChange={(e) => {
                    setEditCustomer({...editCustomer, cpf: e.target.value})
                    if (editValidationErrors.cpf) {
                      setEditValidationErrors(prev => ({ ...prev, cpf: '' }))
                    }
                    if (editBackendErrors.cpf) {
                      setEditBackendErrors(prev => ({ ...prev, cpf: [] }))
                    }
                  }}
                  disabled={updateCustomerMutation.isPending}
                  className={editValidationErrors.cpf || editBackendErrors.cpf ? 'border-destructive' : ''}
                />
                {editValidationErrors.cpf && (
                  <p className="text-xs text-destructive mt-1">{editValidationErrors.cpf}</p>
                )}
                {editBackendErrors.cpf && editBackendErrors.cpf.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                placeholder="Enter full address"
                value={editCustomer.address}
                onChange={(e) => {
                  setEditCustomer({...editCustomer, address: e.target.value})
                  if (editValidationErrors.address) {
                    setEditValidationErrors(prev => ({ ...prev, address: '' }))
                  }
                  if (editBackendErrors.address) {
                    setEditBackendErrors(prev => ({ ...prev, address: [] }))
                  }
                }}
                disabled={updateCustomerMutation.isPending}
                className={editValidationErrors.address || editBackendErrors.address ? 'border-destructive' : ''}
              />
              {editValidationErrors.address && (
                <p className="text-xs text-destructive mt-1">{editValidationErrors.address}</p>
              )}
              {editBackendErrors.address && editBackendErrors.address.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>

            <div>
              <Label htmlFor="edit-hotel">Default Hotel/Accommodation</Label>
              <Input
                id="edit-hotel"
                placeholder="Enter hotel or accommodation name"
                value={editCustomer.hotel}
                onChange={(e) => {
                  setEditCustomer({...editCustomer, hotel: e.target.value})
                  if (editValidationErrors.hotel) {
                    setEditValidationErrors(prev => ({ ...prev, hotel: '' }))
                  }
                  if (editBackendErrors.hotel) {
                    setEditBackendErrors(prev => ({ ...prev, hotel: [] }))
                  }
                }}
                disabled={updateCustomerMutation.isPending}
                className={editValidationErrors.hotel || editBackendErrors.hotel ? 'border-destructive' : ''}
              />
              {editValidationErrors.hotel && (
                <p className="text-xs text-destructive mt-1">{editValidationErrors.hotel}</p>
              )}
              {editBackendErrors.hotel && editBackendErrors.hotel.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>

            <div>
              <Label htmlFor="edit-room">Room/Unit Number</Label>
              <Input
                id="edit-room"
                placeholder="Enter room or unit number"
                value={editCustomer.room}
                onChange={(e) => {
                  setEditCustomer({...editCustomer, room: e.target.value})
                  if (editValidationErrors.room) {
                    setEditValidationErrors(prev => ({ ...prev, room: '' }))
                  }
                  if (editBackendErrors.room) {
                    setEditBackendErrors(prev => ({ ...prev, room: [] }))
                  }
                }}
                disabled={updateCustomerMutation.isPending}
                className={editValidationErrors.room || editBackendErrors.room ? 'border-destructive' : ''}
              />
              {editValidationErrors.room && (
                <p className="text-xs text-destructive mt-1">{editValidationErrors.room}</p>
              )}
              {editBackendErrors.room && editBackendErrors.room.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>

            <div>
              <Label htmlFor="edit-comments">Accommodation Comments</Label>
              <Textarea
                id="edit-comments"
                placeholder="Enter accommodation comments or special requirements"
                value={editCustomer.comments}
                onChange={(e) => {
                  setEditCustomer({...editCustomer, comments: e.target.value})
                  if (editValidationErrors.comments) {
                    setEditValidationErrors(prev => ({ ...prev, comments: '' }))
                  }
                  if (editBackendErrors.comments) {
                    setEditBackendErrors(prev => ({ ...prev, comments: [] }))
                  }
                }}
                disabled={updateCustomerMutation.isPending}
                className={editValidationErrors.comments || editBackendErrors.comments ? 'border-destructive' : ''}
                rows={3}
              />
              {editValidationErrors.comments && (
                <p className="text-xs text-destructive mt-1">{editValidationErrors.comments}</p>
              )}
              {editBackendErrors.comments && editBackendErrors.comments.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditSubmit}
              disabled={updateCustomerMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateCustomerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Customer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bookings Modal */}
      <Dialog open={isViewBookingsOpen} onOpenChange={setIsViewBookingsOpen}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Bookings</DialogTitle>
            <DialogDescription>
              View all bookings for {selectedCustomer?.name || 'this customer'}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedCustomer.bookings?.length || 0} Booking(s)
                </h3>
                <Badge className={getStatusColor(selectedCustomer.status)}>
                  {selectedCustomer.status}
                </Badge>
              </div>

              {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedCustomer.bookings.map((booking: any, index: number) => (
                    <Card key={booking.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{booking.destination}</h4>
                          <Badge className={booking.status === 'confirmed' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tour Type:</span> {booking.tour_type}
                          </div>
                          <div>
                            <span className="font-medium">Total Amount:</span> {booking.currency} {booking.total_amount}
                          </div>
                          <div>
                            <span className="font-medium">Start Date:</span> {new Date(booking.start_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Passengers:</span> {booking.passengers}
                          </div>
                          <div>
                            <span className="font-medium">Hotel:</span> {booking.hotel}
                          </div>
                          <div>
                            <span className="font-medium">Room:</span> {booking.room}
                          </div>
                        </div>

                        {booking.additional_notes && (
                          <div>
                            <span className="font-medium">Notes:</span> {booking.additional_notes}
                          </div>
                        )}

                        {booking.booking_tours && booking.booking_tours.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Tour Details:</h5>
                            {booking.booking_tours.map((tour: any, tourIndex: number) => (
                              <div key={tour.id} className="bg-muted p-3 rounded text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div><span className="font-medium">Tour:</span> {tour.tour_name}</div>
                                  <div><span className="font-medium">Code:</span> {tour.tour_code}</div>
                                  <div><span className="font-medium">Pickup:</span> {tour.pickup_address}</div>
                                  <div><span className="font-medium">Time:</span> {tour.pickup_time}</div>
                                  <div><span className="font-medium">Adults:</span> {tour.adult_pax} × ${tour.adult_price}</div>
                                  <div><span className="font-medium">Children:</span> {tour.child_pax} × ${tour.child_price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">
                    This customer hasn't made any bookings yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomersPage