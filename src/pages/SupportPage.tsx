import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Ticket,
  User,
} from "lucide-react"

// Mock data for active support tickets
const activeTicketsData = [
  {
    id: 1,
    ticketNumber: "TICKET#12279",
    title: "Payment integration error",
    description: "Users are experiencing issues with credit card payments during checkout process. Error occurs after entering card details.",
    status: "open",
    priority: "high",
    type: "technical",
    operator: "support@zenithtravel.com",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z"
  },
  {
    id: 2,
    ticketNumber: "TICKET#12278",
    title: "Tour booking confirmation emails",
    description: "Confirmation emails are not being sent to customers after successful tour bookings.",
    status: "in-progress",
    priority: "medium",
    type: "feature",
    operator: "tech.support@zenithtravel.com",
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-15T10:15:00Z"
  },
  {
    id: 3,
    ticketNumber: "TICKET#12277",
    title: "Mobile app login issues",
    description: "Several users reported being unable to login to the mobile application with valid credentials.",
    status: "scheduled",
    priority: "high",
    type: "bug",
    operator: "mobile.support@zenithtravel.com",
    createdAt: "2024-01-14T11:20:00Z",
    updatedAt: "2024-01-15T08:30:00Z"
  },
  {
    id: 4,
    ticketNumber: "TICKET#12276",
    title: "Dashboard loading performance",
    description: "Dashboard takes too long to load, especially the financial reports section.",
    status: "overdue",
    priority: "medium",
    type: "performance",
    operator: "performance.team@zenithtravel.com",
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-12T16:45:00Z"
  },
  {
    id: 5,
    ticketNumber: "TICKET#12275",
    title: "User role permissions",
    description: "Need to implement new user role for tour guides with specific permissions for itinerary management.",
    status: "closed",
    priority: "low",
    type: "feature",
    operator: "access.control@zenithtravel.com",
    createdAt: "2024-01-08T10:15:00Z",
    updatedAt: "2024-01-13T15:30:00Z"
  },
  {
    id: 6,
    ticketNumber: "TICKET#12274",
    title: "Database backup issue",
    description: "Automated database backup failed on January 12th. Need to investigate and implement fix.",
    status: "closed",
    priority: "high",
    type: "technical",
    operator: "database.admin@zenithtravel.com",
    createdAt: "2024-01-12T22:00:00Z",
    updatedAt: "2024-01-14T09:00:00Z"
  }
]

