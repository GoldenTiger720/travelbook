import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Package,
  Receipt,
  ChevronRight,
  ShoppingCart,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  workflowData: any
  receivablesWithInstallments: any[]
  payablesWithWorkflow: any[]
  cashFlowForecast: any[]
  scenarioData: any
  selectedScenario: 'base' | 'optimistic' | 'pessimistic'
  setSelectedScenario: (value: 'base' | 'optimistic' | 'pessimistic') => void
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  totals,
  formatCurrency,
  workflowData,
  receivablesWithInstallments,
  payablesWithWorkflow,
  cashFlowForecast,
  scenarioData,
  selectedScenario,
  setSelectedScenario,
}) => {
  // KPI Card Component
  const KPICard = ({ title, value, change, icon: Icon, color, subtitle }: any) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <h2 className="text-lg sm:text-2xl font-bold truncate">{value}</h2>
              {change && (
                <span className={cn(
                  "text-xs font-medium flex items-center",
                  change > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn("p-2 sm:p-3 rounded-full", color)}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Cash Position"
          value={formatCurrency(totals.cashPosition)}
          change={12.5}
          icon={Wallet}
          color="bg-green-500"
          subtitle="All accounts"
        />
        <KPICard
          title="Receivables"
          value={formatCurrency(totals.totalReceivables)}
          change={5.2}
          icon={DollarSign}
          color="bg-blue-500"
          subtitle="Outstanding"
        />
        <KPICard
          title="Payables"
          value={formatCurrency(totals.totalPayables)}
          change={-3.1}
          icon={CreditCard}
          color="bg-red-500"
          subtitle="Due"
        />
        <KPICard
          title="Net Position"
          value={formatCurrency(totals.netPosition)}
          change={8.5}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="Current"
        />
        <KPICard
          title="Bank Balance"
          value={formatCurrency(totals.totalBankBalance)}
          change={3.2}
          icon={Building}
          color="bg-indigo-500"
          subtitle="Total"
        />
        <KPICard
          title="Commissions"
          value={formatCurrency(totals.totalPendingCommissions)}
          change={15.3}
          icon={Users}
          color="bg-orange-500"
          subtitle="Pending"
        />
      </div>

      {/* Workflow Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Workflow Pipeline</CardTitle>
          <CardDescription className="text-xs sm:text-sm">End-to-end financial workflow status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quotation to Revenue Pipeline */}
            <div>
              <h4 className="text-sm font-medium mb-2">Revenue Pipeline</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-blue-100 p-2 rounded">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Quotations</p>
                    <p className="text-xs text-muted-foreground">{workflowData.quotations.length} active</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-green-100 p-2 rounded">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Reservations</p>
                    <p className="text-xs text-muted-foreground">{workflowData.reservations.length} confirmed</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-yellow-100 p-2 rounded">
                    <Receipt className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Receivables</p>
                    <p className="text-xs text-muted-foreground">{receivablesWithInstallments.length} pending</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-purple-100 p-2 rounded">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Payments</p>
                    <p className="text-xs text-muted-foreground">12 received</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Purchase Pipeline */}
            <div>
              <h4 className="text-sm font-medium mb-2">Purchase Pipeline</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-orange-100 p-2 rounded">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Purchase Orders</p>
                    <p className="text-xs text-muted-foreground">8 active</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-red-100 p-2 rounded">
                    <CreditCard className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Payables</p>
                    <p className="text-xs text-muted-foreground">{payablesWithWorkflow.length} due</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-indigo-100 p-2 rounded">
                    <Send className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Payments</p>
                    <p className="text-xs text-muted-foreground">5 scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow and Scenario Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Cash Flow Forecast */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Cash Flow Forecast</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Forecast vs Actual with drill-down</CardDescription>
              </div>
              <Select value="monthly" onValueChange={() => {}}>
                <SelectTrigger className="w-24 sm:w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cashFlowForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="forecast" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="actual" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scenario Modeling */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Scenario Analysis</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Financial projections</CardDescription>
              </div>
              <Select value={selectedScenario} onValueChange={(value: any) => setSelectedScenario(value)}>
                <SelectTrigger className="w-28 sm:w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base Case</SelectItem>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Revenue</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(scenarioData[selectedScenario].revenue)}
                  </span>
                </div>
                <Progress value={100} className="h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Costs</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(scenarioData[selectedScenario].costs)}
                  </span>
                </div>
                <Progress 
                  value={(scenarioData[selectedScenario].costs / scenarioData[selectedScenario].revenue) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Net Profit</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(scenarioData[selectedScenario].profit)}
                  </span>
                </div>
                <Progress 
                  value={(scenarioData[selectedScenario].profit / scenarioData[selectedScenario].revenue) * 100} 
                  className="h-2 bg-blue-100"
                />
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit Margin</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {scenarioData[selectedScenario].margin}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts and Cost Centers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Bank Accounts */}
        <Card className="w-full">
          <CardHeader className="p-3 xs:p-4 sm:p-6">
            <CardTitle className="text-sm xs:text-base sm:text-lg">Bank Accounts</CardTitle>
            <CardDescription className="text-[10px] xs:text-xs sm:text-sm">Account balances and reconciliation status</CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="space-y-2 xs:space-y-3">
              {workflowData.bankAccounts.map((account: any) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      {account.type === 'cash' ? <Wallet className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.bank} • {account.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(account.balance, account.currency)}</p>
                    <Badge variant="outline" className="text-xs">
                      {account.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Centers */}
        <Card className="w-full">
          <CardHeader className="p-3 xs:p-4 sm:p-6">
            <CardTitle className="text-sm xs:text-base sm:text-lg">Cost Centers</CardTitle>
            <CardDescription className="text-[10px] xs:text-xs sm:text-sm">Budget utilization by department</CardDescription>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 sm:p-6">
            <div className="space-y-2 xs:space-y-3">
              {workflowData.costCenters.map((center: any) => (
                <div key={center.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{center.name}</p>
                      <p className="text-xs text-muted-foreground">{center.manager}</p>
                    </div>
                    <span className="text-xs font-medium">
                      {((center.spent / center.budget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(center.spent / center.budget) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Spent: {formatCurrency(center.spent)}</span>
                    <span>Budget: {formatCurrency(center.budget)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardTab