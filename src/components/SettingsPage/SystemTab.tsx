import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { apiCall } from '@/config/api'
import {
  DollarSign,
  Save,
} from 'lucide-react'

interface SystemSettings {
  baseCurrency: string
  taxRate: number
  commissionRate: number
  paymentTerms: number
  paymentMethods: {
    [key: string]: boolean
  }
}

interface BackendSystemSettings {
  id?: string
  base_currency: string
  tax_rate: string
  commission_rate: string
  payment_terms: number
  payment_methods: {
    [key: string]: boolean
  }
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
    commissionRate: 10,
    paymentTerms: 30,
    paymentMethods: {
      'Credit Card': true,
      'Bank Transfer': true,
      'Cash': true,
      'Check': false,
      'PayPal': true,
      'Cryptocurrency': false
    }
  })

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
            commissionRate: parseFloat(data.commission_rate) || prevSettings.commissionRate,
            paymentTerms: data.payment_terms || prevSettings.paymentTerms,
            paymentMethods: data.payment_methods || prevSettings.paymentMethods
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
        commission_rate: settings.commissionRate.toString(),
        payment_terms: settings.paymentTerms,
        payment_methods: settings.paymentMethods
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

  const updatePaymentMethod = (method: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: enabled
      }
    }))
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
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Base Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={settings.commissionRate}
                onChange={(e) => updateSetting('commissionRate', parseFloat(e.target.value) || 0)}
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={settings.paymentTerms}
                onChange={(e) => updateSetting('paymentTerms', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Payment Methods</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
                <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium text-sm sm:text-base">{method}</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updatePaymentMethod(method, checked)}
                  />
                </div>
              ))}
            </div>
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