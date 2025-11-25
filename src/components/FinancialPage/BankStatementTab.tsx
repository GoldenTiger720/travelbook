import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BankStatement, BankTransaction, Currency } from '@/types/financial'

interface PaymentAccount {
  id: string
  accountName: string
  currency: string
}

interface BankStatementTabProps {
  bankStatement: BankStatement | null
  formatCurrency: (amount: number, currency?: string) => string
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
  selectedCurrency: string
  loading: boolean
  paymentAccounts: PaymentAccount[]
  selectedAccount: string
  onAccountChange: (accountId: string) => void
  onAddTransfer: () => void
}

type SortField = 'date' | 'description' | 'amount' | 'type' | 'direction'
type SortDirection = 'asc' | 'desc' | null

const BankStatementTab: React.FC<BankStatementTabProps> = ({
  bankStatement,
  formatCurrency,
  convertCurrency,
  selectedCurrency,
  loading,
  paymentAccounts,
  selectedAccount,
  onAccountChange,
  onAddTransfer,
}) => {
  // Sort state
  const [sortField, setSortField] = useState<SortField | null>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Transaction type filter
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Direction filter
  const [directionFilter, setDirectionFilter] = useState<string>('all')

  // Get transactions from bank statement
  const transactions = bankStatement?.transactions || []

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (directionFilter !== 'all' && tx.direction !== directionFilter) return false
      return true
    })
  }, [transactions, typeFilter, directionFilter])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!sortField || !sortDirection) return filteredTransactions

    return [...filteredTransactions].sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number
      let bValue: string | number = b[sortField] as string | number

      // Handle amount with currency conversion
      if (sortField === 'amount') {
        const aAmount = typeof a.amount === 'string' ? parseFloat(a.amount) || 0 : Number(a.amount) || 0
        const bAmount = typeof b.amount === 'string' ? parseFloat(b.amount) || 0 : Number(b.amount) || 0
        aValue = a.currency !== selectedCurrency
          ? convertCurrency(aAmount, a.currency, selectedCurrency)
          : aAmount
        bValue = b.currency !== selectedCurrency
          ? convertCurrency(bAmount, b.currency, selectedCurrency)
          : bAmount
      }

      // Handle null/undefined values
      if (aValue == null) aValue = ''
      if (bValue == null) bValue = ''

      // Compare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })
  }, [filteredTransactions, sortField, sortDirection, selectedCurrency, convertCurrency])

  // Calculate summary from filtered transactions
  const summary = useMemo(() => {
    const incoming = filteredTransactions
      .filter((tx) => tx.direction === 'incoming')
      .reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : Number(tx.amount) || 0
        return sum + (tx.currency !== selectedCurrency
          ? convertCurrency(amount, tx.currency, selectedCurrency)
          : amount)
      }, 0)

    const outgoing = filteredTransactions
      .filter((tx) => tx.direction === 'outgoing')
      .reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : Number(tx.amount) || 0
        return sum + (tx.currency !== selectedCurrency
          ? convertCurrency(amount, tx.currency, selectedCurrency)
          : amount)
      }, 0)

    return {
      totalIncoming: incoming,
      totalOutgoing: outgoing,
      netChange: incoming - outgoing,
      transactionCount: filteredTransactions.length,
    }
  }, [filteredTransactions, selectedCurrency, convertCurrency])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Get transaction type badge
  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      expense: { variant: 'secondary', label: 'Expense' },
      payment: { variant: 'default', label: 'Payment' },
      transfer: { variant: 'outline', label: 'Transfer' },
    }
    const typeConfig = config[type] || { variant: 'default' as const, label: type }
    return <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
  }

  // Get direction icon and color
  const getDirectionDisplay = (direction: string, type: string) => {
    if (type === 'transfer') {
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transfer</span>
        </div>
      )
    }
    if (direction === 'incoming') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowDownLeft className="h-4 w-4" />
          <span>Incoming</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-red-600">
        <ArrowUpRight className="h-4 w-4" />
        <span>Outgoing</span>
      </div>
    )
  }

  // Currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'BRL': 'R$',
      'ARS': '$',
      'CLP': '$'
    }
    return symbols[currency] || currency
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bank statement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Incoming */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Total Incoming</span>
            </div>
            <p className="text-xl font-bold text-green-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {summary.totalIncoming.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Total Outgoing */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Total Outgoing</span>
            </div>
            <p className="text-xl font-bold text-red-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {summary.totalOutgoing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Net Change */}
        <Card className={summary.netChange >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className={`h-5 w-5 ${summary.netChange >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
              <span className={`text-sm font-medium ${summary.netChange >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>Net Change</span>
            </div>
            <p className={`text-xl font-bold mt-2 ${summary.netChange >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
              {summary.netChange >= 0 ? '+' : ''}{getCurrencySymbol(selectedCurrency)} {summary.netChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Transactions</span>
            </div>
            <p className="text-xl font-bold text-purple-800 mt-2">
              {summary.transactionCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Bank Account Filter */}
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select value={selectedAccount} onValueChange={onAccountChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {paymentAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Direction Filter */}
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Transfer Button */}
            <div className="space-y-2">
              <Label className="opacity-0">Actions</Label>
              <Button onClick={onAddTransfer} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Transfer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Settled Transactions
              {bankStatement?.account && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {bankStatement.account.name} ({bankStatement.account.currency})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('direction')}
                  >
                    <div className="flex items-center">
                      Direction
                      {getSortIcon('direction')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[200px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Description
                      {getSortIcon('description')}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[100px]">Reference</TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {getSortIcon('amount')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No transactions found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>{getDirectionDisplay(transaction.direction, transaction.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="truncate">{transaction.description}</p>
                          {transaction.person_name && (
                            <p className="text-xs text-muted-foreground">{transaction.person_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {transaction.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.direction === 'incoming' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {transaction.direction === 'incoming' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BankStatementTab
