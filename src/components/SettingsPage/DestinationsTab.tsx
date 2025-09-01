import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Globe,
  Map,
  Building,
  Users,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Mock data for destinations
const destinationsData = [
  {
    id: 1,
    name: "Buenos Aires",
    country: "Argentina",
    region: "South America",
    cities: ["Buenos Aires", "La Plata", "Tigre"],
    toursCount: 15,
    status: "active",
    description: "Capital and largest city of Argentina",
    coordinates: "-34.6118, -58.3960",
    timezone: "America/Buenos_Aires",
    language: "Spanish"
  },
  {
    id: 2,
    name: "Patagonia",
    country: "Argentina/Chile",
    region: "South America",
    cities: ["Bariloche", "El Calafate", "Ushuaia", "Puerto Natales"],
    toursCount: 8,
    status: "active",
    description: "Stunning natural landscapes and glaciers",
    coordinates: "-50.0000, -73.0000",
    timezone: "America/Buenos_Aires",
    language: "Spanish"
  },
  {
    id: 3,
    name: "Iguazu Falls",
    country: "Argentina/Brazil",
    region: "South America",
    cities: ["Puerto Iguazu", "Foz do Iguaçu"],
    toursCount: 12,
    status: "active",
    description: "One of the largest waterfalls systems in the world",
    coordinates: "-25.6953, -54.4367",
    timezone: "America/Buenos_Aires",
    language: "Spanish/Portuguese"
  },
  {
    id: 4,
    name: "Mendoza",
    country: "Argentina",
    region: "South America",
    cities: ["Mendoza", "San Rafael", "Malargüe"],
    toursCount: 10,
    status: "active",
    description: "Famous wine region in the foothills of the Andes",
    coordinates: "-32.8908, -68.8272",
    timezone: "America/Mendoza",
    language: "Spanish"
  },
  {
    id: 5,
    name: "Cusco",
    country: "Peru",
    region: "South America",
    cities: ["Cusco", "Machu Picchu", "Sacred Valley"],
    toursCount: 6,
    status: "inactive",
    description: "Historic capital of the Inca Empire",
    coordinates: "-13.5319, -71.9675",
    timezone: "America/Lima",
    language: "Spanish/Quechua"
  },
  {
    id: 6,
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    cities: ["Rio de Janeiro", "Niterói", "Petrópolis"],
    toursCount: 7,
    status: "active",
    description: "Marvelous city with iconic landmarks",
    coordinates: "-22.9068, -43.1729",
    timezone: "America/Sao_Paulo",
    language: "Portuguese"
  }
]

