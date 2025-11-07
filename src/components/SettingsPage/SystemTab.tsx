import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiCall } from '@/config/api'
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

interface SystemSettings {
  baseCurrency: string
  taxRate: number
  paymentMethods: PaymentMethod[]
  bankAccounts: BankAccount[]
  termsAndConditions: string
  termsFileUrl: string
  termsFileName: string
}

interface BackendSystemSettings {
  id?: string
  base_currency: string
  tax_rate: string
  payment_methods?: PaymentMethod[]
  bank_accounts?: BankAccount[]
  terms_and_conditions?: string
  terms_file_url?: string
  terms_file_name?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

const SystemTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [settings, setSettings] = useState<SystemSettings>({
    baseCurrency: 'USD',
    taxRate: 8.5,
    paymentMethods: [],
    bankAccounts: [],
    termsAndConditions: '',
    termsFileUrl: '',
    termsFileName: ''
  })

  // Payment Method form state
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    taxRate: 0,
    bankSlipFee: 0,
    cashFee: 0
  })

  // Bank Account form state
  const [newBankAccount, setNewBankAccount] = useState({
    accountName: '',
    currency: 'USD'
  })

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false)

  // Load system settings on component mount
  useEffect(() => {
    const loadSystemSettings = async () => {
      setIsLoadingSettings(true)
      try {
        const response = await apiCall('/api/settings/system/', {
          method: 'GET'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: BackendSystemSettings = await response.json()

        // Update settings with loaded data, mapping backend fields to frontend format
        if (data) {
          setSettings(prevSettings => ({
            ...prevSettings,
            baseCurrency: data.base_currency || prevSettings.baseCurrency,
            taxRate: parseFloat(data.tax_rate) || prevSettings.taxRate,
            paymentMethods: data.payment_methods || prevSettings.paymentMethods,
            bankAccounts: data.bank_accounts || prevSettings.bankAccounts,
            termsAndConditions: data.terms_and_conditions || prevSettings.termsAndConditions,
            termsFileUrl: data.terms_file_url || prevSettings.termsFileUrl,
            termsFileName: data.terms_file_name || prevSettings.termsFileName
          }))
        }

      } catch (error) {
        console.error('Error loading system settings:', error)
        toast.error('Failed to load system settings. Using default values.')
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSystemSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Map frontend format to backend format
      const backendPayload = {
        base_currency: settings.baseCurrency,
        tax_rate: settings.taxRate.toString(),
        payment_methods: settings.paymentMethods,
        bank_accounts: settings.bankAccounts,
        terms_and_conditions: settings.termsAndConditions,
        terms_file_url: settings.termsFileUrl,
        terms_file_name: settings.termsFileName
      }

      const response = await apiCall('/api/settings/system/', {
        method: 'POST',
        body: JSON.stringify(backendPayload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      toast.success('System settings saved successfully!')
    } catch (error) {
      console.error('Error saving system settings:', error)
      toast.error('Failed to save system settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Payment Method handlers
  const addPaymentMethod = () => {
    if (!newPaymentMethod.name) {
      toast.error('Please enter a payment method name')
      return
    }
    const paymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: newPaymentMethod.name,
      taxRate: newPaymentMethod.taxRate,
      bankSlipFee: newPaymentMethod.bankSlipFee,
      cashFee: newPaymentMethod.cashFee
    }
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, paymentMethod]
    }))
    setNewPaymentMethod({ name: '', taxRate: 0, bankSlipFee: 0, cashFee: 0 })
    toast.success('Payment method added')
  }

  const removePaymentMethod = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }))
    toast.success('Payment method removed')
  }

  // Bank Account handlers
  const addBankAccount = () => {
    if (!newBankAccount.accountName) {
      toast.error('Please enter an account name')
      return
    }
    const bankAccount: BankAccount = {
      id: Date.now().toString(),
      accountName: newBankAccount.accountName,
      currency: newBankAccount.currency
    }
    setSettings(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, bankAccount]
    }))
    setNewBankAccount({ accountName: '', currency: 'USD' })
    toast.success('Bank account added')
  }

  const removeBankAccount = (id: string) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(ba => ba.id !== id)
    }))
    toast.success('Bank account removed')
  }

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiCall('/api/settings/upload-terms/', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type with boundary for multipart/form-data
      })

      if (!response.ok) {
        throw new Error('File upload failed')
      }

      const data = await response.json()
      setSettings(prev => ({
        ...prev,
        termsFileUrl: data.file_url,
        termsFileName: file.name
      }))
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploadingFile(false)
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
      {/* Financial Settings */}
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
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select value={settings.baseCurrency} onValueChange={(value) => updateSetting('baseCurrency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) || 0)}
                step="0.1"
              />
            </div>
          </div>
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
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
              <Button onClick={addPaymentMethod} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Payment Methods List */}
          {settings.paymentMethods.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Configured Payment Methods</h4>
              <div className="space-y-2">
                {settings.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <span className="font-medium text-sm">{method.name}</span>
                      <span className="text-sm text-muted-foreground">Tax: {method.taxRate}%</span>
                      <span className="text-sm text-muted-foreground">Bank Slip: {method.bankSlipFee}%</span>
                      <span className="text-sm text-muted-foreground">Cash: {method.cashFee}%</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="invisible">Add</Label>
              <Button onClick={addBankAccount} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Bank Accounts List */}
          {settings.bankAccounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Registered Bank Accounts</h4>
              <div className="space-y-2">
                {settings.bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-sm">{account.accountName}</span>
                      <span className="text-sm text-muted-foreground">-</span>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{account.currency}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBankAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
            <Textarea
              id="termsAndConditions"
              value={settings.termsAndConditions}
              onChange={(e) => updateSetting('termsAndConditions', e.target.value)}
              placeholder="Enter your terms and conditions here..."
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsFile">Upload Terms Document</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="termsFile"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  accept=".pdf,.doc,.docx"
                  className="cursor-pointer"
                />
              </div>
              {settings.termsFileName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{settings.termsFileName}</span>
                  {settings.termsFileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(settings.termsFileUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}
            </div>
            {uploadingFile && (
              <p className="text-sm text-muted-foreground">Uploading file...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
          size="default"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

export default SystemTab