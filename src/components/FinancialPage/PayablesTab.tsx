import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Clock, CalendarCheck, CheckCircle, DollarSign } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import type { Payables, Expense, PayableCommission } from '@/types/financial'

interface User {
  id: string
  full_name: string
}

interface PaymentAccount {
  id: string
  accountName: string
  currency: string
}

interface PayablesTabProps {
  payables: Payables
  expenses: Expense[]
  formatCurrency: (amount: number, currency?: string) => string
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
  selectedCurrency: string
  loading: boolean
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
  users?: User[]
  paymentAccounts?: PaymentAccount[]
}

type ExpenseSortField = 'person_name' | 'expense_type' | 'category' | 'amount' | 'due_date' | 'payment_status'
type CommissionSortField = 'id' | 'bookingId' | 'salesperson' | 'amount' | 'percentage' | 'status'
type SortDirection = 'asc' | 'desc' | null

const PayablesTab: React.FC<PayablesTabProps> = ({
  payables,
  expenses,
  formatCurrency,
  convertCurrency,
  selectedCurrency,
  loading,
  onAddExpense,
  onEditExpense,
  users = [],
  paymentAccounts = [],
}) => {
  // Filter states
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [paymentAccountFilter, setPaymentAccountFilter] = useState<string>('all')

  // Expense sort state
  const [expenseSortField, setExpenseSortField] = useState<ExpenseSortField | null>(null)
  const [expenseSortDirection, setExpenseSortDirection] = useState<SortDirection>(null)

  // Commission sort state
  const [commissionSortField, setCommissionSortField] = useState<CommissionSortField | null>(null)
  const [commissionSortDirection, setCommissionSortDirection] = useState<SortDirection>(null)

  // Ensure expenses is always an array
  const expensesList = Array.isArray(expenses) ? expenses : []
  const commissionsList = Array.isArray(payables?.commissions) ? payables.commissions : []

  // Use users from props (loaded from backend), fallback to deriving from expenses
  const uniquePersons = useMemo(() => {
    if (users.length > 0) {
      return users.map(user => ({ id: user.id, name: user.full_name }))
    }
    // Fallback: derive from expenses data
    const persons = new Map<string, string>()
    expensesList.forEach(expense => {
      if (expense.person_id && expense.person_name) {
        persons.set(expense.person_id, expense.person_name)
      }
    })
    return Array.from(persons.entries()).map(([id, name]) => ({ id, name }))
  }, [users, expensesList])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expensesList.filter(expense => {
      // Person filter
      if (personFilter !== 'all' && expense.person_id !== personFilter) {
        return false
      }
      // Payment account filter
      if (paymentAccountFilter !== 'all' && expense.payment_account_id !== paymentAccountFilter) {
        return false
      }
      return true
    })
  }, [expensesList, personFilter, paymentAccountFilter])

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    if (!expenseSortField || !expenseSortDirection) return filteredExpenses

    return [...filteredExpenses].sort((a, b) => {
      let aValue: any = a[expenseSortField]
      let bValue: any = b[expenseSortField]

      // Handle amount with currency conversion - ensure numeric values
      if (expenseSortField === 'amount') {
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
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return expenseSortDirection === 'asc' ? comparison : -comparison
      }

      if (expenseSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })
  }, [filteredExpenses, expenseSortField, expenseSortDirection, selectedCurrency, convertCurrency])

  // Sort commissions
  const sortedCommissions = useMemo(() => {
    if (!commissionSortField || !commissionSortDirection) return commissionsList

    return [...commissionsList].sort((a, b) => {
      let aValue: any = a[commissionSortField]
      let bValue: any = b[commissionSortField]

      // Handle amount with currency conversion - ensure numeric values
      if (commissionSortField === 'amount') {
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
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return commissionSortDirection === 'asc' ? comparison : -comparison
      }

      if (commissionSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })
  }, [commissionsList, commissionSortField, commissionSortDirection, selectedCurrency, convertCurrency])

  // Financial summary calculations
  const financialSummary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let overdue = 0
    let dueToday = 0
    let due = 0
    let paid = 0
    let total = 0

    filteredExpenses.forEach(expense => {
      // Ensure rawAmount is a number (backend may return string)
      const rawAmount = typeof expense.amount === 'string'
        ? parseFloat(expense.amount) || 0
        : Number(expense.amount) || 0

      // Convert to selected currency if needed
      const amount = expense.currency !== selectedCurrency
        ? convertCurrency(rawAmount, expense.currency, selectedCurrency)
        : rawAmount

      total += amount

      if (expense.payment_status === 'paid') {
        paid += amount
      } else if (expense.payment_status === 'overdue' || expense.is_overdue) {
        overdue += amount
      } else {
        const dueDate = new Date(expense.due_date)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate.getTime() === today.getTime()) {
          dueToday += amount
        } else if (dueDate > today) {
          due += amount
        } else {
          overdue += amount
        }
      }
    })

    return { overdue, dueToday, due, paid, total }
  }, [filteredExpenses, selectedCurrency, convertCurrency])

  // Handle expense sort
  const handleExpenseSort = (field: ExpenseSortField) => {
    if (expenseSortField === field) {
      // Cycle through: asc -> desc -> null
      if (expenseSortDirection === 'asc') {
        setExpenseSortDirection('desc')
      } else if (expenseSortDirection === 'desc') {
        setExpenseSortField(null)
        setExpenseSortDirection(null)
      }
    } else {
      setExpenseSortField(field)
      setExpenseSortDirection('asc')
    }
  }

  // Handle commission sort
  const handleCommissionSort = (field: CommissionSortField) => {
    if (commissionSortField === field) {
      // Cycle through: asc -> desc -> null
      if (commissionSortDirection === 'asc') {
        setCommissionSortDirection('desc')
      } else if (commissionSortDirection === 'desc') {
        setCommissionSortField(null)
        setCommissionSortDirection(null)
      }
    } else {
      setCommissionSortField(field)
      setCommissionSortDirection('asc')
    }
  }

  // Get expense sort icon
  const getExpenseSortIcon = (field: ExpenseSortField) => {
    if (expenseSortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    if (expenseSortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Get commission sort icon
  const getCommissionSortIcon = (field: CommissionSortField) => {
    if (commissionSortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    if (commissionSortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    return <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Get expense type label
  const getExpenseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'fc': 'FC',
      'ivc': 'IVC',
      'dvc': 'DVC',
      'fixed': 'Fixed',
      'variable': 'Variable'
    }
    return labels[type] || type
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
          <p className="mt-4 text-muted-foreground">Loading payables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Overdue */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Overdue</span>
            </div>
            <p className="text-xl font-bold text-red-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {financialSummary.overdue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Due Today */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Due Today</span>
            </div>
            <p className="text-xl font-bold text-amber-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {financialSummary.dueToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Due */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Due</span>
            </div>
            <p className="text-xl font-bold text-blue-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {financialSummary.due.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Paid */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Paid</span>
            </div>
            <p className="text-xl font-bold text-green-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {financialSummary.paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Total for Period</span>
            </div>
            <p className="text-xl font-bold text-purple-800 mt-2">
              {getCurrencySymbol(selectedCurrency)} {financialSummary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person Filter */}
            <div className="space-y-2">
              <Label>Person/User</Label>
              <Select value={personFilter} onValueChange={setPersonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All persons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Persons</SelectItem>
                  {uniquePersons.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Account Filter */}
            <div className="space-y-2">
              <Label>Payment Account</Label>
              <Select value={paymentAccountFilter} onValueChange={setPaymentAccountFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All payment accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Accounts</SelectItem>
                  {paymentAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Expenses</CardTitle>
            <Button size="sm" onClick={onAddExpense}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('person_name')}
                  >
                    <div className="flex items-center">
                      Person
                      {getExpenseSortIcon('person_name')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('expense_type')}
                  >
                    <div className="flex items-center">
                      Type
                      {getExpenseSortIcon('expense_type')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {getExpenseSortIcon('category')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {getExpenseSortIcon('amount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('due_date')}
                  >
                    <div className="flex items-center">
                      Due Date
                      {getExpenseSortIcon('due_date')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleExpenseSort('payment_status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getExpenseSortIcon('payment_status')}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No expenses found. Click "Add Expense" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.person_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getExpenseTypeLabel(expense.expense_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{expense.category.replace('-', ' ')}</TableCell>
                      <TableCell>{formatCurrency(expense.amount, expense.currency)}</TableCell>
                      <TableCell>{expense.due_date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          expense.payment_status === 'paid' ? 'success' :
                          expense.payment_status === 'overdue' || expense.is_overdue ? 'destructive' :
                          expense.payment_status === 'cancelled' ? 'secondary' :
                          'default'
                        }>
                          {expense.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      {getCommissionSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('bookingId')}
                  >
                    <div className="flex items-center">
                      Booking ID
                      {getCommissionSortIcon('bookingId')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('salesperson')}
                  >
                    <div className="flex items-center">
                      Salesperson
                      {getCommissionSortIcon('salesperson')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {getCommissionSortIcon('amount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('percentage')}
                  >
                    <div className="flex items-center">
                      Percentage
                      {getCommissionSortIcon('percentage')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleCommissionSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getCommissionSortIcon('status')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No commissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.id}</TableCell>
                      <TableCell>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {commission.bookingId || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{commission.salesperson}</TableCell>
                      <TableCell>{formatCurrency(commission.amount, commission.currency)}</TableCell>
                      <TableCell>{commission.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          commission.status === 'paid' ? 'success' :
                          commission.status === 'pending' ? 'default' :
                          'secondary'
                        }>
                          {commission.status}
                        </Badge>
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

export default PayablesTab
