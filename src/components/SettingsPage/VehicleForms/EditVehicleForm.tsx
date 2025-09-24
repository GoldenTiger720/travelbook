import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUpdateVehicle } from '@/lib/hooks/useVehicles'
import { useToast } from '@/hooks/use-toast'
import type { Vehicle, UpdateVehicleData } from '@/types/vehicle'

interface EditVehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
}

const EditVehicleForm: React.FC<EditVehicleFormProps> = ({ open, onOpenChange, vehicle }) => {
  const updateVehicleMutation = useUpdateVehicle()
  const { toast } = useToast()

  const [formData, setFormData] = useState<UpdateVehicleData>({
    id: '',
    license_plate: '',
    vehicle_name: '',
    brand: '',
    model: '',
    capacity: 0,
    external_vehicle: false,
    status: true
  })

  // Update form data when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        vehicle_name: vehicle.vehicle_name,
        brand: vehicle.brand,
        model: vehicle.model,
        capacity: vehicle.capacity,
        external_vehicle: vehicle.external_vehicle,
        status: vehicle.status
      })
    }
  }, [vehicle])

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.license_plate || !formData.vehicle_name || !formData.brand || !formData.model) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields: License Plate, Vehicle Name, Brand, and Model",
      })
      return
    }

    updateVehicleMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Vehicle updated successfully",
          description: `${formData.vehicle_name} has been updated.`,
        })
        onOpenChange(false)
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to update vehicle",
          description: "Please try again. If the problem persists, contact support.",
        })
      }
    })
  }

  const handleInputChange = (field: keyof UpdateVehicleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Vehicle</DialogTitle>
          <DialogDescription className="text-sm">
            Update vehicle information in your fleet management system
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_license_plate" className="text-sm font-medium">License Plate</Label>
            <Input
              id="edit_license_plate"
              placeholder="ABC-123"
              className="text-sm"
              value={formData.license_plate}
              onChange={(e) => handleInputChange('license_plate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_vehicle_name" className="text-sm font-medium">Vehicle Name</Label>
            <Input
              id="edit_vehicle_name"
              placeholder="Mercedes Sprinter 1"
              className="text-sm"
              value={formData.vehicle_name}
              onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_brand" className="text-sm font-medium">Brand</Label>
            <Input
              id="edit_brand"
              placeholder="Mercedes-Benz"
              className="text-sm"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_model" className="text-sm font-medium">Model</Label>
            <Input
              id="edit_model"
              placeholder="Sprinter 415"
              className="text-sm"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_capacity" className="text-sm font-medium">Capacity</Label>
            <Input
              id="edit_capacity"
              type="number"
              placeholder="16"
              className="text-sm"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor="edit_external_vehicle" className="text-sm font-medium">External Vehicle</Label>
            <Switch
              id="edit_external_vehicle"
              checked={formData.external_vehicle}
              onCheckedChange={(checked) => handleInputChange('external_vehicle', checked)}
            />
          </div>
          <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor="edit_status" className="text-sm font-medium">Active Status</Label>
            <Switch
              id="edit_status"
              checked={formData.status}
              onCheckedChange={(checked) => handleInputChange('status', checked)}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateVehicleMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateVehicleMutation.isPending ? 'Updating...' : 'Update Vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditVehicleForm