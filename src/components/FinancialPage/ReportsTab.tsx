import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts'
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { apiCall, API_ENDPOINTS } from '@/config/api'

interface ReportsTabProps {
  dashboardData: any
  formatCurrency: (amount: number, currency?: string) => string
  currency: string
  startDate: Date
  endDate: Date
  loading: boolean
}

interface IncomeStatementData {
  reportType: string
  periodType: string
  basis: string
  currency: string
  dateRange: {
    startDate: string
    endDate: string
  }
  periods: PeriodData[]
  totals: PeriodData
}

interface PeriodData {
  period?: string
  periodLabel?: string
  startDate?: string
  endDate?: string
  revenue: {
    total: number
    byMethod: { method: string; total: number; count: number }[]
  }
  costOfSales: {
    total: number
    directVariableCosts: number
  }
  grossProfit: number
  operatingExpenses: {
    total: number
    fixedCosts: number
    indirectVariableCosts: number
    commissions: number
    byCategory: { category: string; total: number; count: number }[]
  }
  operatingIncome: number
  expenses: {
    total: number
    byCategory: { category: string; total: number; count: number }[]
  }
  commissions: {
    total: number
  }
  netIncome: number
  profitMargin: number
}

interface CashFlowData {
  reportType: string
  periodType: string
  currency: string
  dateRange: {
    startDate: string
    endDate: string
  }
  openingBalance: number
  closingBalance: number
  summary: {
    totalInflows: number
    totalOutflows: number
    netCashFlow: number
    actualInflows: number
    actualOutflows: number
    projectedInflows: number
    projectedOutflows: number
  }
  periods: CashFlowPeriod[]
}

interface CashFlowPeriod {
  period: string
  periodLabel: string
  startDate: string
  endDate: string
  openingBalance: number
  closingBalance: number
  totalInflows: number
  totalOutflows: number
  netCashFlow: number
  isFuture: boolean
  inflows: CashFlowItem[]
  outflows: CashFlowItem[]
}

