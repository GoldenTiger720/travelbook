import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { apiCall } from '@/config/api'
import {
  SystemAppearance,
  FinancialConfiguration,
  ExchangeRate,
  PaymentMethods,
  BankAccounts,
  TermsAndPolicies,
  Categories
} from './SystemTab/index'
import type {
  SystemAppearance as SystemAppearanceType,
  FinancialConfig,
  ExchangeRate as ExchangeRateType,
  PaymentMethod,
  BankAccount,
  TermsConfigItem,
  Category
} from './SystemTab/types'

const SystemTab: React.FC = () => {
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // State for each section
  const [systemAppearances, setSystemAppearances] = useState<SystemAppearanceType[]>([])
  const [financialConfigs, setFinancialConfigs] = useState<FinancialConfig[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateType[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [termsConfigs, setTermsConfigs] = useState<TermsConfigItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Load all settings on component mount
  useEffect(() => {
    const loadAllSettings = async () => {
      setIsLoadingSettings(true)
      try {
        // Load System Appearance
        const appearanceResponse = await apiCall('/api/settings/system/appearance/', {
          method: 'GET'
        })
        if (appearanceResponse.ok) {
          const appearanceData = await appearanceResponse.json()
          const appearances = Array.isArray(appearanceData) ? appearanceData.map((item: any) => ({
            id: item.id,
            company_logo: item.company_logo
          })) : []
          setSystemAppearances(appearances)
        }

        // Load Financial Configuration
        const financialResponse = await apiCall('/api/settings/system/financial-config/', {
          method: 'GET'
        })
        if (financialResponse.ok) {
          const financialData = await financialResponse.json()
          const configs = Array.isArray(financialData) ? financialData.map((item: any) => ({
            id: item.id,
            baseCurrency: item.base_currency,
            taxRate: parseFloat(item.tax_rate)
          })) : []
          setFinancialConfigs(configs)
        }

        // Load Payment Methods
        const paymentResponse = await apiCall('/api/settings/system/payment-fee/', {
          method: 'GET'
        })
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          const methods = Array.isArray(paymentData.results) ? paymentData.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            taxRate: parseFloat(item.taxRate) || 0,
            bankSlipFee: parseFloat(item.bankSlipFee) || 0,
            cashFee: parseFloat(item.cashFee) || 0
          })) : []
          setPaymentMethods(methods)
        }

        // Load Bank Accounts
        const bankResponse = await apiCall('/api/settings/system/payment-account/', {
          method: 'GET'
        })
        if (bankResponse.ok) {
          const bankData = await bankResponse.json()
          const accounts = Array.isArray(bankData.results) ? bankData.results.map((item: any) => ({
            id: item.id,
            accountName: item.accountName,
            currency: item.currency
          })) : []
          setBankAccounts(accounts)
        }

        // Load Terms and Policies
        const termsResponse = await apiCall('/api/settings/system/terms/', {
          method: 'GET'
        })
        if (termsResponse.ok) {
          const termsData = await termsResponse.json()
          const configs = Array.isArray(termsData) ? termsData.map((item: any) => ({
            id: item.id,
            termsAndConditions: item.terms_and_conditions || '',
            termsFileUrl: item.terms_file_url || '',
            termsFileName: item.terms_file_name || ''
          })) : []
          setTermsConfigs(configs)
        }

        // Load Exchange Rates
        const exchangeRateResponse = await apiCall('/api/settings/system/exchange-rate/', {
          method: 'GET'
        })
        if (exchangeRateResponse.ok) {
          const exchangeRateData = await exchangeRateResponse.json()
          const rates = Array.isArray(exchangeRateData) ? exchangeRateData.map((item: any) => ({
            id: item.id,
            from_currency: item.from_currency,
            to_currency: item.to_currency,
            rate: parseFloat(item.rate)
          })) : []
          setExchangeRates(rates)
        }

        // Load Categories
        const categoriesResponse = await apiCall('/api/settings/system/categories/', {
          method: 'GET'
        })
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          // Categories endpoint is a ViewSet, so it returns paginated data with 'results'
          const categoriesArray = categoriesData.results || categoriesData
          const cats = Array.isArray(categoriesArray) ? categoriesArray.map((item: any) => ({
            id: item.id,
            name: item.name
          })) : []
          setCategories(cats)
        }

      } catch (error) {
        console.error('Error loading system settings:', error)
        toast.error('Failed to load some settings. Using default values.')
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadAllSettings()
  }, [])

  // Show loading state
  if (isLoadingSettings) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading system settings...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* System Appearance */}
      <SystemAppearance
        appearances={systemAppearances}
        onUpdate={setSystemAppearances}
      />

      {/* Financial Configuration */}
      <FinancialConfiguration
        financialConfigs={financialConfigs}
        onUpdate={setFinancialConfigs}
      />

      {/* Exchange Rate */}
      <ExchangeRate
        exchangeRates={exchangeRates}
        onUpdate={setExchangeRates}
      />

      {/* Payment Methods */}
      <PaymentMethods
        paymentMethods={paymentMethods}
        bankAccounts={bankAccounts}
        onUpdate={setPaymentMethods}
      />

      {/* Bank Account Registration */}
      <BankAccounts
        bankAccounts={bankAccounts}
        onUpdate={setBankAccounts}
      />

      {/* Terms and Policies Configuration */}
      <TermsAndPolicies
        termsConfigs={termsConfigs}
        onUpdate={setTermsConfigs}
      />

      {/* Categories */}
      <Categories
        categories={categories}
        onUpdate={setCategories}
      />
    </div>
  )
}

export default SystemTab