const SupportPage = () => {
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("all") // all, closed, monthly

  // Calculate status counts
  const statusCounts = {
    open: activeTicketsData.filter(t => t.status === 'open').length,
    inProgress: activeTicketsData.filter(t => t.status === 'in-progress').length,
    scheduled: activeTicketsData.filter(t => t.status === 'scheduled').length,
    overdue: activeTicketsData.filter(t => t.status === 'overdue').length,
    closed: activeTicketsData.filter(t => t.status === 'closed').length,
    total: activeTicketsData.length
  }

  // Filter active tickets based on view mode
  const activeTickets = activeTicketsData.filter(ticket => {
    if (viewMode === "closed") return ticket.status === "closed"
    if (viewMode === "active") return ticket.status !== "closed"
    return true // "all" mode
  })

  // Filter internal tickets
  const filteredInternalTickets = activeTicketsData.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesType = typeFilter === "all" || ticket.type === typeFilter
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { color: 'bg-red-100 text-red-800 hover:bg-red-200', icon: AlertCircle },
      'in-progress': { color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', icon: Clock },
      'scheduled': { color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', icon: Calendar },
      'overdue': { color: 'bg-orange-100 text-orange-800 hover:bg-orange-200', icon: AlertCircle },
      'closed': { color: 'bg-green-100 text-green-800 hover:bg-green-200', icon: CheckCircle2 }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="secondary">{status}</Badge>

    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800', 
      'high': 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="-mx-6 px-6 overflow-x-hidden">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Support Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage support tickets and technical assistance
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            <span>New Ticket</span>
          </Button>
        </div>

        {/* Status Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-red-800 dark:text-red-200">Open</p>
            <p className="text-lg sm:text-xl font-bold text-red-900 dark:text-red-100">{statusCounts.open}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Progress</p>
            <p className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">{statusCounts.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-purple-800 dark:text-purple-200">Scheduled</p>
            <p className="text-lg sm:text-xl font-bold text-purple-900 dark:text-purple-100">{statusCounts.scheduled}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-orange-800 dark:text-orange-200">Overdue</p>
            <p className="text-lg sm:text-xl font-bold text-orange-900 dark:text-orange-100">{statusCounts.overdue}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-green-800 dark:text-green-200">Closed</p>
            <p className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">{statusCounts.closed}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800 min-w-0">
          <CardContent className="p-2 sm:p-3">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Total</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.total}</p>
          </CardContent>
        </Card>
        </div>

        {/* Quick Filters and Actions */}
        <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5 text-primary" />
                  <span className="truncate">Quick Actions & Filters</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Filter and manage support tickets efficiently
                </CardDescription>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={viewMode === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("all")}
                className="text-xs sm:text-sm"
              >
                All Tickets
              </Button>
              <Button 
                variant={viewMode === "active" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("active")}
                className="text-xs sm:text-sm"
              >
                Active
              </Button>
              <Button 
                variant={viewMode === "closed" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("closed")}
                className="text-xs sm:text-sm"
              >
                Closed
              </Button>
              <Button 
                variant={viewMode === "monthly" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("monthly")}
                className="text-xs sm:text-sm"
              >
                Monthly
              </Button>
            </div>

            {/* Search and Filters - Mobile Stacked */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Filters - Desktop */}
            <div className="hidden sm:flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tickets by title, description, or ticket number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        </Card>

        {/* Active Tickets List */}
        <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="truncate">Active Tickets ({activeTickets.filter(t => t.status !== 'closed').length})</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Currently active support tickets requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-hidden">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Ticket</TableHead>
                  <TableHead className="w-[150px]">Operator</TableHead>
                  <TableHead className="w-[200px]">Details</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Priority</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[90px]">Created</TableHead>
                  <TableHead className="w-[70px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTickets.filter(t => t.status !== 'closed').map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Ticket className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {ticket.ticketNumber}
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">#{ticket.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-[150px]">
                        {ticket.operator}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium text-sm truncate">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {ticket.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {ticket.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            Contact Operator
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            View History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-border overflow-hidden">
            {activeTickets.filter(t => t.status !== 'closed').map((ticket) => (
              <div key={ticket.id} className="p-3 space-y-2">
                {/* Header with ticket number and actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className="p-1 rounded bg-primary/10 shrink-0">
                      <Ticket className="w-3 h-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">#{ticket.id}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Ticket
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Contact Operator
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        View History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Ticket details */}
                <div className="space-y-1">
                  <div className="font-medium text-xs">{ticket.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </div>
                </div>

                {/* Operator info */}
                <div className="text-xs text-muted-foreground truncate">
                  {ticket.operator}
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  <Badge variant="outline" className="capitalize text-xs">
                    {ticket.type}
                  </Badge>
                </div>

                {/* Creation date */}
                <div className="text-xs text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>

        {/* Internal Ticket Table - Agency Interaction History */}
        <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-primary" />
            <span className="truncate">Internal Ticket Table</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Agency's complete interaction history with platform support
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-hidden">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Request #</TableHead>
                  <TableHead className="w-[250px]">Request Details</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Operator</TableHead>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[70px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInternalTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {ticket.ticketNumber.replace('TICKET', '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px]">
                        <div className="font-medium text-sm truncate">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {ticket.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {ticket.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-[150px]">
                        {ticket.operator}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            Contact Support
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            View History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-border overflow-hidden">
            {filteredInternalTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs">
                      Request {ticket.ticketNumber.replace('TICKET', '')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ticket.title}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Contact Support
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {ticket.description}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                  <Badge variant="outline" className="capitalize text-xs">
                    {ticket.type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{ticket.operator}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SupportPage