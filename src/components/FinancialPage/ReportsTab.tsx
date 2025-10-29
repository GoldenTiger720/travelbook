import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import type { FinancialDashboard } from '@/types/financial'

interface ReportsTabProps {
  dashboardData: FinancialDashboard | null
  formatCurrency: (amount: number, currency?: string) => string
  currency: string
  startDate: Date
  endDate: Date
  loading: boolean
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  dashboardData,
  formatCurrency,
  currency,
  startDate,
  endDate,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Period: {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
          </span>
          <span className="text-sm text-muted-foreground">({currency})</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profit & Loss Statement</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {format(startDate, 'MMMM dd, yyyy')} - {format(endDate, 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="font-semibold mb-3">Revenue</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Revenue</span>
                    <span className="text-sm font-medium">{formatCurrency(dashboardData.revenue.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid</span>
                    <span className="text-sm font-medium">{formatCurrency(dashboardData.revenue.paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <span className="text-sm font-medium">{formatCurrency(dashboardData.revenue.pending)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(dashboardData.revenue.total)}</span>
                  </div>
                </div>
                <div>
                  {dashboardData.revenue.byMethod.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboardData.revenue.byMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total"
                          nameKey="method"
                        >
                          {dashboardData.revenue.byMethod.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="font-semibold mb-3">Expenses</h3>
              <div className="space-y-2">
                {dashboardData.expenses.byCategory.map((category) => (
                  <div key={category.category} className="flex justify-between">
                    <span className="text-sm capitalize">{category.category.replace('-', ' ')}</span>
                    <span className="text-sm font-medium">{formatCurrency(category.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(dashboardData.expenses.total)}</span>
                </div>
              </div>
            </div>

            {/* Commissions Section */}
            <div>
              <h3 className="font-semibold mb-3">Commissions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Commissions</span>
                  <span className="text-sm font-medium">{formatCurrency(dashboardData.commissions.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Paid</span>
                  <span className="text-sm font-medium">{formatCurrency(dashboardData.commissions.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium">{formatCurrency(dashboardData.commissions.pending)}</span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="pt-4 border-t-2">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Net Income</span>
                <span className={`font-bold ${dashboardData.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardData.totals.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Monthly Trends</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Revenue vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="commissions" fill="#f59e0b" name="Commissions" />
                <Bar dataKey="netIncome" fill="#10b981" name="Net Income" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No monthly data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Accounts Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Bank Accounts</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Current account balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.accounts.length > 0 ? (
                dashboardData.accounts.map((account) => (
                  <div key={account.id}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium">{account.name}</span>
                        <p className="text-xs text-muted-foreground">{account.bank_name || account.account_type}</p>
                      </div>
                      <span className="text-lg font-bold">{formatCurrency(account.current_balance, account.currency)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No accounts configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Financial Health</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Revenue Collected</span>
                  <span className="text-lg font-bold">
                    {dashboardData.revenue.total > 0
                      ? `${((dashboardData.revenue.paid / dashboardData.revenue.total) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <Progress
                  value={dashboardData.revenue.total > 0 ? (dashboardData.revenue.paid / dashboardData.revenue.total) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Expense Ratio</span>
                  <span className="text-lg font-bold">
                    {dashboardData.revenue.total > 0
                      ? `${((dashboardData.expenses.total / dashboardData.revenue.total) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <Progress
                  value={dashboardData.revenue.total > 0 ? (dashboardData.expenses.total / dashboardData.revenue.total) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Profit Margin</span>
                  <span className={`text-lg font-bold ${
                    dashboardData.revenue.total > 0 && (dashboardData.totals.netIncome / dashboardData.revenue.total) >= 0.2
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {dashboardData.revenue.total > 0
                      ? `${((dashboardData.totals.netIncome / dashboardData.revenue.total) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <Progress
                  value={dashboardData.revenue.total > 0 ? Math.abs((dashboardData.totals.netIncome / dashboardData.revenue.total) * 100) : 0}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportsTab