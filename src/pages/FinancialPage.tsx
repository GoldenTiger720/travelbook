import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from '@/components/FinancialPage/DashboardTab'
import ReceivablesTab from '@/components/FinancialPage/ReceivablesTab'
import PayablesTab from '@/components/FinancialPage/PayablesTab'
import ReportsTab from '@/components/FinancialPage/ReportsTab'
import { AddExpenseDialog } from '@/components/FinancialPage/AddExpenseDialog'
import { EditExpenseDialog } from '@/components/FinancialPage/EditExpenseDialog'
import AddRecipeDialog, { RecipeFormData } from '@/components/FinancialPage/AddRecipeDialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import { useReceivables, useCreateRecipe } from '@/lib/hooks/useReceivables'
import { useExchangeRates } from '@/lib/hooks/useExchangeRates'
import type {
  FinancialDashboard,
  Expense,
  ExpenseFormData,
  Payables,
  Currency
} from '@/types/financial'

const FinancialPage = () => {
  const { t } = useLanguage()
  const { toast } = useToast()

  // Date range state
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()))

  // Currency filter
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')

  // Data state
  const [dashboardData, setDashboardData] = useState<FinancialDashboard | null>(null)
  const [payables, setPayables] = useState<Payables>({ expenses: [], commissions: [] })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Exchange rates for currency conversion
  const { convertCurrency } = useExchangeRates()

  // React Query for receivables with optimistic updates
  const { data: receivables = [], isLoading: loadingReceivables } = useReceivables(startDate, endDate)
  const createRecipeMutation = useCreateRecipe(startDate, endDate, bookings)

  // Dialog state
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [editExpenseOpen, setEditExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [addRecipeOpen, setAddRecipeOpen] = useState(false)

  // Fetch financial dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}&currency=${selectedCurrency}`
      const response = await apiCall(API_ENDPOINTS.FINANCIAL.DASHBOARD + params)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load financial dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }


  // Fetch payables
  const fetchPayables = async () => {
    try {
      const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      const response = await apiCall(API_ENDPOINTS.FINANCIAL.PAYABLES + params)
      const data = await response.json()
      setPayables(data)
    } catch (error) {
      console.error('Error fetching payables:', error)
    }
  }

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      const response = await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSES + params)
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  // Fetch bookings (cached for recipe dialog)
  const fetchBookings = async () => {
    if (bookings.length > 0) return // Already loaded

    try {
      setLoadingBookings(true)
      const response = await apiCall('/api/reservation/recipe-options/', { method: 'GET' })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()
      const bookingsData = result.data || []
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoadingBookings(false)
    }
  }

  // Fetch users (lazy load when expense dialog opens)
  const fetchUsers = async () => {
    if (users.length > 0) return // Already loaded

    try {
      setLoadingUsers(true)
      const response = await apiCall('/api/users/', { method: 'GET' })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const result = await response.json()
      const usersData = result.results || result || []
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Preload bookings on component mount (for instant recipe dialog loading)
  useEffect(() => {
    fetchBookings()
  }, [])

  // Lazy load users when expense dialog opens
  useEffect(() => {
    if ((addExpenseOpen || editExpenseOpen) && users.length === 0) {
      fetchUsers()
    }
  }, [addExpenseOpen, editExpenseOpen])

  // Load all data when date range or currency changes
  // Note: receivables are handled by React Query automatically
  useEffect(() => {
    fetchDashboardData()
    fetchPayables()
    fetchExpenses()
  }, [startDate, endDate, selectedCurrency])

  // Handle add expense
  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      // Check if there's an attachment file
      const hasAttachment = expenseData.attachment instanceof File

      let requestOptions: RequestInit

      if (hasAttachment) {
        // Use FormData for file upload
        const formData = new FormData()

        // Add all fields to FormData
        if (expenseData.person_id) formData.append('person', expenseData.person_id)
        formData.append('expense_type', expenseData.expense_type)
        formData.append('category', expenseData.category)
        formData.append('amount', String(expenseData.amount))
        formData.append('currency', expenseData.currency)
        formData.append('due_date', expenseData.due_date)
        if (expenseData.payment_date) formData.append('payment_date', expenseData.payment_date)
        if (expenseData.recurrence) formData.append('recurrence', expenseData.recurrence)
        if (expenseData.description) formData.append('description', expenseData.description)
        if (expenseData.notes) formData.append('notes', expenseData.notes)
        // Add the file
        formData.append('attachment', expenseData.attachment)

        requestOptions = {
          method: 'POST',
          body: formData
        }
      } else {
        // Use JSON for non-file requests
        const backendData = {
          person: expenseData.person_id || null,
          expense_type: expenseData.expense_type,
          category: expenseData.category,
          amount: expenseData.amount,
          currency: expenseData.currency,
          due_date: expenseData.due_date,
          payment_date: expenseData.payment_date || null,
          recurrence: expenseData.recurrence || 'once',
          description: expenseData.description || null,
          notes: expenseData.notes || null,
        }

        requestOptions = {
          method: 'POST',
          body: JSON.stringify(backendData)
        }
      }

      await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSES, requestOptions)
      toast({
        title: 'Success',
        description: 'Expense added successfully'
      })
      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchPayables(),
        fetchExpenses()
      ])
    } catch (error) {
      console.error('Error adding expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Handle edit expense
  const handleEditExpense = async (id: string, expenseData: ExpenseFormData) => {
    try {
      // Check if there's an attachment file
      const hasAttachment = expenseData.attachment instanceof File

      let requestOptions: RequestInit

      if (hasAttachment) {
        // Use FormData for file upload
        const formData = new FormData()

        // Add all fields to FormData
        if (expenseData.person_id) formData.append('person', expenseData.person_id)
        formData.append('expense_type', expenseData.expense_type)
        formData.append('category', expenseData.category)
        formData.append('amount', String(expenseData.amount))
        formData.append('currency', expenseData.currency)
        formData.append('due_date', expenseData.due_date)
        if (expenseData.payment_date) formData.append('payment_date', expenseData.payment_date)
        if (expenseData.recurrence) formData.append('recurrence', expenseData.recurrence)
        if (expenseData.description) formData.append('description', expenseData.description)
        if (expenseData.notes) formData.append('notes', expenseData.notes)
        // Add the file
        formData.append('attachment', expenseData.attachment)

        requestOptions = {
          method: 'PUT',
          body: formData
        }
      } else {
        // Use JSON for non-file requests
        const backendData = {
          person: expenseData.person_id || null,
          expense_type: expenseData.expense_type,
          category: expenseData.category,
          amount: expenseData.amount,
          currency: expenseData.currency,
          due_date: expenseData.due_date,
          payment_date: expenseData.payment_date || null,
          recurrence: expenseData.recurrence || 'once',
          description: expenseData.description || null,
          notes: expenseData.notes || null,
        }

        requestOptions = {
          method: 'PUT',
          body: JSON.stringify(backendData)
        }
      }

      await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSE(id), requestOptions)
      toast({
        title: 'Success',
        description: 'Expense updated successfully'
      })
      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchPayables(),
        fetchExpenses()
      ])
    } catch (error) {
      console.error('Error updating expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to update expense',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Handle delete expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSE(id), {
        method: 'DELETE'
      })
      toast({
        title: 'Success',
        description: 'Expense deleted successfully'
      })
      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchPayables(),
        fetchExpenses()
      ])
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive'
      })
      throw error
    }
  }

  // Handle add recipe - uses React Query mutation with optimistic updates
  const handleAddRecipe = async (recipeData: RecipeFormData) => {
    // Trigger the mutation - this will:
    // 1. Immediately update the UI with optimistic data
    // 2. Show SweetAlert on success/error
    // 3. Refetch to sync with server
    createRecipeMutation.mutate(recipeData)

    // Also refresh dashboard data in background
    fetchDashboardData()
  }

  // Currency formatter with exchange rate conversion
  const formatCurrency = useCallback((amount: number, sourceCurrency?: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'CLP': '$',
      'BRL': 'R$',
      'ARS': '$'
    }

    // If source currency is provided and different from selected currency, convert
    let convertedAmount = amount
    if (sourceCurrency && sourceCurrency !== selectedCurrency) {
      convertedAmount = convertCurrency(amount, sourceCurrency, selectedCurrency)
    }

    const symbol = symbols[selectedCurrency] || selectedCurrency
    return `${symbol} ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [selectedCurrency, convertCurrency])

  // Calculate totals for display
  const totals = dashboardData ? {
    cashPosition: dashboardData.totals.cashPosition,
    totalReceivables: dashboardData.totals.totalReceivables,
    totalPayables: dashboardData.totals.totalPayables,
    netPosition: dashboardData.totals.netIncome,
    totalBankBalance: dashboardData.totals.totalBalance,
    totalPendingCommissions: dashboardData.commissions.pending,
  } : {
    cashPosition: 0,
    totalReceivables: 0,
    totalPayables: 0,
    netPosition: 0,
    totalBankBalance: 0,
    totalPendingCommissions: 0,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-muted-foreground">
          Manage income, expenses, receivables, and payables
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        {/* Start Date */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Currency */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Currency</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab
            totals={totals}
            formatCurrency={formatCurrency}
            dashboardData={dashboardData}
            loading={loading}
            selectedCurrency={selectedCurrency}
          />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <ReceivablesTab
            receivables={receivables}
            formatCurrency={formatCurrency}
            convertCurrency={convertCurrency}
            selectedCurrency={selectedCurrency}
            loading={loadingReceivables}
            onAddRecipe={() => setAddRecipeOpen(true)}
          />
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          <PayablesTab
            payables={payables}
            expenses={expenses}
            formatCurrency={formatCurrency}
            convertCurrency={convertCurrency}
            selectedCurrency={selectedCurrency}
            loading={loading}
            onAddExpense={() => setAddExpenseOpen(true)}
            onEditExpense={(expense) => {
              setSelectedExpense(expense)
              setEditExpenseOpen(true)
            }}
            users={users}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab
            dashboardData={dashboardData}
            formatCurrency={formatCurrency}
            currency={selectedCurrency}
            startDate={startDate}
            endDate={endDate}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Expense Dialogs */}
      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        onSave={handleAddExpense}
        users={users}
        loadingUsers={loadingUsers}
      />

      <EditExpenseDialog
        open={editExpenseOpen}
        onOpenChange={setEditExpenseOpen}
        expense={selectedExpense}
        onSave={handleEditExpense}
        onDelete={handleDeleteExpense}
        users={users}
        loadingUsers={loadingUsers}
      />

      {/* Recipe Dialog */}
      <AddRecipeDialog
        open={addRecipeOpen}
        onOpenChange={setAddRecipeOpen}
        onSave={handleAddRecipe}
        bookings={bookings}
        loadingBookings={loadingBookings}
      />
    </div>
  )
}

export default FinancialPage
