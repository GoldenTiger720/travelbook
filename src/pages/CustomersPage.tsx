import { useState } from "react"
import { useCreateCustomer, useCustomers, useUpdateCustomer, useDeleteCustomer } from "@/hooks/useCustomers"
import Swal from 'sweetalert2'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  Plus,
  Calendar,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import {
  AddCustomerDialog,
  EditCustomerDialog,
  ViewCustomerDetailsDialog,
  ViewCustomerBookingsDialog,
  CustomersTable,
  CustomerCards,
  CustomerStatsCards,
  generateAvatar,
  CustomerFormData
} from "@/components/customer"

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [isViewBookingsOpen, setIsViewBookingsOpen] = useState(false)

  // Handle backend field errors
  const handleFieldErrors = (errors: Record<string, string[]>) => {
    // Errors are handled within the component
    console.log('Backend errors:', errors)
  }

  const createCustomerMutation = useCreateCustomer(handleFieldErrors)
  const updateCustomerMutation = useUpdateCustomer(handleFieldErrors)
  const deleteCustomerMutation = useDeleteCustomer()

  // Fetch customers from API
  const {
    data: customersResponse,
    isLoading,
    error,
    refetch
  } = useCustomers({ search: searchTerm })

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

  // Handle form submission for adding customer
  const handleAddCustomer = async (customer: CustomerFormData) => {
    await createCustomerMutation.mutateAsync(customer)
    setIsAddCustomerOpen(false)
  }

  // Handle view details
  const handleViewDetails = (customer: any) => {
    const originalCustomer = customers.find(c => c.id === customer.id)
    if (originalCustomer) {
      setSelectedCustomer(originalCustomer)
      setIsViewDetailsOpen(true)
    }
  }

  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    const originalCustomer = customers.find(c => c.id === customer.id)
    if (originalCustomer) {
      setSelectedCustomer(originalCustomer)
      setIsEditCustomerOpen(true)
    }
  }

  // Handle view bookings
  const handleViewBookings = (customer: any) => {
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

  // Handle edit form submission
  const handleUpdateCustomer = async (id: string, data: CustomerFormData) => {
    await updateCustomerMutation.mutateAsync({ id, data })
    setIsEditCustomerOpen(false)
    setSelectedCustomer(null)
  }

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
          <AddCustomerDialog
            isOpen={isAddCustomerOpen}
            onOpenChange={setIsAddCustomerOpen}
            onSubmit={handleAddCustomer}
            isPending={createCustomerMutation.isPending}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <CustomerStatsCards stats={stats} />

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
        <CustomersTable
          customers={filteredCustomers}
          onViewDetails={handleViewDetails}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
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
        <CustomerCards
          customers={filteredCustomers}
          onViewDetails={handleViewDetails}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {/* View Details Modal */}
      <ViewCustomerDetailsDialog
        isOpen={isViewDetailsOpen}
        onOpenChange={setIsViewDetailsOpen}
        customer={selectedCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerDialog
        isOpen={isEditCustomerOpen}
        onOpenChange={setIsEditCustomerOpen}
        customer={selectedCustomer}
        onSubmit={handleUpdateCustomer}
        isPending={updateCustomerMutation.isPending}
      />

      {/* View Bookings Modal */}
      <ViewCustomerBookingsDialog
        isOpen={isViewBookingsOpen}
        onOpenChange={setIsViewBookingsOpen}
        customer={selectedCustomer}
      />
    </div>
  )
}

export default CustomersPage
