import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Building2, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinancialDashboard } from "@/types/financial";

interface DashboardTabProps {
  totals: {
    cashPosition: number;
    totalReceivables: number;
    totalPayables: number;
    netPosition: number;
    totalBankBalance: number;
    totalPendingCommissions: number;
  };
  formatCurrency: (amount: number, currency?: string) => string;
  dashboardData: FinancialDashboard | null;
  loading: boolean;
  selectedCurrency: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  totals,
  formatCurrency,
  dashboardData,
  loading,
  selectedCurrency,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading financial data...
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = dashboardData?.monthlyData || [];

  // Calculate DVC totals (commissions + operator payments)
  const totalCommissions = dashboardData?.totals.totalCommissions || 0;
  const dvcExpenses = dashboardData?.expenses.dvc || 0;
  const totalDVC = totalCommissions + dvcExpenses;

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
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
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Net Income</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      (dashboardData?.totals.netIncome || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {formatCurrency(dashboardData?.totals.netIncome || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold">Expense Breakdown</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium">Total Fixed Cost (FC)</span>
                    <span className="font-medium">
                      {formatCurrency(dashboardData?.expenses.fc || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium">
                      Indirect Variable Cost (IVC)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(dashboardData?.expenses.ivc || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium">
                      Total Direct Variable Cost (DVC)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(totalDVC)}
                    </span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        • Sales Commission
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(totalCommissions)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        • Payment to Operator (Tour Cost)
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(dvcExpenses)}
                      </span>
                    </div>
                  </div>
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

      {/* Bank Accounts */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle>Bank Accounts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.accounts && dashboardData.accounts.length > 0 ? (
              dashboardData.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.bank_name} • {account.account_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {account.currency}{" "}
                      {account.current_balance.toLocaleString()}
                    </p>
                    {account.converted_balance !== null && account.converted_balance !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(account.converted_balance)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bank accounts registered yet.</p>
                <p className="text-sm mt-2">Add accounts in the Settings page.</p>
              </div>
            )}

            {dashboardData?.accounts && dashboardData.accounts.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Total Balance ({selectedCurrency})
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(totals.totalBankBalance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
