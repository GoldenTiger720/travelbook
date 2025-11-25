import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '@/config/api'

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
}

/**
 * Hook to fetch and manage exchange rates from Settings
 * Used for currency conversion throughout the application
 */
export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExchangeRates = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiCall('/api/settings/system/exchange-rate/', {
          method: 'GET'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates')
        }

        const data = await response.json()
        const rates = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []

        // Parse rates to ensure they are numbers
        const parsedRates = rates.map((rate: any) => ({
          ...rate,
          rate: parseFloat(rate.rate) || 0
        }))

        setExchangeRates(parsedRates)
      } catch (err) {
        console.error('Error fetching exchange rates:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates')
        setExchangeRates([])
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRates()
  }, [])

  /**
   * Convert an amount from one currency to another
   * @param amount - The amount to convert
   * @param fromCurrency - The source currency code
   * @param toCurrency - The target currency code
   * @returns The converted amount or the original amount if no rate found
   */
  const convertCurrency = useCallback((
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount
    }

    // Try to find direct conversion rate
    const directRate = exchangeRates.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    )

    if (directRate) {
      return amount * directRate.rate
    }

    // Try to find reverse conversion rate
    const reverseRate = exchangeRates.find(
      rate => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
    )

    if (reverseRate && reverseRate.rate !== 0) {
      return amount / reverseRate.rate
    }

    // Try to find conversion through USD as intermediate currency
    // First convert to USD, then to target currency
    const toUsdRate = exchangeRates.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === 'USD'
    )
    const fromUsdRate = exchangeRates.find(
      rate => rate.from_currency === 'USD' && rate.to_currency === toCurrency
    )

    if (toUsdRate && fromUsdRate) {
      const amountInUsd = amount * toUsdRate.rate
      return amountInUsd * fromUsdRate.rate
    }

    // Try reverse rates through USD
    const usdToFromRate = exchangeRates.find(
      rate => rate.from_currency === 'USD' && rate.to_currency === fromCurrency
    )
    const usdToTargetRate = exchangeRates.find(
      rate => rate.from_currency === 'USD' && rate.to_currency === toCurrency
    )

    if (usdToFromRate && usdToFromRate.rate !== 0 && usdToTargetRate) {
      const amountInUsd = amount / usdToFromRate.rate
      return amountInUsd * usdToTargetRate.rate
    }

    // No conversion rate found - return original amount
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`)
    return amount
  }, [exchangeRates])

  /**
   * Get the exchange rate between two currencies
   * @param fromCurrency - The source currency code
   * @param toCurrency - The target currency code
   * @returns The exchange rate or null if not found
   */
  const getRate = useCallback((
    fromCurrency: string,
    toCurrency: string
  ): number | null => {
    if (fromCurrency === toCurrency) {
      return 1
    }

    const directRate = exchangeRates.find(
      rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
    )

    if (directRate) {
      return directRate.rate
    }

    const reverseRate = exchangeRates.find(
      rate => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
    )

    if (reverseRate && reverseRate.rate !== 0) {
      return 1 / reverseRate.rate
    }

    return null
  }, [exchangeRates])

  return {
    exchangeRates,
    loading,
    error,
    convertCurrency,
    getRate
  }
}
