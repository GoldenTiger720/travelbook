import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Save, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { PaymentMethod, BankAccount, SortDirection } from './types'
import { getSortIcon, sortData, createSortHandler } from './utils'

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  bankAccounts: BankAccount[]
  onUpdate: (methods: PaymentMethod[]) => void
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  bankAccounts,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [newMethod, setNewMethod] = useState({
    name: '',
    taxRate: 0,
    bankSlipFee: 0,
    cashFee: 0
  })

  // Sort state
  const [sortField, setSortField] = useState<keyof PaymentMethod | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedMethods = useMemo(
    () => sortData(paymentMethods, sortField, sortDirection),
    [paymentMethods, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = createSortHandler(sortField, sortDirection, setSortField, setSortDirection)

  const addPaymentMethod = async () => {
    if (!newMethod.name) {
      toast.error('Please select a payment method')
      return
    }

    setIsAdding(true)
    try {
      const payload = {
        name: newMethod.name,
        taxRate: newMethod.taxRate,
        bankSlipFee: newMethod.bankSlipFee,
        cashFee: newMethod.cashFee
      }

      const response = await apiCall('/api/settings/system/payment-fee/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add payment method')

      const result = await response.json()
      onUpdate([...paymentMethods, result])
      setNewMethod({ name: '', taxRate: 0, bankSlipFee: 0, cashFee: 0 })
      toast.success('Payment method added successfully!')
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error('Failed to add payment method')
    } finally {
      setIsAdding(false)
    }
  }

  const updatePaymentMethod = async (id: string) => {
    if (!editingMethod) return

    setIsUpdating(true)
    try {
      const payload = {
        name: editingMethod.name,
        taxRate: editingMethod.taxRate,
        bankSlipFee: editingMethod.bankSlipFee,
        cashFee: editingMethod.cashFee
      }

      const response = await apiCall(`/api/settings/system/payment-fee/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update payment method')

      const result = await response.json()
      onUpdate(paymentMethods.map(pm => pm.id === id ? result : pm))
      setEditingMethod(null)
      toast.success('Payment method updated successfully!')
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
    } finally {
      setIsUpdating(false)
    }
  }

  const deletePaymentMethod = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/payment-fee/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      onUpdate(paymentMethods.filter(pm => pm.id !== id))
      toast.success('Payment method deleted successfully!')
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to delete payment method')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
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
              value={newMethod.name}
              onValueChange={(value) => setNewMethod(prev => ({ ...prev, name: value }))}
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
              value={newMethod.taxRate}
              onChange={(e) => setNewMethod(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankSlipFee">Bank Slip Fee (%)</Label>
            <Input
              id="bankSlipFee"
              type="number"
              value={newMethod.bankSlipFee}
              onChange={(e) => setNewMethod(prev => ({ ...prev, bankSlipFee: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cashFee">Cash Fee (%)</Label>
            <Input
              id="cashFee"
              type="number"
              value={newMethod.cashFee}
              onChange={(e) => setNewMethod(prev => ({ ...prev, cashFee: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <Label className="invisible">Add</Label>
            <Button onClick={addPaymentMethod} disabled={isAdding} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add'}
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
                      onClick={() => handleSort('name')}
                    >
                      Payment Method
                      {getSortIcon('name', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('taxRate')}
                    >
                      Tax Rate (%)
                      {getSortIcon('taxRate', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('bankSlipFee')}
                    >
                      Bank Slip Fee (%)
                      {getSortIcon('bankSlipFee', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('cashFee')}
                    >
                      Cash Fee (%)
                      {getSortIcon('cashFee', sortField, sortDirection)}
                    </th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMethods.map((method) => (
                    <tr key={method.id} className="border-t">
                      {editingMethod?.id === method.id ? (
                        <>
                          <td className="p-3">
                            <Select
                              value={editingMethod.name}
                              onValueChange={(value) => setEditingMethod(prev => prev ? { ...prev, name: value } : null)}
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
                              value={editingMethod.taxRate}
                              onChange={(e) => setEditingMethod(prev => prev ? { ...prev, taxRate: parseFloat(e.target.value) || 0 } : null)}
                              step="0.1"
                              className="h-8"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={editingMethod.bankSlipFee}
                              onChange={(e) => setEditingMethod(prev => prev ? { ...prev, bankSlipFee: parseFloat(e.target.value) || 0 } : null)}
                              step="0.1"
                              className="h-8"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={editingMethod.cashFee}
                              onChange={(e) => setEditingMethod(prev => prev ? { ...prev, cashFee: parseFloat(e.target.value) || 0 } : null)}
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
                                onClick={() => setEditingMethod(null)}
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
                          <td className="p-3 text-sm font-medium">{method.name}</td>
                          <td className="p-3 text-sm">{method.taxRate}%</td>
                          <td className="p-3 text-sm">{method.bankSlipFee}%</td>
                          <td className="p-3 text-sm">{method.cashFee}%</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMethod(method)}
                                disabled={isDeleting === method.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePaymentMethod(method.id)}
                                disabled={isDeleting === method.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === method.id ? (
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
