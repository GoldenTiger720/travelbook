import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Wallet,
  Building,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinancialDashboard } from '@/types/financial'

interface DashboardTabProps {
  totals: {
    cashPosition: number
    totalReceivables: number
    totalPayables: number
    netPosition: number
    totalBankBalance: number
    totalPendingCommissions: number
  }
  formatCurrency: (amount: number, currency?: string) => string
  dashboardData: FinancialDashboard | null
  loading: boolean
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  totals,
  formatCurrency,
  dashboardData,
  loading,
}) => {
  // KPI Card Component
  const KPICard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h2 className="text-2xl font-bold mt-2">{value}</h2>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const monthlyData = dashboardData?.monthlyData || []
  const expensesByCategory = dashboardData?.expenses.byCategory || []

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Cash Position"
          value={formatCurrency(totals.cashPosition)}
          icon={Wallet}
          color="bg-blue-500"
        />
        <KPICard
          title="Total Receivables"
          value={formatCurrency(totals.totalReceivables)}
          icon={CreditCard}
          color="bg-green-500"
        />
        <KPICard
          title="Total Payables"
          value={formatCurrency(totals.totalPayables)}
          icon={DollarSign}
          color="bg-orange-500"
        />
        <KPICard
          title="Net Position"
          value={formatCurrency(totals.netPosition)}
          icon={TrendingUp}
          color={totals.netPosition >= 0 ? "bg-green-500" : "bg-red-500"}
        />
        <KPICard
          title="Bank Balance"
          value={formatCurrency(totals.totalBankBalance)}
          icon={Building}
          color="bg-purple-500"
        />
        <KPICard
          title="Pending Commissions"
          value={formatCurrency(totals.totalPendingCommissions)}
          icon={Users}
          color="bg-pink-500"
        />
      </div>

      {/* Revenue & Expenses Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(dashboardData?.totals.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Expenses</span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(dashboardData?.totals.totalExpenses || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Commissions</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency(dashboardData?.totals.totalCommissions || 0)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Net Income</span>
                  <span className={cn(
                    "text-sm font-bold",
                    (dashboardData?.totals.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(dashboardData?.totals.netIncome || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold">Expense Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Fixed Expenses</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData?.expenses.fixed || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Variable Expenses</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData?.expenses.variable || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Revenue Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Paid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(dashboardData?.revenue.paid || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Pending</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(dashboardData?.revenue.pending || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold">Expense Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Paid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(dashboardData?.expenses.paid || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Pending</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(dashboardData?.expenses.pending || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Overdue</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(dashboardData?.expenses.overdue || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  name="Expenses"
                />
                <Area
                  type="monotone"
                  dataKey="netIncome"
                  stackId="3"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="Net Income"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.category}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Accounts */}
      {dashboardData?.accounts && dashboardData.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.bank_name} - {account.account_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {account.currency} {account.current_balance.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {account.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardTab
