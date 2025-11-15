import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Save, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { ExchangeRate as ExchangeRateType, SortDirection } from './types'
import { getSortIcon, sortData, createSortHandler } from './utils'

interface ExchangeRateProps {
  exchangeRates: ExchangeRateType[]
  onUpdate: (rates: ExchangeRateType[]) => void
}

export const ExchangeRate: React.FC<ExchangeRateProps> = ({
  exchangeRates,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState<ExchangeRateType | null>(null)
  const [newRate, setNewRate] = useState({
    from_currency: 'USD',
    to_currency: 'BRL',
    rate: 0
  })

  // Sort state
  const [sortField, setSortField] = useState<keyof ExchangeRateType | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedRates = useMemo(
    () => sortData(exchangeRates, sortField, sortDirection),
    [exchangeRates, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = createSortHandler(sortField, sortDirection, setSortField, setSortDirection)

  const addExchangeRate = async () => {
    if (!newRate.from_currency || !newRate.to_currency) {
      toast.error('Please select currencies')
      return
    }

    if (newRate.rate <= 0) {
      toast.error('Please enter a valid exchange rate')
      return
    }

    setIsAdding(true)
    try {
      const response = await apiCall('/api/settings/system/exchange-rate/', {
        method: 'POST',
        body: JSON.stringify(newRate)
      })

      if (!response.ok) throw new Error('Failed to add exchange rate')

      const data = await response.json()
      onUpdate([...exchangeRates, {
        id: data.id,
        from_currency: data.from_currency,
        to_currency: data.to_currency,
        rate: parseFloat(data.rate)
      }])

      setNewRate({ from_currency: 'USD', to_currency: 'BRL', rate: 0 })
      toast.success('Exchange rate added successfully!')
    } catch (error) {
      console.error('Error adding exchange rate:', error)
      toast.error('Failed to add exchange rate')
    } finally {
      setIsAdding(false)
    }
  }

  const updateExchangeRate = async (id: string) => {
    if (!editingRate) return

    setIsUpdating(true)
    try {
      const response = await apiCall(`/api/settings/system/exchange-rate/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          from_currency: editingRate.from_currency,
          to_currency: editingRate.to_currency,
          rate: editingRate.rate
        })
      })

      if (!response.ok) throw new Error('Failed to update exchange rate')

      const data = await response.json()
      onUpdate(exchangeRates.map(er => er.id === id ? {
        id: data.id,
        from_currency: data.from_currency,
        to_currency: data.to_currency,
        rate: parseFloat(data.rate)
      } : er))

      setEditingRate(null)
      toast.success('Exchange rate updated successfully!')
    } catch (error) {
      console.error('Error updating exchange rate:', error)
      toast.error('Failed to update exchange rate')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteExchangeRate = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/exchange-rate/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete exchange rate')

      onUpdate(exchangeRates.filter(er => er.id !== id))
      toast.success('Exchange rate deleted successfully!')
    } catch (error) {
      console.error('Error deleting exchange rate:', error)
      toast.error('Failed to delete exchange rate')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
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
              value={newRate.from_currency}
              onValueChange={(value) => setNewRate(prev => ({ ...prev, from_currency: value }))}
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
              value={newRate.to_currency}
              onValueChange={(value) => setNewRate(prev => ({ ...prev, to_currency: value }))}
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
              value={newRate.rate || ''}
              onChange={(e) => setNewRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="invisible">Add</Label>
            <Button onClick={addExchangeRate} disabled={isAdding} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add Rate'}
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
                      onClick={() => handleSort('from_currency')}
                    >
                      From Currency
                      {getSortIcon('from_currency', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('to_currency')}
                    >
                      To Currency
                      {getSortIcon('to_currency', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('rate')}
                    >
                      Rate
                      {getSortIcon('rate', sortField, sortDirection)}
                    </th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRates.map((exchangeRate) => (
                    <tr key={exchangeRate.id} className="border-t">
                      {editingRate?.id === exchangeRate.id ? (
                        <>
                          <td className="p-3">
                            <Select
                              value={editingRate.from_currency}
                              onValueChange={(value) => setEditingRate(prev => prev ? { ...prev, from_currency: value } : null)}
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
                              value={editingRate.to_currency}
                              onValueChange={(value) => setEditingRate(prev => prev ? { ...prev, to_currency: value } : null)}
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
                              value={editingRate.rate}
                              onChange={(e) => setEditingRate(prev => prev ? { ...prev, rate: parseFloat(e.target.value) || 0 } : null)}
                              className="h-8"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateExchangeRate(exchangeRate.id)}
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
                                onClick={() => setEditingRate(null)}
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
                                onClick={() => setEditingRate(exchangeRate)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteExchangeRate(exchangeRate.id)}
                                disabled={isDeleting === exchangeRate.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === exchangeRate.id ? (
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
