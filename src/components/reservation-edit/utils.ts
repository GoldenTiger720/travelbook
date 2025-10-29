import { Reservation } from '@/types/reservation'
import { Payment } from './types'

// Helper function to get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'CLP': '$',
    'BRL': 'R$',
    'ARS': '$'
  }
  return symbols[currency] || currency
}

// Calculate grand total from reservation
export const calculateGrandTotal = (reservation: Reservation | null): number => {
  if (!reservation) return 0

  // Use totalAmount from pricing if available, otherwise calculate from passengers
  if (reservation.pricing.totalAmount) {
    return reservation.pricing.totalAmount
  }

  return (
    (reservation.passengers.adults * reservation.pricing.adultPrice) +
    (reservation.passengers.children * reservation.pricing.childPrice) +
    (reservation.passengers.infants * reservation.pricing.infantPrice)
  )
}

// Get status color class
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    case 'no-show': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Get payment status color class
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'partial': return 'bg-orange-100 text-orange-800'
    case 'refunded': return 'bg-purple-100 text-purple-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Calculate payment summary
export const calculatePaymentSummary = (
  reservation: Reservation | null,
  payments: Payment[]
): { total: number; paid: number; refunded: number; remaining: number } => {
  if (!reservation) return { total: 0, paid: 0, refunded: 0, remaining: 0 }

  const totalAmount = calculateGrandTotal(reservation)

  const paid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const refunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + (p.refundedAmount || 0), 0)

  const remaining = totalAmount - paid + refunded

  return { total: totalAmount, paid, refunded, remaining }
}
