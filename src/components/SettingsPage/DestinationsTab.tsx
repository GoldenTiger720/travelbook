import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  MapPin,
  Plus,
  Search,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Map,
} from 'lucide-react'
import { destinationService, CreateDestinationData, UpdateDestinationData, Destination } from '@/services/destinationService'


// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

const DestinationsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [showNewDestinationDialog, setShowNewDestinationDialog] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true)

  // Form data states
  const [createFormData, setCreateFormData] = useState<CreateDestinationData>({
    name: '',
    country: '',
    region: '',
    language: '',
    status: 'active'
  })
  const [editFormData, setEditFormData] = useState<UpdateDestinationData>({})

  // Load destinations from API on component mount
  useEffect(() => {
    const loadDestinations = async () => {
      setIsLoadingDestinations(true)
      try {
        const fetchedDestinations = await destinationService.getDestinations()
        setDestinations(Array.isArray(fetchedDestinations) ? fetchedDestinations : [])
      } catch (error) {
        console.error('Error loading destinations:', error)
        setDestinations([])
      } finally {
        setIsLoadingDestinations(false)
      }
    }

    loadDestinations()
  }, [])

  // Filter destinations based on search and filters
  const filteredDestinations = (destinations || []).filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || destination.status === statusFilter
    const matchesRegion = regionFilter === "all" || destination.region === regionFilter

    return matchesSearch && matchesStatus && matchesRegion
  })

  // Handle create destination
  const handleCreateDestination = async () => {
    if (!createFormData.name || !createFormData.country || !createFormData.region) {
      toast.warning('Please fill in all required fields (Name, Country, and Region).')
      return
    }

    setIsLoading(true)
    try {
      await destinationService.createDestination(createFormData)
      setShowNewDestinationDialog(false)
      resetCreateForm()
      // Refresh destinations list
      const updatedDestinations = await destinationService.getDestinations()
      setDestinations(Array.isArray(updatedDestinations) ? updatedDestinations : [])

      toast.success('Destination created successfully!')
    } catch (error) {
      console.error('Error creating destination:', error)
      toast.error('Error creating destination. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle update destination
  const handleUpdateDestination = async () => {
    if (!selectedDestination || !editFormData) {
      toast.warning('No destination data to update')
      return
    }

    setIsLoading(true)
    try {
      await destinationService.updateDestination(selectedDestination.id.toString(), editFormData)
      setShowEditDialog(false)
      setSelectedDestination(null)
      setEditFormData({})
      // Refresh destinations list
      const updatedDestinations = await destinationService.getDestinations()
      setDestinations(Array.isArray(updatedDestinations) ? updatedDestinations : [])
      toast.success('Destination updated successfully!')
    } catch (error) {
      console.error('Error updating destination:', error)
      toast.error('Error updating destination. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete destination
  const handleDeleteDestination = async (destination: Destination) => {
    const result = await Swal.fire({
      title: 'Delete Destination',
      text: `Are you sure you want to delete "${destination.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    setIsLoading(true)
    try {
      await destinationService.deleteDestination(destination.id.toString())
      // Refresh destinations list
      const updatedDestinations = await destinationService.getDestinations()
      setDestinations(Array.isArray(updatedDestinations) ? updatedDestinations : [])
      toast.success('Destination deleted successfully!')
    } catch (error) {
      console.error('Error deleting destination:', error)
      toast.error('Error deleting destination. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      country: '',
      region: '',
      language: '',
      status: 'active'
    })
  }

  // Handle create form changes
  const handleCreateFormChange = (field: keyof CreateDestinationData, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle edit form changes
  const handleEditFormChange = (field: keyof UpdateDestinationData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Initialize edit form when destination is selected
  useEffect(() => {
    if (selectedDestination && showEditDialog) {
      setEditFormData({
        name: selectedDestination.name,
        country: selectedDestination.country,
        region: selectedDestination.region,
        language: selectedDestination.language,
        status: selectedDestination.status
      })
    }
  }, [selectedDestination, showEditDialog])


  return (
    <div className="space-y-3 sm:space-y-6 w-full max-w-full overflow-x-hidden min-w-0 box-border relative px-0">
      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="truncate">Destinations Management</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Manage destinations and serviced cities for tour operations
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowNewDestinationDialog(true)}
                className="w-full sm:w-auto shrink-0 h-9 sm:h-10"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden xs:inline">New Destination</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>

            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="South America">South America</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="w-full h-9">
                <Download className="w-3 h-3 mr-2" />
                <span className="text-sm">Export</span>
              </Button>
            </div>

            {/* Desktop: Horizontal filters */}
            <div className="hidden sm:flex gap-3 lg:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search destinations or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] sm:w-[120px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-10">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Destinations Table */}
      <Card className="overflow-hidden w-full max-w-full">
        <CardContent className="p-0 overflow-hidden w-full max-w-full">
          {isLoadingDestinations ? (
            <div className="flex justify-center items-center py-8 w-full overflow-hidden">
              <div className="text-muted-foreground text-sm">Loading destinations...</div>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="flex justify-center items-center py-8 w-full overflow-hidden">
              <div className="text-muted-foreground text-sm">No destinations found</div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
            <Table className="min-w-[500px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Destination</TableHead>
                  <TableHead className="min-w-[150px]">Country/Region</TableHead>
                  <TableHead className="min-w-[100px]">Language</TableHead>
                  <TableHead className="min-w-[120px]">Created Date</TableHead>
                  <TableHead className="text-center min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDestinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                          <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate max-w-[180px]" title={destination.name}>{destination.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <Badge variant={destination.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {destination.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{destination.country}</div>
                        <div className="text-sm text-muted-foreground truncate">{destination.region}</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <Badge variant="secondary" className="text-xs truncate max-w-[80px]">
                        {destination.language}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="text-sm font-medium">{formatDate(destination.created_at)}</div>
                      <div className="text-xs text-muted-foreground">ID: {destination.id.substring(0, 8)}...</div>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDestination(destination)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Destination
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteDestination(destination)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Destination
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
          <div className="lg:hidden divide-y divide-border px-2 sm:px-3 overflow-x-hidden w-full max-w-full box-border">
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="p-2 sm:p-3 space-y-2 sm:space-y-3 w-full max-w-full overflow-hidden box-border">
                {/* Header with destination name and actions */}
                <div className="flex items-start justify-between gap-2 w-full max-w-full min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 shrink-0">
                      <Map className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate max-w-[200px]" title={destination.name}>{destination.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <Badge variant={destination.status === 'active' ? 'default' : 'secondary'} className="text-xs mr-2">
                          {destination.status}
                        </Badge>
                        ID: {destination.id.substring(0, 8)}...
                      </div>
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
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDestination(destination)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Destination
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteDestination(destination)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Destination
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs w-full max-w-full min-w-0 overflow-hidden">
                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-1">Country/Region</div>
                    <div className="font-medium text-sm truncate">{destination.country}</div>
                    <div className="text-muted-foreground text-xs truncate">{destination.region}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted-foreground mb-1">Language</div>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {destination.language}
                    </Badge>
                  </div>
                  <div className="col-span-1 xs:col-span-2">
                    <div className="text-muted-foreground mb-1">Created Date</div>
                    <div className="text-sm font-medium">{formatDate(destination.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Destination Dialog */}
      <Dialog open={showNewDestinationDialog} onOpenChange={setShowNewDestinationDialog}>
        <DialogContent className="w-[calc(100vw-16px)] max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6 mx-2 sm:mx-4 my-2 sm:my-4">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-sm sm:text-lg font-semibold">Create New Destination</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Add a new destination with serviced cities and details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 mt-4 sm:mt-0 w-full max-w-full overflow-hidden">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newDestinationName" className="text-sm font-medium">Destination Name *</Label>
                  <Input
                    id="newDestinationName"
                    placeholder="e.g., Buenos Aires"
                    className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                    value={createFormData.name}
                    onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newCountry" className="text-sm font-medium">Country *</Label>
                  <Input
                    id="newCountry"
                    placeholder="e.g., Argentina"
                    className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                    value={createFormData.country}
                    onChange={(e) => handleCreateFormChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Location Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Location Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newRegion" className="text-sm font-medium">Region *</Label>
                  <Select value={createFormData.region} onValueChange={(value) => handleCreateFormChange('region', value)}>
                    <SelectTrigger className="text-sm h-10">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="South America">South America</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="Africa">Africa</SelectItem>
                      <SelectItem value="Oceania">Oceania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newLanguage" className="text-sm font-medium">Primary Language</Label>
                  <Input
                    id="newLanguage"
                    placeholder="e.g., Spanish"
                    className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                    value={createFormData.language}
                    onChange={(e) => handleCreateFormChange('language', e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Status Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label htmlFor="newStatus" className="text-sm font-medium">Active Destination</Label>
                  <p className="text-xs text-muted-foreground">Enable this destination for bookings</p>
                </div>
                <Switch
                  id="newStatus"
                  checked={createFormData.status === 'active'}
                  onCheckedChange={(checked) => handleCreateFormChange('status', checked ? 'active' : 'inactive')}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 sm:pt-6">
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewDestinationDialog(false)
                  resetCreateForm()
                }}
                className="w-full sm:w-auto h-10 text-sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDestination}
                disabled={isLoading || !createFormData.name || !createFormData.country || !createFormData.region}
                className="w-full sm:w-auto h-10 text-sm font-medium"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  'Create Destination'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Destination Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[calc(100vw-16px)] max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-3 sm:p-6 mx-2 sm:mx-4 my-2 sm:my-4">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-sm sm:text-lg font-semibold">Edit Destination</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Modify destination information and serviced cities
            </DialogDescription>
          </DialogHeader>
          {selectedDestination && editFormData && (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 mt-4 sm:mt-0 w-full max-w-full overflow-hidden">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDestinationName" className="text-sm font-medium">Destination Name *</Label>
                    <Input
                      id="editDestinationName"
                      className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCountry" className="text-sm font-medium">Country *</Label>
                    <Input
                      id="editCountry"
                      className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                      value={editFormData.country || ''}
                      onChange={(e) => handleEditFormChange('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Location Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Location Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRegion" className="text-sm font-medium">Region *</Label>
                    <Select value={editFormData.region} onValueChange={(value) => handleEditFormChange('region', value)}>
                      <SelectTrigger className="text-sm h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South America">South America</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                        <SelectItem value="Oceania">Oceania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLanguage" className="text-sm font-medium">Primary Language</Label>
                    <Input
                      id="editLanguage"
                      className="text-sm h-10 focus:ring-2 focus:ring-ring w-full min-w-0"
                      value={editFormData.language || ''}
                      onChange={(e) => handleEditFormChange('language', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-1">
                    <Label htmlFor="editStatus" className="text-sm font-medium">Active Destination</Label>
                    <p className="text-xs text-muted-foreground">Enable this destination for bookings</p>
                  </div>
                  <Switch
                    id="editStatus"
                    checked={editFormData.status === 'active'}
                    onCheckedChange={(checked) => handleEditFormChange('status', checked ? 'active' : 'inactive')}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 sm:pt-6">
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="w-full sm:w-auto h-10 text-sm"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDestination}
                disabled={isLoading || !editFormData.name || !editFormData.country || !editFormData.region}
                className="w-full sm:w-auto h-10 text-sm font-medium"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DestinationsTab