interface CashFlowItem {
  id: string
  type: string
  description: string
  amount: number
  originalAmount: number
  originalCurrency: string
  date: string
  status: 'actual' | 'projected'
  category: string
  person?: string
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  formatCurrency,
  currency,
  startDate,
  endDate,
  loading: parentLoading,
}) => {
  // Report state
  const [activeReport, setActiveReport] = useState<'income-statement' | 'cash-flow'>('income-statement')

  // Income Statement state
  const [incomeStatementData, setIncomeStatementData] = useState<IncomeStatementData | null>(null)
  const [incomeStatementLoading, setIncomeStatementLoading] = useState(false)
  const [plPeriodType, setPlPeriodType] = useState<'monthly' | 'annual'>('monthly')
  const [plBasis, setPlBasis] = useState<'accrual' | 'cash'>('accrual')

  // Cash Flow state
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  const [cashFlowLoading, setCashFlowLoading] = useState(false)
  const [cfPeriodType, setCfPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [includeProjections, setIncludeProjections] = useState(true)
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null)

  // Fetch Income Statement data
  const fetchIncomeStatement = useCallback(async () => {
    setIncomeStatementLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        periodType: plPeriodType,
        basis: plBasis,
        currency: currency,
      })
      const response = await apiCall(`${API_ENDPOINTS.FINANCIAL.INCOME_STATEMENT}?${params}`)
      if (response.ok) {
        const data = await response.json()
        setIncomeStatementData(data)
      }
    } catch (error) {
      console.error('Error fetching income statement:', error)
    } finally {
      setIncomeStatementLoading(false)
    }
  }, [startDate, endDate, plPeriodType, plBasis, currency])

  // Fetch Cash Flow data
  const fetchCashFlow = useCallback(async () => {
    setCashFlowLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        periodType: cfPeriodType,
        currency: currency,
        includeProjections: includeProjections.toString(),
      })
      const response = await apiCall(`${API_ENDPOINTS.FINANCIAL.CASH_FLOW}?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCashFlowData(data)
      }
    } catch (error) {
      console.error('Error fetching cash flow:', error)
    } finally {
      setCashFlowLoading(false)
    }
  }, [startDate, endDate, cfPeriodType, currency, includeProjections])

  // Fetch data when parameters change
  useEffect(() => {
    if (activeReport === 'income-statement') {
      fetchIncomeStatement()
    }
  }, [activeReport, fetchIncomeStatement])

  useEffect(() => {
    if (activeReport === 'cash-flow') {
      fetchCashFlow()
    }
  }, [activeReport, fetchCashFlow])

  const isLoading = parentLoading || incomeStatementLoading || cashFlowLoading

  if (isLoading && !incomeStatementData && !cashFlowData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  // Render Income Statement
  const renderIncomeStatement = () => {
    if (!incomeStatementData) return null

    const { periods, totals } = incomeStatementData

    // Prepare chart data
    const chartData = periods.map((period) => ({
      name: period.periodLabel,
      revenue: period.revenue.total,
      expenses: period.expenses.total,
      netIncome: period.netIncome,
      grossProfit: period.grossProfit,
    }))

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Period:</Label>
              <Select value={plPeriodType} onValueChange={(v: 'monthly' | 'annual') => setPlPeriodType(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Basis:</Label>
              <Select value={plBasis} onValueChange={(v: 'accrual' | 'cash') => setPlBasis(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accrual">Accrual</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.revenue.total)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.expenses.total)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className={`text-2xl font-bold ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.netIncome)}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${totals.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                  <DollarSign className={`h-6 w-6 ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className={`text-2xl font-bold ${totals.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${totals.profitMargin >= 20 ? 'bg-green-100' : totals.profitMargin >= 0 ? 'bg-yellow-100' : 'bg-red-100'} flex items-center justify-center`}>
                  {totals.profitMargin >= 0 ? (
                    <ArrowUpRight className={`h-6 w-6 ${totals.profitMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`} />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses Trend</CardTitle>
            <CardDescription>
              {plBasis === 'cash' ? 'Cash Basis' : 'Accrual Basis'} - {plPeriodType === 'monthly' ? 'Monthly' : 'Annual'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Line type="monotone" dataKey="netIncome" stroke="#8b5cf6" strokeWidth={2} name="Net Income" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No data available for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed P&L Table */}
        <Card>
          <CardHeader>
            <CardTitle>Income Statement Detail</CardTitle>
            <CardDescription>
              {format(startDate, 'MMMM dd, yyyy')} - {format(endDate, 'MMMM dd, yyyy')} ({plBasis === 'cash' ? 'Cash Basis' : 'Accrual Basis'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Account</TableHead>
                    {periods.map((period) => (
                      <TableHead key={period.period} className="text-right min-w-[120px]">
                        {period.periodLabel}
                      </TableHead>
                    ))}
                    <TableHead className="text-right min-w-[120px] font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Revenue */}
                  <TableRow className="bg-green-50 font-semibold">
                    <TableCell>Revenue</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.revenue.total)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{formatCurrency(totals.revenue.total)}</TableCell>
                  </TableRow>

                  {/* Cost of Sales */}
                  <TableRow>
                    <TableCell className="pl-6">Cost of Sales (DVC)</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right text-red-600">
                        ({formatCurrency(period.costOfSales.total)})
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-red-600">({formatCurrency(totals.costOfSales.total)})</TableCell>
                  </TableRow>

                  {/* Gross Profit */}
                  <TableRow className="bg-blue-50 font-semibold">
                    <TableCell>Gross Profit</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.grossProfit)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{formatCurrency(totals.grossProfit)}</TableCell>
                  </TableRow>

                  {/* Operating Expenses */}
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Operating Expenses</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.operatingExpenses.total)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{formatCurrency(totals.operatingExpenses.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Fixed Costs (FC)</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.operatingExpenses.fixedCosts)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{formatCurrency(totals.operatingExpenses.fixedCosts)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Indirect Variable Costs (IVC)</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.operatingExpenses.indirectVariableCosts)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{formatCurrency(totals.operatingExpenses.indirectVariableCosts)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Commissions</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.operatingExpenses.commissions)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{formatCurrency(totals.operatingExpenses.commissions)}</TableCell>
                  </TableRow>

                  {/* Operating Income */}
                  <TableRow className="bg-purple-50 font-semibold">
                    <TableCell>Operating Income</TableCell>
                    {periods.map((period) => (
                      <TableCell key={period.period} className="text-right">
                        {formatCurrency(period.operatingIncome)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{formatCurrency(totals.operatingIncome)}</TableCell>
                  </TableRow>

                  {/* Net Income */}
                  <TableRow className={`font-bold ${totals.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <TableCell>Net Income</TableCell>
                    {periods.map((period) => (
                      <TableCell
                        key={period.period}
                        className={`text-right ${period.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {formatCurrency(period.netIncome)}
                      </TableCell>
                    ))}
                    <TableCell className={`text-right ${totals.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(totals.netIncome)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {totals.expenses.byCategory.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <span className="capitalize">{cat.category.replace('-', ' ')}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${totals.expenses.total > 0 ? (cat.total / totals.expenses.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-24 text-right font-medium">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={totals.expenses.byCategory.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis dataKey="category" type="category" width={80} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render Cash Flow Statement
  const renderCashFlow = () => {
    if (!cashFlowData) return null

    const { periods, summary, openingBalance, closingBalance } = cashFlowData

    // Prepare chart data
    const chartData = periods.map((period) => ({
      name: period.periodLabel,
      inflows: period.totalInflows,
      outflows: -period.totalOutflows,
      netFlow: period.netCashFlow,
      balance: period.closingBalance,
      isFuture: period.isFuture,
    }))

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Period:</Label>
              <Select value={cfPeriodType} onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setCfPeriodType(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="projections"
                checked={includeProjections}
                onCheckedChange={setIncludeProjections}
              />
              <Label htmlFor="projections">Include Projections</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Opening Balance</p>
              <p className="text-xl font-bold">{formatCurrency(openingBalance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Inflows</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalInflows)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Outflows</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalOutflows)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              <p className={`text-xl font-bold ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netCashFlow)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Closing Balance</p>
              <p className={`text-xl font-bold ${closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(closingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projected vs Actual */}
        {includeProjections && (
          <Card>
            <CardHeader>
              <CardTitle>Actual vs Projected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Actual Inflows</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(summary.actualInflows)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Actual Outflows</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(summary.actualOutflows)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                  <p className="text-sm text-muted-foreground">Projected Inflows</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(summary.projectedInflows)}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
                  <p className="text-sm text-muted-foreground">Projected Outflows</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.projectedOutflows)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>
              Balance over time with inflows and outflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(Math.abs(Number(value)))} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="inflows" fill="#10b981" name="Inflows" />
                  <Bar yAxisId="left" dataKey="outflows" fill="#ef4444" name="Outflows" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="balance"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Balance"
                    dot={{ fill: '#8b5cf6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No data available for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Projection</CardTitle>
            <CardDescription>
              Projected cash balance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Cash Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Period Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Detail</CardTitle>
            <CardDescription>
              Click on a period to see transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Inflows</TableHead>
                  <TableHead className="text-right">Outflows</TableHead>
                  <TableHead className="text-right">Net Flow</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <React.Fragment key={period.period}>
                    <TableRow
                      className={`cursor-pointer hover:bg-muted/50 ${period.isFuture ? 'opacity-70' : ''} ${expandedPeriod === period.period ? 'bg-muted' : ''}`}
                      onClick={() => setExpandedPeriod(expandedPeriod === period.period ? null : period.period)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {period.periodLabel}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(period.openingBalance)}</TableCell>
                      <TableCell className="text-right text-green-600">+{formatCurrency(period.totalInflows)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(period.totalOutflows)}</TableCell>
                      <TableCell className={`text-right font-medium ${period.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {period.netCashFlow >= 0 ? '+' : ''}{formatCurrency(period.netCashFlow)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(period.closingBalance)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${period.isFuture ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {period.isFuture ? 'Projected' : 'Actual'}
                        </span>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Details */}
                    {expandedPeriod === period.period && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Inflows */}
                            <div>
                              <h4 className="font-semibold text-green-600 mb-2">Inflows ({period.inflows.length})</h4>
                              {period.inflows.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {period.inflows.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                      <div>
                                        <p className="text-sm font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">{item.date} - {item.category}</p>
                                      </div>
                                      <span className="text-green-600 font-medium">+{formatCurrency(item.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No inflows in this period</p>
                              )}
                            </div>
                            {/* Outflows */}
                            <div>
                              <h4 className="font-semibold text-red-600 mb-2">Outflows ({period.outflows.length})</h4>
                              {period.outflows.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {period.outflows.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                      <div>
                                        <p className="text-sm font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">{item.date} - {item.category}</p>
                                      </div>
                                      <span className="text-red-600 font-medium">-{formatCurrency(item.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No outflows in this period</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">
            {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')} ({currency})
          </p>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={(v) => setActiveReport(v as 'income-statement' | 'cash-flow')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="income-statement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Income Statement (P&L)
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income-statement" className="mt-6">
          {incomeStatementLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            renderIncomeStatement()
          )}
        </TabsContent>

        <TabsContent value="cash-flow" className="mt-6">
          {cashFlowLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            renderCashFlow()
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsTab
