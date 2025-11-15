import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Save, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { BankAccount, SortDirection } from './types'
import { getSortIcon, sortData, createSortHandler } from './utils'

interface BankAccountsProps {
  bankAccounts: BankAccount[]
  onUpdate: (accounts: BankAccount[]) => void
}

export const BankAccounts: React.FC<BankAccountsProps> = ({
  bankAccounts,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    currency: 'USD'
  })

  // Sort state
  const [sortField, setSortField] = useState<keyof BankAccount | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedAccounts = useMemo(
    () => sortData(bankAccounts, sortField, sortDirection),
    [bankAccounts, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = createSortHandler(sortField, sortDirection, setSortField, setSortDirection)

  const addBankAccount = async () => {
    if (!newAccount.accountName) {
      toast.error('Please enter an account name')
      return
    }

    setIsAdding(true)
    try {
      const payload = {
        accountName: newAccount.accountName,
        currency: newAccount.currency
      }

      const response = await apiCall('/api/settings/system/payment-account/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add bank account')

      const result = await response.json()
      onUpdate([...bankAccounts, result])
      setNewAccount({ accountName: '', currency: 'USD' })
      toast.success('Bank account added successfully!')
    } catch (error) {
      console.error('Error adding bank account:', error)
      toast.error('Failed to add bank account')
    } finally {
      setIsAdding(false)
    }
  }

  const updateBankAccount = async (id: string) => {
    if (!editingAccount) return

    setIsUpdating(true)
    try {
      const payload = {
        accountName: editingAccount.accountName,
        currency: editingAccount.currency
      }

      const response = await apiCall(`/api/settings/system/payment-account/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update bank account')

      const result = await response.json()
      onUpdate(bankAccounts.map(ba => ba.id === id ? result : ba))
      setEditingAccount(null)
      toast.success('Bank account updated successfully!')
    } catch (error) {
      console.error('Error updating bank account:', error)
      toast.error('Failed to update bank account')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteBankAccount = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/payment-account/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete bank account')

      onUpdate(bankAccounts.filter(ba => ba.id !== id))
      toast.success('Bank account deleted successfully!')
    } catch (error) {
      console.error('Error deleting bank account:', error)
      toast.error('Failed to delete bank account')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
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
              value={newAccount.accountName}
              onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
              placeholder="e.g., Sicredi, Cash"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountCurrency">Currency</Label>
            <Select
              value={newAccount.currency}
              onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}
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
            <Button onClick={addBankAccount} disabled={isAdding} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add Account'}
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
                      onClick={() => handleSort('accountName')}
                    >
                      Account Name
                      {getSortIcon('accountName', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('currency')}
                    >
                      Currency
                      {getSortIcon('currency', sortField, sortDirection)}
                    </th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAccounts.map((account) => (
                    <tr key={account.id} className="border-t">
                      {editingAccount?.id === account.id ? (
                        <>
                          <td className="p-3">
                            <Input
                              value={editingAccount.accountName}
                              onChange={(e) => setEditingAccount(prev => prev ? { ...prev, accountName: e.target.value } : null)}
                              className="h-8"
                            />
                          </td>
                          <td className="p-3">
                            <Select
                              value={editingAccount.currency}
                              onValueChange={(value) => setEditingAccount(prev => prev ? { ...prev, currency: value } : null)}
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
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-700"
                              >
                                {isUpdating ? (
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
                                onClick={() => setEditingAccount(null)}
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
                          <td className="p-3 text-sm font-medium">{account.accountName}</td>
                          <td className="p-3">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{account.currency}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingAccount(account)}
                                disabled={isDeleting === account.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBankAccount(account.id)}
                                disabled={isDeleting === account.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === account.id ? (
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
