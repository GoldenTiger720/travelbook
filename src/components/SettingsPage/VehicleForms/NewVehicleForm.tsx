import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateVehicle } from '@/lib/hooks/useVehicles'
import { useToast } from '@/hooks/use-toast'
import type { CreateVehicleData } from '@/types/vehicle'

interface NewVehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NewVehicleForm: React.FC<NewVehicleFormProps> = ({ open, onOpenChange }) => {
  const createVehicleMutation = useCreateVehicle()
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateVehicleData>({
    license_plate: '',
    vehicle_name: '',
    brand: '',
    model: '',
    capacity: 0,
    external_vehicle: false,
    status: true
  })

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

    createVehicleMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Vehicle registered successfully",
          description: `${formData.vehicle_name} has been added to your fleet.`,
        })

        // Reset form and close dialog
        setFormData({
          license_plate: '',
          vehicle_name: '',
          brand: '',
          model: '',
          capacity: 0,
          external_vehicle: false,
          status: true
        })
        onOpenChange(false)
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Failed to register vehicle",
          description: "Please try again. If the problem persists, contact support.",
        })
      }
    })
  }

  const handleInputChange = (field: keyof CreateVehicleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Register New Vehicle</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new vehicle to your fleet management system
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="license_plate" className="text-sm font-medium">License Plate</Label>
            <Input
              id="license_plate"
              placeholder="ABC-123"
              className="text-sm"
              value={formData.license_plate}
              onChange={(e) => handleInputChange('license_plate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_name" className="text-sm font-medium">Vehicle Name</Label>
            <Input
              id="vehicle_name"
              placeholder="Mercedes Sprinter 1"
              className="text-sm"
              value={formData.vehicle_name}
              onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
            <Input
              id="brand"
              placeholder="Mercedes-Benz"
              className="text-sm"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">Model</Label>
            <Input
              id="model"
              placeholder="Sprinter 415"
              className="text-sm"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="16"
              className="text-sm"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor="external_vehicle" className="text-sm font-medium">External Vehicle</Label>
            <Switch
              id="external_vehicle"
              checked={formData.external_vehicle}
              onCheckedChange={(checked) => handleInputChange('external_vehicle', checked)}
            />
          </div>
          <div className="space-y-2 flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <Label htmlFor="status" className="text-sm font-medium">Active Status</Label>
            <Switch
              id="status"
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
            disabled={createVehicleMutation.isPending}
            className="w-full sm:w-auto"
          >
            {createVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewVehicleForm