import { useState, useEffect } from 'react'
import { apiCall } from '@/config/api'

export interface PaymentAccount {
  id: string
  accountName: string
  currency: string
}

/**
 * Hook to fetch and cache payment accounts from Settings
 * These are used as payment method options throughout the application
 */
export function usePaymentAccounts() {
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiCall('/api/settings/system/payment-account/', {
          method: 'GET'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch payment accounts')
        }

        const data = await response.json()
        const accounts = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
        setPaymentAccounts(accounts)
      } catch (err) {
        console.error('Error fetching payment accounts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch payment accounts')
        setPaymentAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentAccounts()
  }, [])

  return { paymentAccounts, loading, error }
}
