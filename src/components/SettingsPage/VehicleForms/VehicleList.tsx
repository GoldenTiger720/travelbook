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
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'
import { useDeleteVehicle } from '@/lib/hooks/useVehicles'
import Swal from 'sweetalert2'

interface VehicleListProps {
  vehicles: Vehicle[]
  onEditVehicle: (vehicle: Vehicle) => void
  isLoading?: boolean
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEditVehicle, isLoading = false }) => {
  const deleteVehicleMutation = useDeleteVehicle()

  // Sort state
  const [sortField, setSortField] = React.useState<keyof Vehicle | ''>('')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  // Sort handler
  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort icon helper
  const getSortIcon = (field: string) => {
    if (field !== sortField) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline" />
    )
  }

  // Sort vehicles
  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

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

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    const result = await Swal.fire({
      title: 'Delete Vehicle',
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to delete this vehicle?</p>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold">${vehicle.vehicle_name}</p>
            <p class="text-sm text-gray-600">License: ${vehicle.license_plate}</p>
            <p class="text-sm text-gray-600">Brand: ${vehicle.brand} ${vehicle.model}</p>
          </div>
          <p class="mt-2 text-sm text-red-600">This action cannot be undone.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-wide'
      }
    })

    if (result.isConfirmed) {
      // Show progress modal
      Swal.fire({
        title: 'Deleting Vehicle...',
        html: `
          <div class="text-center">
            <p class="mb-4">Please wait while we delete "${vehicle.vehicle_name}"</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div class="bg-red-500 h-2.5 rounded-full progress-bar" style="width: 0%"></div>
            </div>
            <p class="text-sm text-gray-600">Do not close this window...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          const progressBar = document.querySelector('.progress-bar') as HTMLElement
          let progress = 0
          const interval = setInterval(() => {
            progress += 10
            if (progressBar) {
              progressBar.style.width = `${progress}%`
            }
            if (progress >= 90) {
              clearInterval(interval)
            }
          }, 100)
        }
      })

      // Perform the deletion
      deleteVehicleMutation.mutate(vehicle.id, {
        onSuccess: () => {
          Swal.fire({
            title: 'Vehicle Deleted',
            text: `${vehicle.vehicle_name} has been successfully deleted from your fleet.`,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#10b981'
          })
        },
        onError: (error) => {
          console.error('Delete error:', error)
          Swal.fire({
            title: 'Delete Failed',
            text: 'An error occurred while deleting the vehicle. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          })
        }
      })
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
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('vehicle_name')}
              >
                Vehicle
                {getSortIcon('vehicle_name')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('license_plate')}
              >
                License Plate
                {getSortIcon('license_plate')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('brand')}
              >
                Brand/Model
                {getSortIcon('brand')}
              </TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('capacity')}
              >
                Capacity
                {getSortIcon('capacity')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('external_vehicle')}
              >
                Type
                {getSortIcon('external_vehicle')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('status')}
              >
                Status
                {getSortIcon('status')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors select-none"
                onClick={() => handleSort('created_at')}
              >
                Created
                {getSortIcon('created_at')}
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">{vehicle.vehicle_name}</div>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteVehicle(vehicle)}
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
        {sortedVehicles.map((vehicle) => (
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteVehicle(vehicle)}
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