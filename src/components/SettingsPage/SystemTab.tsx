import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiCall, API_CONFIG } from '@/config/api'
import {
  DollarSign,
  Save,
  CreditCard,
  Building2,
  FileText,
  Plus,
  Trash2,
  Upload,
  Download,
  Edit,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface PaymentMethod {
  id: string
  name: string
  taxRate: number
  bankSlipFee: number
  cashFee: number
}

interface BankAccount {
  id: string
  accountName: string
  currency: string
}

interface FinancialConfig {
  id?: string
  baseCurrency: string
  taxRate: number
}

interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
}

interface SystemSettings {
  baseCurrency: string
  taxRate: number
  paymentMethods: PaymentMethod[]
  bankAccounts: BankAccount[]
  termsAndConditions: string
  termsFileUrl: string
  termsFileName: string
}

const SystemTab: React.FC = () => {
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Loading states for each section
  const [isAddingFinancial, setIsAddingFinancial] = useState(false)
  const [isUpdatingFinancial, setIsUpdatingFinancial] = useState(false)
  const [isDeletingFinancial, setIsDeletingFinancial] = useState<string | null>(null)

  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isDeletingPayment, setIsDeletingPayment] = useState<string | null>(null)

  const [isAddingBank, setIsAddingBank] = useState(false)
  const [isUpdatingBank, setIsUpdatingBank] = useState(false)
  const [isDeletingBank, setIsDeletingBank] = useState<string | null>(null)

  const [isAddingTerms, setIsAddingTerms] = useState(false)
  const [isUpdatingTerms, setIsUpdatingTerms] = useState(false)
  const [isDeletingTerms, setIsDeletingTerms] = useState<string | null>(null)

  // Financial Configuration state
  const [financialConfigs, setFinancialConfigs] = useState<FinancialConfig[]>([])
  const [editingFinancialConfig, setEditingFinancialConfig] = useState<FinancialConfig | null>(null)
  const [newFinancialConfig, setNewFinancialConfig] = useState({
    baseCurrency: 'USD',
    taxRate: 0
  })

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    taxRate: 0,
    bankSlipFee: 0,
    cashFee: 0
  })

  // Bank Accounts state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null)
  const [newBankAccount, setNewBankAccount] = useState({
    accountName: '',
    currency: 'USD'
  })

  // Terms and Policies state
  interface TermsConfigItem {
    id: string
    termsAndConditions: string
    termsFileUrl: string
    termsFileName: string
  }
  const [termsConfigs, setTermsConfigs] = useState<TermsConfigItem[]>([])
  const [editingTermsConfig, setEditingTermsConfig] = useState<TermsConfigItem | null>(null)
  const [newTermsConfig, setNewTermsConfig] = useState({
    termsAndConditions: '',
    termsFileUrl: '',
    termsFileName: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Exchange Rate state
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [editingExchangeRate, setEditingExchangeRate] = useState<ExchangeRate | null>(null)
  const [newExchangeRate, setNewExchangeRate] = useState({
    from_currency: 'USD',
    to_currency: 'BRL',
    rate: 0
  })

  // Loading states for Exchange Rate
  const [isAddingExchangeRate, setIsAddingExchangeRate] = useState(false)
  const [isUpdatingExchangeRate, setIsUpdatingExchangeRate] = useState(false)
  const [isDeletingExchangeRate, setIsDeletingExchangeRate] = useState<string | null>(null)

  // Sort state for Financial Configuration
  const [financialSortField, setFinancialSortField] = useState<keyof FinancialConfig | ''>('')
  const [financialSortDirection, setFinancialSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sort state for Payment Methods
  const [paymentSortField, setPaymentSortField] = useState<keyof PaymentMethod | ''>('')
  const [paymentSortDirection, setPaymentSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sort state for Bank Accounts
  const [bankSortField, setBankSortField] = useState<keyof BankAccount | ''>('')
  const [bankSortDirection, setBankSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sort state for Terms and Policies
  const [termsSortField, setTermsSortField] = useState<keyof TermsConfigItem | ''>('')
  const [termsSortDirection, setTermsSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sort state for Exchange Rate
  const [exchangeRateSortField, setExchangeRateSortField] = useState<keyof ExchangeRate | ''>('')
  const [exchangeRateSortDirection, setExchangeRateSortDirection] = useState<'asc' | 'desc'>('asc')

  // Load all settings on component mount
  useEffect(() => {
    const loadAllSettings = async () => {
      setIsLoadingSettings(true)
      try {
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

      } catch (error) {
        console.error('Error loading system settings:', error)
        toast.error('Failed to load some settings. Using default values.')
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadAllSettings()
  }, [])

  // ===== Sort Handlers =====
  const handleFinancialSort = (field: keyof FinancialConfig) => {
    if (financialSortField === field) {
      setFinancialSortDirection(financialSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setFinancialSortField(field)
      setFinancialSortDirection('asc')
    }
  }

  const handlePaymentSort = (field: keyof PaymentMethod) => {
    if (paymentSortField === field) {
      setPaymentSortDirection(paymentSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setPaymentSortField(field)
      setPaymentSortDirection('asc')
    }
  }

  const handleBankSort = (field: keyof BankAccount) => {
    if (bankSortField === field) {
      setBankSortDirection(bankSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setBankSortField(field)
      setBankSortDirection('asc')
    }
  }

  const handleTermsSort = (field: keyof TermsConfigItem) => {
    if (termsSortField === field) {
      setTermsSortDirection(termsSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setTermsSortField(field)
      setTermsSortDirection('asc')
    }
  }

  const handleExchangeRateSort = (field: keyof ExchangeRate) => {
    if (exchangeRateSortField === field) {
      setExchangeRateSortDirection(exchangeRateSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setExchangeRateSortField(field)
      setExchangeRateSortDirection('asc')
    }
  }

  // Sort icon helper
  const getSortIcon = (field: string, currentField: string, direction: 'asc' | 'desc') => {
    if (field !== currentField) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline" />
    }
    return direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline" />
    )
  }

  // Sorted data arrays
  const sortedFinancialConfigs = [...financialConfigs].sort((a, b) => {
    if (!financialSortField) return 0
    const aValue = a[financialSortField]
    const bValue = b[financialSortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return financialSortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return financialSortDirection === 'asc' ? 1 : -1
    return 0
  })

  const sortedPaymentMethods = [...paymentMethods].sort((a, b) => {
    if (!paymentSortField) return 0
    const aValue = a[paymentSortField]
    const bValue = b[paymentSortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return paymentSortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return paymentSortDirection === 'asc' ? 1 : -1
    return 0
  })

  const sortedBankAccounts = [...bankAccounts].sort((a, b) => {
    if (!bankSortField) return 0
    const aValue = a[bankSortField]
    const bValue = b[bankSortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return bankSortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return bankSortDirection === 'asc' ? 1 : -1
    return 0
  })

  const sortedTermsConfigs = [...termsConfigs].sort((a, b) => {
    if (!termsSortField) return 0
    const aValue = a[termsSortField]
    const bValue = b[termsSortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return termsSortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return termsSortDirection === 'asc' ? 1 : -1
    return 0
  })

  const sortedExchangeRates = [...exchangeRates].sort((a, b) => {
    if (!exchangeRateSortField) return 0
    const aValue = a[exchangeRateSortField]
    const bValue = b[exchangeRateSortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return exchangeRateSortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return exchangeRateSortDirection === 'asc' ? 1 : -1
    return 0
  })

  // ===== Financial Configuration Handlers =====
  const addFinancialConfig = async () => {
    if (!newFinancialConfig.baseCurrency) {
      toast.error('Please select a base currency')
      return
    }

    setIsAddingFinancial(true)
    try {
      const payload = {
        base_currency: newFinancialConfig.baseCurrency,
        tax_rate: newFinancialConfig.taxRate.toString()
      }

      const response = await apiCall('/api/settings/system/financial-config/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add financial configuration')

      const result = await response.json()
      setFinancialConfigs(prev => [...prev, {
        id: result.id,
        baseCurrency: result.base_currency,
        taxRate: parseFloat(result.tax_rate)
      }])
      setNewFinancialConfig({ baseCurrency: 'USD', taxRate: 0 })
      toast.success('Financial configuration added successfully!')
    } catch (error) {
      console.error('Error adding financial configuration:', error)
      toast.error('Failed to add financial configuration')
    } finally {
      setIsAddingFinancial(false)
    }
  }

  const updateFinancialConfig = async (id: string) => {
    if (!editingFinancialConfig) return

    setIsUpdatingFinancial(true)
    try {
      const payload = {
        base_currency: editingFinancialConfig.baseCurrency,
        tax_rate: editingFinancialConfig.taxRate.toString()
      }

      const response = await apiCall(`/api/settings/system/financial-config/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update financial configuration')

      const result = await response.json()
      setFinancialConfigs(prev => prev.map(fc => fc.id === id ? {
        id: result.id,
        baseCurrency: result.base_currency,
        taxRate: parseFloat(result.tax_rate)
      } : fc))
      setEditingFinancialConfig(null)
      toast.success('Financial configuration updated successfully!')
    } catch (error) {
      console.error('Error updating financial configuration:', error)
      toast.error('Failed to update financial configuration')
    } finally {
      setIsUpdatingFinancial(false)
    }
  }

  const deleteFinancialConfig = async (id: string) => {
    setIsDeletingFinancial(id)
    try {
      const response = await apiCall(`/api/settings/system/financial-config/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete financial configuration')

      setFinancialConfigs(prev => prev.filter(fc => fc.id !== id))
      toast.success('Financial configuration deleted successfully!')
    } catch (error) {
      console.error('Error deleting financial configuration:', error)
      toast.error('Failed to delete financial configuration')
    } finally {
      setIsDeletingFinancial(null)
    }
  }

  // ===== Payment Method Handlers =====
  const addPaymentMethod = async () => {
    if (!newPaymentMethod.name) {
      toast.error('Please select a payment method')
      return
    }

    setIsAddingPayment(true)
    try {
      const payload = {
        name: newPaymentMethod.name,
        taxRate: newPaymentMethod.taxRate,
        bankSlipFee: newPaymentMethod.bankSlipFee,
        cashFee: newPaymentMethod.cashFee
      }

      const response = await apiCall('/api/settings/system/payment-fee/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add payment method')

      const result = await response.json()
      setPaymentMethods(prev => [...prev, result])
      setNewPaymentMethod({ name: '', taxRate: 0, bankSlipFee: 0, cashFee: 0 })
      toast.success('Payment method added successfully!')
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error('Failed to add payment method')
    } finally {
      setIsAddingPayment(false)
    }
  }

  const updatePaymentMethod = async (id: string) => {
    if (!editingPaymentMethod) return

    setIsUpdatingPayment(true)
    try {
      const payload = {
        name: editingPaymentMethod.name,
        taxRate: editingPaymentMethod.taxRate,
        bankSlipFee: editingPaymentMethod.bankSlipFee,
        cashFee: editingPaymentMethod.cashFee
      }

      const response = await apiCall(`/api/settings/system/payment-fee/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update payment method')

      const result = await response.json()
      setPaymentMethods(prev => prev.map(pm => pm.id === id ? result : pm))
      setEditingPaymentMethod(null)
      toast.success('Payment method updated successfully!')
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const deletePaymentMethod = async (id: string) => {
    setIsDeletingPayment(id)
    try {
      const response = await apiCall(`/api/settings/system/payment-fee/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id))
      toast.success('Payment method deleted successfully!')
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to delete payment method')
    } finally {
      setIsDeletingPayment(null)
    }
  }

  // ===== Bank Account Handlers =====
  const addBankAccount = async () => {
    if (!newBankAccount.accountName) {
      toast.error('Please enter an account name')
      return
    }

    setIsAddingBank(true)
    try {
      const payload = {
        accountName: newBankAccount.accountName,
        currency: newBankAccount.currency
      }

      const response = await apiCall('/api/settings/system/payment-account/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add bank account')

      const result = await response.json()
      setBankAccounts(prev => [...prev, result])
      setNewBankAccount({ accountName: '', currency: 'USD' })
      toast.success('Bank account added successfully!')
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error('Failed to add bank account')
    } finally {
      setIsAddingBank(false)
    }
  }

  const updateBankAccount = async (id: string) => {
    if (!editingBankAccount) return

    setIsUpdatingBank(true)
    try {
      const payload = {
        accountName: editingBankAccount.accountName,
        currency: editingBankAccount.currency
      }

      const response = await apiCall(`/api/settings/system/payment-account/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update bank account')

      const result = await response.json()
      setBankAccounts(prev => prev.map(ba => ba.id === id ? result : ba))
      setEditingBankAccount(null)
      toast.success('Bank account updated successfully!')
    } catch (error) {
      console.error('Error updating bank account:', error)
      toast.error('Failed to update bank account')
    } finally {
      setIsUpdatingBank(false)
    }
  }

  const deleteBankAccount = async (id: string) => {
    setIsDeletingBank(id)
    try {
      const response = await apiCall(`/api/settings/system/payment-account/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete bank account')

      setBankAccounts(prev => prev.filter(ba => ba.id !== id))
      toast.success('Bank account deleted successfully!')
    } catch (error) {
      console.error('Error deleting bank account:', error)
      toast.error('Failed to delete bank account')
    } finally {
      setIsDeletingBank(null)
    }
  }

  // ===== Terms and Policies Handlers =====
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const addTermsConfig = async () => {
    setIsAddingTerms(true)
    try {
      setUploadingFile(true)
      const formData = new FormData()

      // Always include terms_and_conditions text
      formData.append('terms_and_conditions', newTermsConfig.termsAndConditions)

      // Include file if a new file was selected
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const uploadResponse = await apiCall('/api/settings/upload-terms/', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to save terms configuration')
      }

      const result = await uploadResponse.json()
      setTermsConfigs(prev => [...prev, {
        id: result.id,
        termsAndConditions: result.terms_and_conditions,
        termsFileUrl: result.terms_file_url,
        termsFileName: result.terms_file_name
      }])
      setNewTermsConfig({ termsAndConditions: '', termsFileUrl: '', termsFileName: '' })
      setSelectedFile(null)
      setUploadingFile(false)
      toast.success('Terms and policies added successfully!')
    } catch (error) {
      console.error('Error saving terms configuration:', error)
      toast.error('Failed to save terms and policies')
      setUploadingFile(false)
    } finally {
      setIsAddingTerms(false)
      setUploadingFile(false)
    }
  }

  const updateTermsConfig = async (id: string) => {
    if (!editingTermsConfig) return

    setIsUpdatingTerms(true)
    try {
      const payload = {
        terms_and_conditions: editingTermsConfig.termsAndConditions,
        terms_file_url: editingTermsConfig.termsFileUrl,
        terms_file_name: editingTermsConfig.termsFileName
      }

      const response = await apiCall(`/api/settings/system/terms/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update terms configuration')

      const result = await response.json()
      setTermsConfigs(prev => prev.map(tc => tc.id === id ? {
        id: result.id,
        termsAndConditions: result.terms_and_conditions,
        termsFileUrl: result.terms_file_url,
        termsFileName: result.terms_file_name
      } : tc))
      setEditingTermsConfig(null)
      toast.success('Terms configuration updated successfully!')
    } catch (error) {
      console.error('Error updating terms configuration:', error)
      toast.error('Failed to update terms configuration')
    } finally {
      setIsUpdatingTerms(false)
    }
  }

  const deleteTermsConfig = async (id: string) => {
    setIsDeletingTerms(id)
    try {
      const response = await apiCall(`/api/settings/system/terms/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete terms configuration')

      setTermsConfigs(prev => prev.filter(tc => tc.id !== id))
      toast.success('Terms configuration deleted successfully!')
    } catch (error) {
      console.error('Error deleting terms configuration:', error)
      toast.error('Failed to delete terms configuration')
    } finally {
      setIsDeletingTerms(null)
    }
  }

  // ===== Exchange Rate Handlers =====
  const addExchangeRate = async () => {
    if (!newExchangeRate.from_currency || !newExchangeRate.to_currency) {
      toast.error('Please select currencies')
      return
    }

    if (newExchangeRate.rate <= 0) {
      toast.error('Please enter a valid exchange rate')
      return
    }

    setIsAddingExchangeRate(true)
    try {
      const response = await apiCall('/api/settings/system/exchange-rate/', {
        method: 'POST',
        body: JSON.stringify(newExchangeRate)
      })

      if (!response.ok) throw new Error('Failed to add exchange rate')

      const data = await response.json()
      setExchangeRates(prev => [...prev, {
        id: data.id,
        from_currency: data.from_currency,
        to_currency: data.to_currency,
        rate: parseFloat(data.rate)
      }])

      setNewExchangeRate({ from_currency: 'USD', to_currency: 'BRL', rate: 0 })
      toast.success('Exchange rate added successfully!')
    } catch (error) {
      console.error('Error adding exchange rate:', error)
      toast.error('Failed to add exchange rate')
    } finally {
      setIsAddingExchangeRate(false)
    }
  }

  const updateExchangeRate = async (id: string) => {
    if (!editingExchangeRate) return

    setIsUpdatingExchangeRate(true)
    try {
      const response = await apiCall(`/api/settings/system/exchange-rate/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          from_currency: editingExchangeRate.from_currency,
          to_currency: editingExchangeRate.to_currency,
          rate: editingExchangeRate.rate
        })
      })

      if (!response.ok) throw new Error('Failed to update exchange rate')

      const data = await response.json()
      setExchangeRates(prev => prev.map(er => er.id === id ? {
        id: data.id,
        from_currency: data.from_currency,
        to_currency: data.to_currency,
        rate: parseFloat(data.rate)
      } : er))

      setEditingExchangeRate(null)
      toast.success('Exchange rate updated successfully!')
    } catch (error) {
      console.error('Error updating exchange rate:', error)
      toast.error('Failed to update exchange rate')
    } finally {
      setIsUpdatingExchangeRate(false)
    }
  }

  const deleteExchangeRate = async (id: string) => {
    setIsDeletingExchangeRate(id)
    try {
      const response = await apiCall(`/api/settings/system/exchange-rate/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete exchange rate')

      setExchangeRates(prev => prev.filter(er => er.id !== id))
      toast.success('Exchange rate deleted successfully!')
    } catch (error) {
      console.error('Error deleting exchange rate:', error)
      toast.error('Failed to delete exchange rate')
    } finally {
      setIsDeletingExchangeRate(null)
    }
  }

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
      {/* Financial Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="truncate">Financial Configuration</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Currency and financial parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Financial Config Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select
                value={newFinancialConfig.baseCurrency}
                onValueChange={(value) => setNewFinancialConfig(prev => ({ ...prev, baseCurrency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={newFinancialConfig.taxRate}
                onChange={(e) => setNewFinancialConfig(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button onClick={addFinancialConfig} disabled={isAddingFinancial} className="w-full">
                {isAddingFinancial ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAddingFinancial ? 'Adding...' : 'Add Config'}
              </Button>
            </div>
          </div>

          {/* Financial Config Table */}
          {financialConfigs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Financial Configurations</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleFinancialSort('baseCurrency')}
                      >
                        Base Currency
                        {getSortIcon('baseCurrency', financialSortField, financialSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleFinancialSort('taxRate')}
                      >
                        Tax Rate (%)
                        {getSortIcon('taxRate', financialSortField, financialSortDirection)}
                      </th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFinancialConfigs.map((config) => (
                      <tr key={config.id} className="border-t">
                        {editingFinancialConfig?.id === config.id ? (
                          <>
                            <td className="p-3">
                              <Select
                                value={editingFinancialConfig.baseCurrency}
                                onValueChange={(value) => setEditingFinancialConfig(prev => prev ? { ...prev, baseCurrency: value } : null)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="BRL">BRL</SelectItem>
                                  <SelectItem value="ARS">ARS</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editingFinancialConfig.taxRate}
                                onChange={(e) => setEditingFinancialConfig(prev => prev ? { ...prev, taxRate: parseFloat(e.target.value) || 0 } : null)}
                                step="0.1"
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateFinancialConfig(config.id!)}
                                  disabled={isUpdatingFinancial}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {isUpdatingFinancial ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingFinancialConfig(null)}
                                  disabled={isUpdatingFinancial}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm font-medium">{config.baseCurrency}</td>
                            <td className="p-3 text-sm">{config.taxRate}%</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingFinancialConfig(config)}
                                  disabled={isDeletingFinancial === config.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFinancialConfig(config.id!)}
                                  disabled={isDeletingFinancial === config.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {isDeletingFinancial === config.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rate Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="truncate">Current Exchange Rate</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Manually record currency exchange rates for financial consolidations and reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Exchange Rate Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From Currency</Label>
              <Select
                value={newExchangeRate.from_currency}
                onValueChange={(value) => setNewExchangeRate(prev => ({ ...prev, from_currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Currency</Label>
              <Select
                value={newExchangeRate.to_currency}
                onValueChange={(value) => setNewExchangeRate(prev => ({ ...prev, to_currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="e.g., 5.50"
                value={newExchangeRate.rate || ''}
                onChange={(e) => setNewExchangeRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button onClick={addExchangeRate} disabled={isAddingExchangeRate} className="w-full">
                {isAddingExchangeRate ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAddingExchangeRate ? 'Adding...' : 'Add Rate'}
              </Button>
            </div>
          </div>

          {/* Exchange Rate Table */}
          {exchangeRates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Exchange Rates</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleExchangeRateSort('from_currency')}
                      >
                        From Currency
                        {getSortIcon('from_currency', exchangeRateSortField, exchangeRateSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleExchangeRateSort('to_currency')}
                      >
                        To Currency
                        {getSortIcon('to_currency', exchangeRateSortField, exchangeRateSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleExchangeRateSort('rate')}
                      >
                        Rate
                        {getSortIcon('rate', exchangeRateSortField, exchangeRateSortDirection)}
                      </th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedExchangeRates.map((exchangeRate) => (
                      <tr key={exchangeRate.id} className="border-t">
                        {editingExchangeRate?.id === exchangeRate.id ? (
                          <>
                            <td className="p-3">
                              <Select
                                value={editingExchangeRate.from_currency}
                                onValueChange={(value) => setEditingExchangeRate(prev => prev ? { ...prev, from_currency: value } : null)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="BRL">BRL</SelectItem>
                                  <SelectItem value="ARS">ARS</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Select
                                value={editingExchangeRate.to_currency}
                                onValueChange={(value) => setEditingExchangeRate(prev => prev ? { ...prev, to_currency: value } : null)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="BRL">BRL</SelectItem>
                                  <SelectItem value="ARS">ARS</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                step="0.000001"
                                value={editingExchangeRate.rate}
                                onChange={(e) => setEditingExchangeRate(prev => prev ? { ...prev, rate: parseFloat(e.target.value) || 0 } : null)}
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateExchangeRate(exchangeRate.id)}
                                  disabled={isUpdatingExchangeRate}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {isUpdatingExchangeRate ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingExchangeRate(null)}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-medium">{exchangeRate.from_currency}</td>
                            <td className="p-3 font-medium">{exchangeRate.to_currency}</td>
                            <td className="p-3">{exchangeRate.rate.toFixed(6)}</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingExchangeRate(exchangeRate)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteExchangeRate(exchangeRate.id)}
                                  disabled={isDeletingExchangeRate === exchangeRate.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {isDeletingExchangeRate === exchangeRate.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="truncate">Payment Methods</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Add and manage payment methods with applicable fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Payment Method Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="paymentMethodName">Payment Method</Label>
              <Select
                value={newPaymentMethod.name}
                onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.accountName}>
                        {account.accountName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No bank accounts available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTaxRate">Tax Rate (%)</Label>
              <Input
                id="paymentTaxRate"
                type="number"
                value={newPaymentMethod.taxRate}
                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankSlipFee">Bank Slip Fee (%)</Label>
              <Input
                id="bankSlipFee"
                type="number"
                value={newPaymentMethod.bankSlipFee}
                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, bankSlipFee: parseFloat(e.target.value) || 0 }))}
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cashFee">Cash Fee (%)</Label>
              <Input
                id="cashFee"
                type="number"
                value={newPaymentMethod.cashFee}
                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cashFee: parseFloat(e.target.value) || 0 }))}
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button onClick={addPaymentMethod} disabled={isAddingPayment} className="w-full">
                {isAddingPayment ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAddingPayment ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>

          {/* Payment Methods Table */}
          {paymentMethods.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Configured Payment Methods</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handlePaymentSort('name')}
                      >
                        Payment Method
                        {getSortIcon('name', paymentSortField, paymentSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handlePaymentSort('taxRate')}
                      >
                        Tax Rate (%)
                        {getSortIcon('taxRate', paymentSortField, paymentSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handlePaymentSort('bankSlipFee')}
                      >
                        Bank Slip Fee (%)
                        {getSortIcon('bankSlipFee', paymentSortField, paymentSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handlePaymentSort('cashFee')}
                      >
                        Cash Fee (%)
                        {getSortIcon('cashFee', paymentSortField, paymentSortDirection)}
                      </th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPaymentMethods.map((method) => (
                      <tr key={method.id} className="border-t">
                        {editingPaymentMethod?.id === method.id ? (
                          <>
                            <td className="p-3">
                              <Select
                                value={editingPaymentMethod.name}
                                onValueChange={(value) => setEditingPaymentMethod(prev => prev ? { ...prev, name: value } : null)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {bankAccounts.length > 0 ? (
                                    bankAccounts.map((account) => (
                                      <SelectItem key={account.id} value={account.accountName}>
                                        {account.accountName}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>No bank accounts available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editingPaymentMethod.taxRate}
                                onChange={(e) => setEditingPaymentMethod(prev => prev ? { ...prev, taxRate: parseFloat(e.target.value) || 0 } : null)}
                                step="0.1"
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editingPaymentMethod.bankSlipFee}
                                onChange={(e) => setEditingPaymentMethod(prev => prev ? { ...prev, bankSlipFee: parseFloat(e.target.value) || 0 } : null)}
                                step="0.1"
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editingPaymentMethod.cashFee}
                                onChange={(e) => setEditingPaymentMethod(prev => prev ? { ...prev, cashFee: parseFloat(e.target.value) || 0 } : null)}
                                step="0.1"
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updatePaymentMethod(method.id)}
                                  disabled={isUpdatingPayment}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {isUpdatingPayment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingPaymentMethod(null)}
                                  disabled={isUpdatingPayment}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm font-medium">{method.name}</td>
                            <td className="p-3 text-sm">{method.taxRate}%</td>
                            <td className="p-3 text-sm">{method.bankSlipFee}%</td>
                            <td className="p-3 text-sm">{method.cashFee}%</td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingPaymentMethod(method)}
                                  disabled={isDeletingPayment === method.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePaymentMethod(method.id)}
                                  disabled={isDeletingPayment === method.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {isDeletingPayment === method.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Registration Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span className="truncate">Bank Account Registration</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Add and manage bank accounts with their currencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Bank Account Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={newBankAccount.accountName}
                onChange={(e) => setNewBankAccount(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="e.g., Sicredi, Cash"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountCurrency">Currency</Label>
              <Select
                value={newBankAccount.currency}
                onValueChange={(value) => setNewBankAccount(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button onClick={addBankAccount} disabled={isAddingBank} className="w-full">
                {isAddingBank ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAddingBank ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </div>

          {/* Bank Accounts Table */}
          {bankAccounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Registered Bank Accounts</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleBankSort('accountName')}
                      >
                        Account Name
                        {getSortIcon('accountName', bankSortField, bankSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleBankSort('currency')}
                      >
                        Currency
                        {getSortIcon('currency', bankSortField, bankSortDirection)}
                      </th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBankAccounts.map((account) => (
                      <tr key={account.id} className="border-t">
                        {editingBankAccount?.id === account.id ? (
                          <>
                            <td className="p-3">
                              <Input
                                value={editingBankAccount.accountName}
                                onChange={(e) => setEditingBankAccount(prev => prev ? { ...prev, accountName: e.target.value } : null)}
                                className="h-8"
                              />
                            </td>
                            <td className="p-3">
                              <Select
                                value={editingBankAccount.currency}
                                onValueChange={(value) => setEditingBankAccount(prev => prev ? { ...prev, currency: value } : null)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="BRL">BRL</SelectItem>
                                  <SelectItem value="ARS">ARS</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateBankAccount(account.id)}
                                  disabled={isUpdatingBank}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {isUpdatingBank ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingBankAccount(null)}
                                  disabled={isUpdatingBank}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm font-medium">{account.accountName}</td>
                            <td className="p-3">
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{account.currency}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingBankAccount(account)}
                                  disabled={isDeletingBank === account.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBankAccount(account.id)}
                                  disabled={isDeletingBank === account.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {isDeletingBank === account.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Policies Configuration Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-orange-600" />
            <span className="truncate">Terms and Policies Configuration</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Set terms and conditions with optional file upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Terms Config Form */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                value={newTermsConfig.termsAndConditions}
                onChange={(e) => setNewTermsConfig(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                placeholder="Enter your terms and conditions here..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsFile">Upload Terms Document (Optional)</Label>
              <Input
                id="termsFile"
                type="file"
                onChange={handleFileSelect}
                disabled={uploadingFile || isAddingTerms}
                accept=".pdf,.doc,.docx"
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
              )}
              {uploadingFile && (
                <p className="text-sm text-muted-foreground">Uploading file...</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={addTermsConfig} disabled={isAddingTerms} className="bg-blue-600 hover:bg-blue-700">
                {isAddingTerms ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isAddingTerms ? 'Adding...' : 'Add Terms Config'}
              </Button>
            </div>
          </div>

          {/* Terms Config Table */}
          {termsConfigs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Terms Configurations</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleTermsSort('termsAndConditions')}
                      >
                        Terms and Conditions
                        {getSortIcon('termsAndConditions', termsSortField, termsSortDirection)}
                      </th>
                      <th
                        className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleTermsSort('termsFileName')}
                      >
                        File
                        {getSortIcon('termsFileName', termsSortField, termsSortDirection)}
                      </th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTermsConfigs.map((config) => (
                      <tr key={config.id} className="border-t">
                        {editingTermsConfig?.id === config.id ? (
                          <>
                            <td className="p-3">
                              <Textarea
                                value={editingTermsConfig.termsAndConditions}
                                onChange={(e) => setEditingTermsConfig(prev => prev ? { ...prev, termsAndConditions: e.target.value } : null)}
                                rows={3}
                                className="resize-none"
                              />
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-muted-foreground">{editingTermsConfig.termsFileName || 'No file'}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateTermsConfig(config.id)}
                                  disabled={isUpdatingTerms}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  {isUpdatingTerms ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTermsConfig(null)}
                                  disabled={isUpdatingTerms}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm max-w-md truncate">{config.termsAndConditions || 'No terms set'}</td>
                            <td className="p-3">
                              {config.termsFileUrl ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const fileUrl = config.termsFileUrl.startsWith('http')
                                      ? config.termsFileUrl
                                      : `${API_CONFIG.BASE_URL}${config.termsFileUrl}`
                                    window.open(fileUrl, '_blank')
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  {config.termsFileName}
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">No file</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTermsConfig(config)}
                                  disabled={isDeletingTerms === config.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTermsConfig(config.id)}
                                  disabled={isDeletingTerms === config.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {isDeletingTerms === config.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemTab