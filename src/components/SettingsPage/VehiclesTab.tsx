import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Car, Plus } from 'lucide-react'
import { useVehicles } from '@/lib/hooks/useVehicles'
import { useToast } from '@/hooks/use-toast'
import NewVehicleForm from './VehicleForms/NewVehicleForm'
import VehicleList from './VehicleForms/VehicleList'
import VehicleFiltersComponent from './VehicleForms/VehicleFilters'
import type { Vehicle, VehicleFilters } from '@/types/vehicle'

const VehiclesTab: React.FC = () => {
  console.log('🏗️ VehiclesTab component mounted/re-rendered')
  const { data: vehicles = [], isLoading, isError, error } = useVehicles()
  const { toast } = useToast()

  // State for dialogs and filters
  const [showNewVehicleDialog, setShowNewVehicleDialog] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filters state
  const [filters, setFilters] = useState<VehicleFilters>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  })

  // Show error notification when there's an API error
  useEffect(() => {
    if (isError && error) {
      console.error('Failed to load vehicles:', error)
      toast({
        variant: "destructive",
        title: "Failed to load vehicles",
        description: "Please check your connection and try again. You can still add new vehicles.",
      })
    }
  }, [isError, error])

  // Filter vehicles based on search and filters
  const filteredVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return []

    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.vehicle_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           vehicle.license_plate?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           vehicle.brand?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           vehicle.model?.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesStatus = filters.statusFilter === 'all' ||
                           (filters.statusFilter === 'active' && vehicle.status) ||
                           (filters.statusFilter === 'inactive' && !vehicle.status)

      const matchesType = filters.typeFilter === 'all' ||
                         (filters.typeFilter === 'internal' && !vehicle.external_vehicle) ||
                         (filters.typeFilter === 'external' && vehicle.external_vehicle)

      return matchesSearch && matchesStatus && matchesType
    })
  }, [vehicles, filters])

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowEditDialog(true)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export vehicles:', filteredVehicles)
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
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

            {/* Filters */}
            <VehicleFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Vehicles List */}
      <Card>
        <CardContent className="p-0">
          <VehicleList
            vehicles={filteredVehicles}
            onEditVehicle={handleEditVehicle}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Vehicle Dialog */}
      <NewVehicleForm
        open={showNewVehicleDialog}
        onOpenChange={setShowNewVehicleDialog}
      />

      {/* Edit Vehicle Dialog - TODO: Create EditVehicleForm component */}
      {showEditDialog && selectedVehicle && (
        <div>
          {/* TODO: Implement EditVehicleForm component */}
          <p>Edit form for vehicle: {selectedVehicle.vehicle_name}</p>
        </div>
      )}
    </div>
  )
}

export default VehiclesTab