const DestinationsTab: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [showNewDestinationDialog, setShowNewDestinationDialog] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filter destinations based on search and filters
  const filteredDestinations = destinationsData.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.cities.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || destination.status === statusFilter
    const matchesRegion = regionFilter === "all" || destination.region === regionFilter
    
    return matchesSearch && matchesStatus && matchesRegion
  })

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <Globe className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        <MapPin className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="truncate">Destinations Management</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage destinations and serviced cities for tour operations
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowNewDestinationDialog(true)}
                className="w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Destination</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
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
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Desktop: Horizontal filters */}
            <div className="hidden sm:flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search destinations or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[150px]">
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Destinations Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Country/Region</TableHead>
                  <TableHead>Serviced Cities</TableHead>
                  <TableHead className="text-center">Tours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
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
                        <div>
                          <div className="font-medium">{destination.name}</div>
                          <div className="text-sm text-muted-foreground">{destination.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{destination.country}</div>
                        <div className="text-sm text-muted-foreground">{destination.region}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {destination.cities.slice(0, 2).map((city, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {city}
                          </Badge>
                        ))}
                        {destination.cities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{destination.cities.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{destination.toursCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(destination.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {destination.language}
                      </Badge>
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
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            View Tours
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
          <div className="lg:hidden divide-y divide-border">
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="p-4 space-y-3">
                {/* Header with destination name and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 shrink-0">
                      <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{destination.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{destination.description}</div>
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
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedDestination(destination)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Destination
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="w-4 h-4 mr-2" />
                        View Tours
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Destination
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Country/Region</div>
                    <div className="font-medium text-sm">{destination.country}</div>
                    <div className="text-muted-foreground">{destination.region}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Tours</div>
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{destination.toursCount}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground mb-1">Serviced Cities</div>
                    <div className="flex flex-wrap gap-1">
                      {destination.cities.slice(0, 3).map((city, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                      {destination.cities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{destination.cities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with status and language */}
                <div className="flex items-center justify-between pt-2">
                  {getStatusBadge(destination.status)}
                  <Badge variant="secondary" className="text-xs">
                    {destination.language}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Destination Dialog */}
      <Dialog open={showNewDestinationDialog} onOpenChange={setShowNewDestinationDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create New Destination</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new destination with serviced cities and details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newDestinationName" className="text-sm font-medium">Destination Name</Label>
              <Input id="newDestinationName" placeholder="e.g., Buenos Aires" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCountry" className="text-sm font-medium">Country</Label>
              <Input id="newCountry" placeholder="e.g., Argentina" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRegion" className="text-sm font-medium">Region</Label>
              <Select>
                <SelectTrigger className="text-sm">
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
              <Input id="newLanguage" placeholder="e.g., Spanish" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTimezone" className="text-sm font-medium">Timezone</Label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Buenos_Aires">America/Buenos_Aires</SelectItem>
                  <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                  <SelectItem value="America/Lima">America/Lima</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCoordinates" className="text-sm font-medium">Coordinates</Label>
              <Input id="newCoordinates" placeholder="e.g., -34.6118, -58.3960" className="text-sm" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="newCities" className="text-sm font-medium">Serviced Cities</Label>
              <Input id="newCities" placeholder="Enter cities separated by commas" className="text-sm" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="newDescription" className="text-sm font-medium">Description</Label>
              <Textarea 
                id="newDescription" 
                placeholder="Brief description of the destination" 
                rows={3} 
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label htmlFor="newStatus" className="text-sm font-medium">Active Destination</Label>
              <Switch id="newStatus" defaultChecked />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNewDestinationDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowNewDestinationDialog(false)}
              className="w-full sm:w-auto"
            >
              Create Destination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Destination Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Destination</DialogTitle>
            <DialogDescription className="text-sm">
              Modify destination information and serviced cities
            </DialogDescription>
          </DialogHeader>
          {selectedDestination && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDestinationName" className="text-sm font-medium">Destination Name</Label>
                <Input id="editDestinationName" defaultValue={selectedDestination.name} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCountry" className="text-sm font-medium">Country</Label>
                <Input id="editCountry" defaultValue={selectedDestination.country} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRegion" className="text-sm font-medium">Region</Label>
                <Select defaultValue={selectedDestination.region}>
                  <SelectTrigger className="text-sm">
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
                <Input id="editLanguage" defaultValue={selectedDestination.language} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTimezone" className="text-sm font-medium">Timezone</Label>
                <Select defaultValue={selectedDestination.timezone}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Buenos_Aires">America/Buenos_Aires</SelectItem>
                    <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                    <SelectItem value="America/Lima">America/Lima</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCoordinates" className="text-sm font-medium">Coordinates</Label>
                <Input id="editCoordinates" defaultValue={selectedDestination.coordinates} className="text-sm" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="editCities" className="text-sm font-medium">Serviced Cities</Label>
                <Input id="editCities" defaultValue={selectedDestination.cities.join(', ')} className="text-sm" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="editDescription" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="editDescription" 
                  defaultValue={selectedDestination.description} 
                  rows={3} 
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-2 sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label htmlFor="editStatus" className="text-sm font-medium">Active Destination</Label>
                <Switch id="editStatus" defaultChecked={selectedDestination.status === 'active'} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DestinationsTab