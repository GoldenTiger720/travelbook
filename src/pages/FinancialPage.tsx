import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react"

// Mock financial data
const financialMetrics = [
  {
    title: "Total Revenue",
    value: "$127,450",
    change: "+12.5%",
    trend: "up",
    currency: "USD"
  },
  {
    title: "Pending Payments",  
    value: "$23,890",
    change: "-5.2%",  
    trend: "down",
    currency: "USD"
  },
  {
    title: "Commission Earned",
    value: "$15,680",
    change: "+8.7%",
    trend: "up", 
    currency: "USD"
  },
  {
    title: "Outstanding Invoices",
    value: "$7,320",
    change: "+2.1%",
    trend: "up",
    currency: "USD"
  }
]

const transactions = [
  {
    id: "T001",
    type: "income",
    description: "Payment from Maria González - Buenos Aires Tour",
    amount: "$2,450",
    currency: "USD",
    date: "2024-01-15",
    status: "completed"
  },
  {
    id: "T002", 
    type: "commission",
    description: "Agent Commission - João Silva Booking",
    amount: "$189",
    currency: "USD", 
    date: "2024-01-14",
    status: "pending"
  },
  {
    id: "T003",
    type: "expense",
    description: "Supplier Payment - Hotel Accommodation",
    amount: "$1,200",
    currency: "USD",
    date: "2024-01-13", 
    status: "completed"
  },
  {
    id: "T004",
    type: "income",
    description: "Quote Approval - Patagonia Adventure",
    amount: "$4,200", 
    currency: "USD",
    date: "2024-01-12",
    status: "completed"
  }
]

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "income": return <ArrowUpRight className="w-4 h-4 text-success" />
    case "expense": return <ArrowDownRight className="w-4 h-4 text-destructive" />
    case "commission": return <DollarSign className="w-4 h-4 text-accent" />
    default: return <CreditCard className="w-4 h-4 text-muted-foreground" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-success text-success-foreground"
    case "pending": return "bg-warning text-warning-foreground"
    case "failed": return "bg-destructive text-destructive-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

const FinancialPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">
            Track revenue, commissions, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <DollarSign className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center mt-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-success mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive mr-1" />
                )}
                <span className={`text-xs ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {metric.change} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Currency Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Currency Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Banknote className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">$89,450</div>
              <p className="text-sm text-muted-foreground">USD Balance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5">
              <Banknote className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">R$ 156,780</div>
              <p className="text-sm text-muted-foreground">BRL Balance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
              <Banknote className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">$4,890,320</div>
              <p className="text-sm text-muted-foreground">ARS Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-card to-muted flex items-center justify-center border">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.id}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`font-semibold ${
                      transaction.type === "income" || transaction.type === "commission" 
                        ? "text-success" 
                        : "text-destructive"
                    }`}>
                      {transaction.type === "expense" ? "-" : "+"}{transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.currency}</p>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialPage