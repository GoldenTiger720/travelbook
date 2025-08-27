import { useState } from "react"
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
  Download,
  Upload
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and booking history
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer to your travel agency database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input id="phone" type="tel" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input id="location" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea id="notes" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setIsAddCustomerOpen(false)}>
                  Add Customer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
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
    </div>
  )
}

export default CustomersPage