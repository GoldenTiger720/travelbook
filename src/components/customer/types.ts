// Customer form data types
export interface CustomerFormData {
  name: string
  id_number: string
  email: string
  phone: string
  language: string
  country: string
  cpf: string
  address: string
  hotel: string
  room: string
  comments: string
}

// Validation errors type
export type ValidationErrors = Record<string, string>

// Backend errors type
export type BackendErrors = Record<string, string[]>

// Customer stat type
export interface CustomerStat {
  label: string
  value: string
  icon: any
  color: string
}

// Transformed customer for UI
export interface TransformedCustomer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: string
  totalBookings: number
  totalSpent: string
  lastBooking: string
  avatar: string
}
