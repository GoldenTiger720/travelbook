import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from '@/components/FinancialPage/DashboardTab'
import ReceivablesTab from '@/components/FinancialPage/ReceivablesTab'
import PayablesTab from '@/components/FinancialPage/PayablesTab'
import ReportsTab from '@/components/FinancialPage/ReportsTab'
import { AddExpenseDialog } from '@/components/FinancialPage/AddExpenseDialog'
import { EditExpenseDialog } from '@/components/FinancialPage/EditExpenseDialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import type {
  FinancialDashboard,
  Expense,
  ExpenseFormData,
  Receivable,
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
  const [selectedCurrency, setSelectedCurrency] = useState<string>('CLP')

  // Data state
  const [dashboardData, setDashboardData] = useState<FinancialDashboard | null>(null)
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [payables, setPayables] = useState<Payables>({ expenses: [], commissions: [] })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)

  // Dialog state
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [editExpenseOpen, setEditExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

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

  // Fetch receivables
  const fetchReceivables = async () => {
    try {
      const params = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
      const response = await apiCall(API_ENDPOINTS.FINANCIAL.RECEIVABLES + params)
      const data = await response.json()
      setReceivables(data)
    } catch (error) {
      console.error('Error fetching receivables:', error)
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

  // Load all data when date range or currency changes
  useEffect(() => {
    fetchDashboardData()
    fetchReceivables()
    fetchPayables()
    fetchExpenses()
  }, [startDate, endDate, selectedCurrency])

  // Handle add expense
  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSES, {
        method: 'POST',
        body: JSON.stringify(expenseData)
      })
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
      await apiCall(API_ENDPOINTS.FINANCIAL.EXPENSE(id), {
        method: 'PUT',
        body: JSON.stringify(expenseData)
      })
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

  // Currency formatter
  const formatCurrency = (amount: number, currency?: string) => {
    const curr = currency || selectedCurrency
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'CLP': '$',
      'BRL': 'R$',
      'ARS': '$'
    }
    return `${symbols[curr] || curr} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Manage income, expenses, receivables, and payables
          </p>
        </div>
        <Button onClick={() => setAddExpenseOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
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
              <SelectItem value="CLP">CLP - Chilean Peso</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
              <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
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
          />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <ReceivablesTab
            receivables={receivables}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="payables" className="space-y-4">
          <PayablesTab
            payables={payables}
            expenses={expenses}
            formatCurrency={formatCurrency}
            loading={loading}
            onAddExpense={() => setAddExpenseOpen(true)}
            onEditExpense={(expense) => {
              setSelectedExpense(expense)
              setEditExpenseOpen(true)
            }}
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
      />

      <EditExpenseDialog
        open={editExpenseOpen}
        onOpenChange={setEditExpenseOpen}
        expense={selectedExpense}
        onSave={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
    </div>
  )
}

export default FinancialPage
