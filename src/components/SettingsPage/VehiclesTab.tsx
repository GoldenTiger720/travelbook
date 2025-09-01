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
  Car,
  Plus,
  Search,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Fuel,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Mock data for vehicles
const vehiclesData = [
  {
    id: 1,
    licensePlate: "ABC-123",
    name: "Mercedes Sprinter 1",
    brand: "Mercedes-Benz",
    model: "Sprinter 415",
    capacity: 16,
    year: 2022,
    fuelType: "Diesel",
    isExternal: false,
    status: "active",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    driver: "Luis Martinez",
    notes: "Regular maintenance required every 3 months"
  },
  {
    id: 2,
    licensePlate: "DEF-456",
    name: "Iveco Daily Tour",
    brand: "Iveco",
    model: "Daily 50C",
    capacity: 25,
    year: 2021,
    fuelType: "Diesel",
    isExternal: false,
    status: "active",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-04-05",
    driver: "Carlos Rodriguez",
    notes: "Air conditioning serviced recently"
  },
  {
    id: 3,
    licensePlate: "GHI-789",
    name: "Ford Transit City",
    brand: "Ford",
    model: "Transit 350",
    capacity: 12,
    year: 2023,
    fuelType: "Diesel",
    isExternal: false,
    status: "maintenance",
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-04-12",
    driver: "Ana Silva",
    notes: "Currently in maintenance - brake system check"
  },
  {
    id: 4,
    licensePlate: "JKL-012",
    name: "External Bus Partner",
    brand: "Volvo",
    model: "9700",
    capacity: 45,
    year: 2020,
    fuelType: "Diesel",
    isExternal: true,
    status: "active",
    lastMaintenance: "2023-12-20",
    nextMaintenance: "2024-03-20",
    driver: "External Driver",
    notes: "Managed by partner company - Premium Tours"
  },
  {
    id: 5,
    licensePlate: "MNO-345",
    name: "Toyota Hiace Eco",
    brand: "Toyota",
    model: "Hiace",
    capacity: 8,
    year: 2023,
    fuelType: "Hybrid",
    isExternal: false,
    status: "inactive",
    lastMaintenance: "2023-11-15",
    nextMaintenance: "2024-02-15",
    driver: "Sofia Gonzalez",
    notes: "Temporarily out of service - insurance renewal pending"
  }
]

