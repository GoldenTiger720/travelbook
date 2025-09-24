import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Car,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { useDeleteVehicle } from '@/lib/hooks/useVehicles'

interface VehicleListProps {
  vehicles: Vehicle[]
  onEditVehicle: (vehicle: Vehicle) => void
  isLoading?: boolean
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEditVehicle, isLoading = false }) => {
  const deleteVehicleMutation = useDeleteVehicle()

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const getVehicleTypeBadge = (external_vehicle: boolean) => {
    return external_vehicle ? (
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

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicleMutation.mutate(vehicleId)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Car className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <div className="text-muted-foreground">Loading vehicles...</div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No vehicles found</h3>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading vehicles..."
              : "Get started by adding your first vehicle to the fleet."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
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
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{vehicle.vehicle_name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {vehicle.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono font-medium">{vehicle.license_plate}</div>
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
                  {getVehicleTypeBadge(vehicle.external_vehicle)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(vehicle.status)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(vehicle.created_at).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">{new Date(vehicle.created_at).toLocaleTimeString()}</div>
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
                      <DropdownMenuItem onClick={() => onEditVehicle(vehicle)}>
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
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
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
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="p-4 space-y-3">
            {/* Header with vehicle name and actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 shrink-0">
                  <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{vehicle.vehicle_name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {vehicle.id.slice(0, 8)}...
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
                  <DropdownMenuItem onClick={() => onEditVehicle(vehicle)}>
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
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vehicle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* License plate and brand info */}
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm font-medium bg-muted px-2 py-1 rounded">
                {vehicle.license_plate}
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
                {getVehicleTypeBadge(vehicle.external_vehicle)}
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground mb-1">Created</div>
                <div className="font-medium text-sm">{new Date(vehicle.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Status</div>
                {getStatusBadge(vehicle.status)}
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Last Updated</div>
                <div className="text-sm">
                  <div>{new Date(vehicle.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default VehicleList