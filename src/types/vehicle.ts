export interface Vehicle {
  id: string
  license_plate: string
  vehicle_name: string
  brand: string
  model: string
  capacity: number
  external_vehicle: boolean
  status: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateVehicleData {
  license_plate: string
  vehicle_name: string
  brand: string
  model: string
  capacity: number
  external_vehicle: boolean
  status: boolean
}

export interface UpdateVehicleData extends CreateVehicleData {
  id: string
}

export interface VehicleFilters {
  searchTerm: string
  statusFilter: string
  typeFilter: string
}