const VehiclesTab: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showNewVehicleDialog, setShowNewVehicleDialog] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filter vehicles based on search and filters
  const filteredVehicles = vehiclesData.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    const matchesType = typeFilter === "all" || 
                       (typeFilter === "internal" && !vehicle.isExternal) ||
                       (typeFilter === "external" && vehicle.isExternal)
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'maintenance':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Calendar className="w-3 h-3 mr-1" />
            Maintenance
          </Badge>
        )
      case 'inactive':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVehicleTypeBadge = (isExternal: boolean) => {
    return isExternal ? (
      <Badge className="bg-blue-100 text-blue-800">
        <ExternalLink className="w-3 h-3 mr-1" />
        External
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">
        <Car className="w-3 h-3 mr-1" />
        Internal
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
                  <Car className="w-5 h-5 text-primary" />
                  <span className="truncate">Fleet Management</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage your vehicle fleet including internal and external vehicles
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowNewVehicleDialog(true)}
                className="w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Vehicle</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            {/* Mobile: Stacked filters */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vehicles..."
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
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
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
                  placeholder="Search vehicles, license plates, or models..."
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
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
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

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Brand/Model</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                          <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.year} • {vehicle.fuelType}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-medium">{vehicle.licensePlate}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehicle.brand}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{vehicle.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVehicleTypeBadge(vehicle.isExternal)}
                    </TableCell>
                    <TableCell>{vehicle.driver}</TableCell>
                    <TableCell>
                      {getStatusBadge(vehicle.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{vehicle.nextMaintenance}</div>
                        {new Date(vehicle.nextMaintenance) < new Date() && (
                          <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                        )}
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
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="w-4 h-4 mr-2" />
                            View Location
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Vehicle
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
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 space-y-3">
                {/* Header with vehicle name and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 shrink-0">
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{vehicle.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.year} • {vehicle.fuelType}
                      </div>
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
                          setSelectedVehicle(vehicle)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Vehicle
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MapPin className="w-4 h-4 mr-2" />
                        View Location
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Vehicle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* License plate and brand info */}
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-medium bg-muted px-2 py-1 rounded">
                    {vehicle.licensePlate}
                  </div>
                  <div className="text-xs text-right">
                    <div className="font-medium">{vehicle.brand}</div>
                    <div className="text-muted-foreground">{vehicle.model}</div>
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Capacity</div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{vehicle.capacity}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Type</div>
                    {getVehicleTypeBadge(vehicle.isExternal)}
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground mb-1">Driver</div>
                    <div className="font-medium text-sm">{vehicle.driver}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Status</div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Next Maintenance</div>
                    <div className="text-sm">
                      <div>{vehicle.nextMaintenance}</div>
                      {new Date(vehicle.nextMaintenance) < new Date() && (
                        <Badge variant="destructive" className="text-xs mt-1">Overdue</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Vehicle Dialog */}
      <Dialog open={showNewVehicleDialog} onOpenChange={setShowNewVehicleDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Register New Vehicle</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new vehicle to your fleet management system
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newLicensePlate" className="text-sm font-medium">License Plate</Label>
              <Input id="newLicensePlate" placeholder="ABC-123" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newVehicleName" className="text-sm font-medium">Vehicle Name</Label>
              <Input id="newVehicleName" placeholder="Mercedes Sprinter 1" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBrand" className="text-sm font-medium">Brand</Label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                  <SelectItem value="iveco">Iveco</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                  <SelectItem value="volvo">Volvo</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="volkswagen">Volkswagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newModel" className="text-sm font-medium">Model</Label>
              <Input id="newModel" placeholder="Sprinter 415" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCapacity" className="text-sm font-medium">Capacity</Label>
              <Input id="newCapacity" type="number" placeholder="16" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newYear" className="text-sm font-medium">Year</Label>
              <Input id="newYear" type="number" placeholder="2024" className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newFuelType" className="text-sm font-medium">Fuel Type</Label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDriver" className="text-sm font-medium">Assigned Driver</Label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luis">Luis Martinez</SelectItem>
                  <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                  <SelectItem value="ana">Ana Silva</SelectItem>
                  <SelectItem value="sofia">Sofia Gonzalez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="newNotes" className="text-sm font-medium">Notes</Label>
              <Textarea 
                id="newNotes" 
                placeholder="Additional notes about the vehicle" 
                rows={3} 
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label htmlFor="newIsExternal" className="text-sm font-medium">External Vehicle</Label>
              <Switch id="newIsExternal" />
            </div>
            <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label htmlFor="newStatus" className="text-sm font-medium">Active Status</Label>
              <Switch id="newStatus" defaultChecked />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNewVehicleDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowNewVehicleDialog(false)}
              className="w-full sm:w-auto"
            >
              Register Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Vehicle</DialogTitle>
            <DialogDescription className="text-sm">
              Modify vehicle information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editLicensePlate" className="text-sm font-medium">License Plate</Label>
                <Input id="editLicensePlate" defaultValue={selectedVehicle.licensePlate} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVehicleName" className="text-sm font-medium">Vehicle Name</Label>
                <Input id="editVehicleName" defaultValue={selectedVehicle.name} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBrand" className="text-sm font-medium">Brand</Label>
                <Select defaultValue={selectedVehicle.brand.toLowerCase()}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                    <SelectItem value="iveco">Iveco</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="volvo">Volvo</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="volkswagen">Volkswagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editModel" className="text-sm font-medium">Model</Label>
                <Input id="editModel" defaultValue={selectedVehicle.model} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCapacity" className="text-sm font-medium">Capacity</Label>
                <Input id="editCapacity" type="number" defaultValue={selectedVehicle.capacity} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editYear" className="text-sm font-medium">Year</Label>
                <Input id="editYear" type="number" defaultValue={selectedVehicle.year} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFuelType" className="text-sm font-medium">Fuel Type</Label>
                <Select defaultValue={selectedVehicle.fuelType.toLowerCase()}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDriver" className="text-sm font-medium">Assigned Driver</Label>
                <Select defaultValue={selectedVehicle.driver.toLowerCase().replace(' ', '')}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luismartinez">Luis Martinez</SelectItem>
                    <SelectItem value="carlosrodriguez">Carlos Rodriguez</SelectItem>
                    <SelectItem value="anasilva">Ana Silva</SelectItem>
                    <SelectItem value="sofiagonzalez">Sofia Gonzalez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="editNotes" className="text-sm font-medium">Notes</Label>
                <Textarea 
                  id="editNotes" 
                  defaultValue={selectedVehicle.notes} 
                  rows={3} 
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label htmlFor="editIsExternal" className="text-sm font-medium">External Vehicle</Label>
                <Switch id="editIsExternal" defaultChecked={selectedVehicle.isExternal} />
              </div>
              <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label htmlFor="editStatus" className="text-sm font-medium">Active Status</Label>
                <Switch id="editStatus" defaultChecked={selectedVehicle.status === 'active'} />
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

export default VehiclesTab