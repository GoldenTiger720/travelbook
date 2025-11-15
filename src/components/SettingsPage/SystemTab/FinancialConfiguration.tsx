import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Save, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { FinancialConfig, SortDirection, CURRENCY_OPTIONS } from './types'
import { getSortIcon, sortData, createSortHandler } from './utils'

interface FinancialConfigurationProps {
  financialConfigs: FinancialConfig[]
  onUpdate: (configs: FinancialConfig[]) => void
}

export const FinancialConfiguration: React.FC<FinancialConfigurationProps> = ({
  financialConfigs,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState<FinancialConfig | null>(null)
  const [newConfig, setNewConfig] = useState({
    baseCurrency: 'USD',
    taxRate: 0
  })

  // Sort state
  const [sortField, setSortField] = useState<keyof FinancialConfig | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedConfigs = useMemo(
    () => sortData(financialConfigs, sortField, sortDirection),
    [financialConfigs, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = createSortHandler(sortField, sortDirection, setSortField, setSortDirection)

  const addFinancialConfig = async () => {
    if (!newConfig.baseCurrency) {
      toast.error('Please select a base currency')
      return
    }

    setIsAdding(true)
    try {
      const payload = {
        base_currency: newConfig.baseCurrency,
        tax_rate: newConfig.taxRate.toString()
      }

      const response = await apiCall('/api/settings/system/financial-config/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add financial configuration')

      const result = await response.json()
      onUpdate([...financialConfigs, {
        id: result.id,
        baseCurrency: result.base_currency,
        taxRate: parseFloat(result.tax_rate)
      }])
      setNewConfig({ baseCurrency: 'USD', taxRate: 0 })
      toast.success('Financial configuration added successfully!')
    } catch (error) {
      console.error('Error adding financial configuration:', error)
      toast.error('Failed to add financial configuration')
    } finally {
      setIsAdding(false)
    }
  }

  const updateFinancialConfig = async (id: string) => {
    if (!editingConfig) return

    setIsUpdating(true)
    try {
      const payload = {
        base_currency: editingConfig.baseCurrency,
        tax_rate: editingConfig.taxRate.toString()
      }

      const response = await apiCall(`/api/settings/system/financial-config/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update financial configuration')

      const result = await response.json()
      onUpdate(financialConfigs.map(fc => fc.id === id ? {
        id: result.id,
        baseCurrency: result.base_currency,
        taxRate: parseFloat(result.tax_rate)
      } : fc))
      setEditingConfig(null)
      toast.success('Financial configuration updated successfully!')
    } catch (error) {
      console.error('Error updating financial configuration:', error)
      toast.error('Failed to update financial configuration')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteFinancialConfig = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/financial-config/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete financial configuration')

      onUpdate(financialConfigs.filter(fc => fc.id !== id))
      toast.success('Financial configuration deleted successfully!')
    } catch (error) {
      console.error('Error deleting financial configuration:', error)
      toast.error('Failed to delete financial configuration')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
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
              value={newConfig.baseCurrency}
              onValueChange={(value) => setNewConfig(prev => ({ ...prev, baseCurrency: value }))}
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
              value={newConfig.taxRate}
              onChange={(e) => setNewConfig(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="invisible">Add</Label>
            <Button onClick={addFinancialConfig} disabled={isAdding} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add Config'}
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
                      onClick={() => handleSort('baseCurrency')}
                    >
                      Base Currency
                      {getSortIcon('baseCurrency', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('taxRate')}
                    >
                      Tax Rate (%)
                      {getSortIcon('taxRate', sortField, sortDirection)}
                    </th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedConfigs.map((config) => (
                    <tr key={config.id} className="border-t">
                      {editingConfig?.id === config.id ? (
                        <>
                          <td className="p-3">
                            <Select
                              value={editingConfig.baseCurrency}
                              onValueChange={(value) => setEditingConfig(prev => prev ? { ...prev, baseCurrency: value } : null)}
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
                              value={editingConfig.taxRate}
                              onChange={(e) => setEditingConfig(prev => prev ? { ...prev, taxRate: parseFloat(e.target.value) || 0 } : null)}
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
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-700"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingConfig(null)}
                                disabled={isUpdating}
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
                                onClick={() => setEditingConfig(config)}
                                disabled={isDeleting === config.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFinancialConfig(config.id!)}
                                disabled={isDeleting === config.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === config.id ? (
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
  )
}
