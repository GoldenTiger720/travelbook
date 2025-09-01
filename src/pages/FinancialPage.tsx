import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  CalendarIcon,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Building,
  Users,
  Package,
  Globe,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calculator,
  PieChart as PieChartIcon,
  Activity,
  Target,
  AlertTriangle,
  FileBarChart,
  Settings,
  MoreVertical,
  X,
  Check,
  Info,
  FileSpreadsheet,
  Ban,
  Undo2,
  BookOpen,
  Briefcase,
  Home,
  Layers,
  Link2,
  Lock,
  Unlock,
  Mail,
  MapPin,
  Menu,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  Move,
  Navigation,
  PauseCircle,
  PlayCircle,
  Printer,
  Save,
  Send,
  Shield,
  ShoppingCart,
  Sliders,
  Smartphone,
  Star,
  Sun,
  Tag,
  Trash,
  User,
  UserCheck,
  UserX,
  Volume2,
  Zap,
  Archive,
  BarChart3,
  Database,
  GitBranch,
  Hash,
  Inbox,
  List,
  LogOut,
  MessageSquare,
  Percent,
  Phone,
  Power,
  Repeat,
  RotateCw,
  Share2,
  Shuffle,
  Sidebar,
  Table2,
  Terminal,
  ToggleLeft,
  ToggleRight,
  TrendingFlat,
  Type,
  Umbrella,
  Video,
  Wifi,
  XCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, differenceInDays, parseISO, isAfter, isBefore, startOfYear, endOfYear } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

// Workflow statuses
const WORKFLOW_STATUSES = {
  quotation: ['draft', 'sent', 'approved', 'rejected', 'expired'],
  reservation: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
  receivable: ['pending', 'invoiced', 'overdue', 'paid', 'written-off'],
  payable: ['pending', 'approved', 'scheduled', 'paid', 'cancelled'],
  po: ['draft', 'approved', 'sent', 'received', 'completed', 'cancelled'],
  payment: ['pending', 'processing', 'completed', 'failed', 'refunded'],
  commission: ['calculated', 'pending', 'approved', 'paid', 'disputed'],
  reconciliation: ['pending', 'in-progress', 'matched', 'unmatched', 'resolved'],
}

// Mock data for complete workflow
const workflowData = {
  quotations: [
    { id: 'Q-2024-001', client: 'ABC Corporation', amount: 45000, currency: 'USD', status: 'approved', created: '2024-11-28', reservationId: null },
    { id: 'Q-2024-002', client: 'XYZ Travel', amount: 32000, currency: 'BRL', status: 'sent', created: '2024-11-29', reservationId: null },
  ],
  reservations: [
    { id: 'RES-2024-1234', quotationId: 'Q-2024-001', client: 'ABC Corporation', tour: 'Patagonia Adventure', amount: 45000, currency: 'USD', status: 'confirmed', date: '2024-12-15', commission: 4500 },
    { id: 'RES-2024-1235', quotationId: null, client: 'Direct Booking Ltd', tour: 'Wine Tour', amount: 12000, currency: 'EUR', status: 'pending', date: '2024-12-18', commission: 1200 },
  ],
  bankAccounts: [
    { id: 'BA001', name: 'Main Operating Account', bank: 'Banco do Brasil', currency: 'BRL', balance: 450000, type: 'checking' },
    { id: 'BA002', name: 'USD Account', bank: 'Citibank', currency: 'USD', balance: 125000, type: 'savings' },
    { id: 'BA003', name: 'Petty Cash', bank: 'Internal', currency: 'BRL', balance: 5000, type: 'cash' },
  ],
  chartOfAccounts: [
    { code: '1000', name: 'Assets', type: 'asset', parent: null },
    { code: '1100', name: 'Current Assets', type: 'asset', parent: '1000' },
    { code: '1110', name: 'Cash and Bank', type: 'asset', parent: '1100' },
    { code: '1120', name: 'Accounts Receivable', type: 'asset', parent: '1100' },
    { code: '2000', name: 'Liabilities', type: 'liability', parent: null },
    { code: '2100', name: 'Current Liabilities', type: 'liability', parent: '2000' },
    { code: '2110', name: 'Accounts Payable', type: 'liability', parent: '2100' },
    { code: '3000', name: 'Revenue', type: 'revenue', parent: null },
    { code: '3100', name: 'Tour Revenue', type: 'revenue', parent: '3000' },
    { code: '4000', name: 'Expenses', type: 'expense', parent: null },
    { code: '4100', name: 'Operating Expenses', type: 'expense', parent: '4000' },
  ],
  costCenters: [
    { id: 'CC001', name: 'Sales Department', budget: 150000, spent: 89000, manager: 'John Silva' },
    { id: 'CC002', name: 'Operations', budget: 200000, spent: 145000, manager: 'Maria Santos' },
    { id: 'CC003', name: 'Marketing', budget: 80000, spent: 62000, manager: 'Pedro Costa' },
    { id: 'CC004', name: 'Administration', budget: 60000, spent: 48000, manager: 'Ana Martinez' },
  ],
  auditLog: [
    { id: 1, user: 'admin@travel.com', action: 'CREATE', entity: 'Invoice', entityId: 'INV-2024-089', timestamp: '2024-12-01 10:23:45', details: 'Created invoice for ABC Corporation' },
    { id: 2, user: 'finance@travel.com', action: 'APPROVE', entity: 'Payment', entityId: 'PAY-2024-156', timestamp: '2024-12-01 11:15:22', details: 'Approved payment to supplier' },
    { id: 3, user: 'sales@travel.com', action: 'UPDATE', entity: 'Commission', entityId: 'COM-2024-045', timestamp: '2024-12-01 14:30:10', details: 'Updated commission rate from 10% to 12%' },
  ],
  reconciliations: [
    { id: 'REC001', account: 'BA001', period: '2024-11', status: 'matched', bankBalance: 450000, systemBalance: 450000, difference: 0, items: 145 },
    { id: 'REC002', account: 'BA002', period: '2024-11', status: 'unmatched', bankBalance: 125000, systemBalance: 123500, difference: 1500, items: 89 },
  ],
  refunds: [
    { id: 'REF001', reservationId: 'RES-2024-1230', client: 'Global Tours', amount: 8500, currency: 'USD', reason: 'Flight cancellation', status: 'approved', fee: 850, date: '2024-11-25' },
    { id: 'REF002', reservationId: 'RES-2024-1232', client: 'Adventure Co', amount: 3200, currency: 'EUR', reason: 'Customer request', status: 'pending', fee: 480, date: '2024-11-28' },
  ],
}

// Exchange rates with history
const exchangeRateHistory = {
  '2024-11': { USD: { BRL: 5.02, EUR: 0.92, ARS: 1015 }, BRL: { USD: 0.199, EUR: 0.183, ARS: 202 }, EUR: { USD: 1.087, BRL: 5.46, ARS: 1105 }, ARS: { USD: 0.000985, BRL: 0.00495, EUR: 0.000905 } },
  '2024-12': { USD: { BRL: 5.05, EUR: 0.92, ARS: 1020 }, BRL: { USD: 0.198, EUR: 0.182, ARS: 202 }, EUR: { USD: 1.089, BRL: 5.50, ARS: 1110 }, ARS: { USD: 0.00098, BRL: 0.00495, EUR: 0.00090 } },
}

// Cash flow forecast data
const cashFlowForecast = [
  { month: 'Jan', forecast: 150000, actual: 145000, variance: -5000, receipts: 180000, payments: 35000 },
  { month: 'Feb', forecast: 180000, actual: 182000, variance: 2000, receipts: 220000, payments: 38000 },
  { month: 'Mar', forecast: 220000, actual: 215000, variance: -5000, receipts: 260000, payments: 45000 },
  { month: 'Apr', forecast: 250000, actual: 248000, variance: -2000, receipts: 290000, payments: 42000 },
  { month: 'May', forecast: 280000, actual: 285000, variance: 5000, receipts: 325000, payments: 40000 },
  { month: 'Jun', forecast: 320000, actual: 318000, variance: -2000, receipts: 360000, payments: 42000 },
]

// Scenario modeling data
const scenarioData = {
  base: { revenue: 1400000, costs: 1080000, profit: 320000, margin: 22.8 },
  optimistic: { revenue: 1680000, costs: 1188000, profit: 492000, margin: 29.3 },
  pessimistic: { revenue: 1120000, costs: 972000, profit: 148000, margin: 13.2 },
}

// Receivables data with installments
const receivablesWithInstallments = [
  { 
    id: 'AR001', 
    client: 'ABC Corporation', 
    reservationId: 'RES-2024-1234',
    totalAmount: 45000, 
    currency: 'USD', 
    installments: [
      { id: 1, amount: 15000, dueDate: '2024-12-10', status: 'paid', paidDate: '2024-12-08' },
      { id: 2, amount: 15000, dueDate: '2024-12-20', status: 'pending', paidDate: null },
      { id: 3, amount: 15000, dueDate: '2025-01-10', status: 'pending', paidDate: null },
    ]
  },
  {
    id: 'AR002',
    client: 'XYZ Travel Group',
    reservationId: 'RES-2024-1235',
    totalAmount: 18500,
    currency: 'BRL',
    installments: [
      { id: 1, amount: 9250, dueDate: '2024-12-05', status: 'overdue', paidDate: null },
      { id: 2, amount: 9250, dueDate: '2024-12-25', status: 'pending', paidDate: null },
    ]
  },
]

// Payables with approval workflow
const payablesWithWorkflow = [
  {
    id: 'AP001',
    supplier: 'Hotel Paradise',
    poNumber: 'PO-2024-089',
    reservationId: 'RES-2024-1234',
    amount: 15000,
    currency: 'USD',
    dueDate: '2024-12-18',
    status: 'approved',
    approvalFlow: [
      { level: 1, approver: 'manager@travel.com', status: 'approved', date: '2024-11-28 10:00' },
      { level: 2, approver: 'finance@travel.com', status: 'approved', date: '2024-11-28 14:30' },
    ],
    attachments: ['invoice_hotel_paradise.pdf', 'po_089.pdf'],
  },
]

// Commission rules and calculations
const commissionRules = [
  { id: 'CR001', agent: 'John Silva', product: 'Tours', basis: 'revenue', rate: 10, threshold: 100000, bonus: 2 },
  { id: 'CR002', agent: 'Maria Santos', product: 'Hotels', basis: 'margin', rate: 15, threshold: 50000, bonus: 3 },
  { id: 'CR003', agent: 'Team', product: 'All', basis: 'revenue', rate: 5, threshold: 500000, bonus: 1, split: ['John Silva:40', 'Maria Santos:30', 'Pedro Costa:30'] },
]

const FinancialPage = () => {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [selectedCurrency, setSelectedCurrency] = useState('BRL')
  const [viewMode, setViewMode] = useState<'accrual' | 'cash'>('accrual')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [selectedCostCenter, setSelectedCostCenter] = useState('all')
  const [kanbanView, setKanbanView] = useState(false)
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base')
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [reconciliationDialogOpen, setReconciliationDialogOpen] = useState(false)

  // Get current exchange rates
  const getCurrentExchangeRates = () => {
    const currentMonth = format(new Date(), 'yyyy-MM')
    return exchangeRateHistory[currentMonth as keyof typeof exchangeRateHistory] || exchangeRateHistory['2024-12']
  }

  const exchangeRates = getCurrentExchangeRates()

  const convertCurrency = (amount: number, from: string, to: string) => {
    if (from === to) return amount
    const rate = exchangeRates[from as keyof typeof exchangeRates]?.[to as keyof typeof exchangeRates.USD] || 1
    return amount * rate
  }

  const formatCurrency = (amount: number, currency: string = selectedCurrency) => {
    const symbols: { [key: string]: string } = {
      BRL: 'R$',
      USD: 'US$',
      EUR: '€',
      ARS: 'AR$',
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Calculate comprehensive totals
  const calculateComprehensiveTotals = () => {
    // Receivables calculation with installments
    const totalReceivables = receivablesWithInstallments.reduce((sum, item) => {
      const pendingAmount = item.installments
        .filter(inst => inst.status !== 'paid')
        .reduce((instSum, inst) => instSum + inst.amount, 0)
      return sum + convertCurrency(pendingAmount, item.currency, selectedCurrency)
    }, 0)

    // Payables calculation
    const totalPayables = payablesWithWorkflow.reduce((sum, item) => 
      sum + convertCurrency(item.amount, item.currency, selectedCurrency), 0
    )

    // Bank accounts total
    const totalBankBalance = workflowData.bankAccounts.reduce((sum, account) =>
      sum + convertCurrency(account.balance, account.currency, selectedCurrency), 0
    )

    // Pending commissions
    const totalPendingCommissions = commissionRules.reduce((sum, rule) => {
      // Mock calculation based on sales
      const sales = 120000 // Mock sales value
      const commission = sales * (rule.rate / 100)
      return sum + commission
    }, 0)

    const netPosition = totalReceivables - totalPayables
    const cashPosition = totalBankBalance + totalReceivables - totalPayables
    
    return { 
      totalReceivables, 
      totalPayables, 
      netPosition, 
      totalBankBalance,
      totalPendingCommissions,
      cashPosition 
    }
  }

  const totals = calculateComprehensiveTotals()

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

  // Kanban Card Component
  const KanbanCard = ({ item, type }: any) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'destructive' : 'default'}>
            {item.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h4 className="font-medium text-sm mb-1">{item.client || item.supplier}</h4>
        <p className="text-xs text-muted-foreground mb-2">{item.id}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{formatCurrency(item.amount || item.totalAmount, item.currency)}</span>
          <span className="text-xs text-muted-foreground">{item.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  )

  // Dashboard Tab with complete workflow integration
  const DashboardTab = () => (
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
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-green-100 p-2 rounded">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Reservations</p>
                    <p className="text-xs text-muted-foreground">{workflowData.reservations.length} confirmed</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-yellow-100 p-2 rounded">
                    <Receipt className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Receivables</p>
                    <p className="text-xs text-muted-foreground">{receivablesWithInstallments.length} pending</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
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
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-2 min-w-fit">
                  <div className="bg-red-100 p-2 rounded">
                    <CreditCard className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Payables</p>
                    <p className="text-xs text-muted-foreground">{payablesWithWorkflow.length} due</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Bank Accounts</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Account balances and reconciliation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowData.bankAccounts.map((account) => (
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Cost Centers</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Budget utilization by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowData.costCenters.map((center) => (
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

  // Operations Tab with Kanban View
  const OperationsTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={!kanbanView ? "default" : "outline"}
            size="sm"
            onClick={() => setKanbanView(false)}
          >
            <Table2 className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button
            variant={kanbanView ? "default" : "outline"}
            size="sm"
            onClick={() => setKanbanView(true)}
          >
            <Layers className="w-4 h-4 mr-2" />
            Kanban
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Due Dates
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {kanbanView ? (
        // Kanban View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {/* Pending Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Pending</h3>
              <Badge variant="secondary">8</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {receivablesWithInstallments.slice(0, 3).map((item) => (
                  <KanbanCard key={item.id} item={item} type="receivable" />
                ))}
                {payablesWithWorkflow.slice(0, 2).map((item) => (
                  <KanbanCard key={item.id} item={item} type="payable" />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* In Progress Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">In Progress</h3>
              <Badge variant="secondary">5</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {workflowData.reconciliations.map((item) => (
                  <Card key={item.id} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <Badge variant="default" className="mb-2">{item.status}</Badge>
                      <h4 className="font-medium text-sm mb-1">Reconciliation {item.id}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.account} • {item.period}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{item.items} items</span>
                        <span className="text-xs font-medium">
                          {item.difference === 0 ? 'Balanced' : formatCurrency(Math.abs(item.difference))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Review Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Review</h3>
              <Badge variant="secondary">3</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {workflowData.refunds.map((item) => (
                  <Card key={item.id} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <Badge variant="warning" className="mb-2">{item.status}</Badge>
                      <h4 className="font-medium text-sm mb-1">{item.client}</h4>
                      <p className="text-xs text-muted-foreground mb-2">Refund • {item.reason}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">{formatCurrency(item.amount, item.currency)}</span>
                        <span className="text-xs text-muted-foreground">Fee: {formatCurrency(item.fee, item.currency)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Completed Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Completed</h3>
              <Badge variant="secondary">12</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <Badge variant="success" className="mb-2">paid</Badge>
                    <h4 className="font-medium text-sm mb-1">Global Tours Ltd</h4>
                    <p className="text-xs text-muted-foreground mb-2">AR004 • Completed</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{formatCurrency(15000, 'EUR')}</span>
                      <span className="text-xs text-green-600">✓ Reconciled</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      ) : (
        // Table View
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Operations Queue</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All pending financial operations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[150px]">Entity</TableHead>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Due Date</TableHead>
                    <TableHead className="min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...receivablesWithInstallments, ...payablesWithWorkflow].map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.client ? 'Receivable' : 'Payable'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.client || item.supplier}</TableCell>
                      <TableCell>{formatCurrency(item.totalAmount || item.amount, item.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'paid' ? 'success' :
                          item.status === 'overdue' ? 'destructive' :
                          item.status === 'approved' ? 'default' :
                          'secondary'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.dueDate || 'N/A'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Process Payment</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Receivables Tab with Installments
  const ReceivablesTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 sm:w-64 h-8"
            />
          </div>
          <Select value="all">
            <SelectTrigger className="w-32 sm:w-40 h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Invoice ID</TableHead>
                  <TableHead className="min-w-[150px]">Client</TableHead>
                  <TableHead className="min-w-[120px]">Reservation</TableHead>
                  <TableHead className="min-w-[120px]">Total Amount</TableHead>
                  <TableHead className="min-w-[150px]">Installments</TableHead>
                  <TableHead className="min-w-[100px]">Next Due</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivablesWithInstallments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.client}</TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {item.reservationId}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.totalAmount, item.currency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.installments.map((inst) => (
                          <Badge
                            key={inst.id}
                            variant={
                              inst.status === 'paid' ? 'success' :
                              inst.status === 'overdue' ? 'destructive' :
                              'default'
                            }
                            className="text-xs"
                          >
                            {inst.id}/{item.installments.length}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.installments.find(i => i.status === 'pending')?.dueDate || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.installments.some(i => i.status === 'overdue') ? 'destructive' :
                        item.installments.every(i => i.status === 'paid') ? 'success' :
                        'default'
                      }>
                        {item.installments.some(i => i.status === 'overdue') ? 'overdue' :
                         item.installments.every(i => i.status === 'paid') ? 'paid' :
                         'partial'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Installments</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Record Payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Write Off</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Payables Tab with Approval Workflow
  const PayablesTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Bill ID</TableHead>
                  <TableHead className="min-w-[150px]">Supplier</TableHead>
                  <TableHead className="min-w-[120px]">PO Number</TableHead>
                  <TableHead className="min-w-[120px]">Reservation</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Due Date</TableHead>
                  <TableHead className="min-w-[150px]">Approval</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payablesWithWorkflow.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {item.poNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {item.reservationId}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.approvalFlow.map((approval, idx) => (
                          <Badge
                            key={idx}
                            variant={approval.status === 'approved' ? 'success' : 'default'}
                            className="text-xs"
                          >
                            L{approval.level}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'paid' ? 'success' :
                        item.status === 'approved' ? 'default' :
                        'secondary'
                      }>
                        {item.status}
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Attachments</DropdownMenuItem>
                          <DropdownMenuItem>Approve Payment</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Dispute</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Reconciliation Dialog
  const ReconciliationDialog = () => (
    <Dialog open={reconciliationDialogOpen} onOpenChange={setReconciliationDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bank Reconciliation</DialogTitle>
          <DialogDescription>
            Match bank transactions with system records
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Account Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bank Account</Label>
              <Select value="BA001">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workflowData.bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <Select value="2024-11">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reconciliation Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(450000)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(448500)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(1500)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unmatched Transactions */}
          <div>
            <h4 className="font-medium mb-2">Unmatched Transactions</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Bank Amount</TableHead>
                  <TableHead>System Match</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024-11-28</TableCell>
                  <TableCell>Wire Transfer - ABC Corp</TableCell>
                  <TableCell>{formatCurrency(15000)}</TableCell>
                  <TableCell>
                    <Select>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select match" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AR001">AR001 - ABC Corporation</SelectItem>
                        <SelectItem value="AR002">AR002 - ABC Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Match</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReconciliationDialogOpen(false)}>
            Cancel
          </Button>
          <Button>Complete Reconciliation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Audit Log Dialog
  const AuditLogDialog = () => (
    <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
          <DialogDescription>
            Complete history of all financial transactions and changes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search audit logs..." className="flex-1" />
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflowData.auditLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.action === 'DELETE' ? 'destructive' :
                      log.action === 'CREATE' ? 'success' :
                      log.action === 'APPROVE' ? 'default' :
                      'secondary'
                    }>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="font-medium">{log.entityId}</TableCell>
                  <TableCell className="text-xs">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Refunds and Cancellations Dialog
  const RefundDialog = () => (
    <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Calculate fees and process refund for cancelled reservation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Reservation</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select reservation" />
              </SelectTrigger>
              <SelectContent>
                {workflowData.reservations.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.id} - {res.client} ({res.tour})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Original Amount</Label>
              <Input value="45,000.00" disabled />
            </div>
            <div>
              <Label>Cancellation Fee (%)</Label>
              <Input type="number" defaultValue="10" />
            </div>
          </div>
          <div>
            <Label>Reason for Refund</Label>
            <Textarea placeholder="Enter reason for refund..." />
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Original Amount</span>
                  <span>{formatCurrency(45000, 'USD')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cancellation Fee (10%)</span>
                  <span>- {formatCurrency(4500, 'USD')}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Refund Amount</span>
                  <span>{formatCurrency(40500, 'USD')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
            Cancel
          </Button>
          <Button>Process Refund</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Reports Tab with comprehensive analytics
  const ReportsTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                    </>
                  ) : (
                    'Date range'
                  )}
                </span>
                <span className="sm:hidden">Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range: any) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-24 sm:w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accrual">Accrual</SelectItem>
              <SelectItem value="cash">Cash Basis</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-20 sm:w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profit & Loss Statement</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {viewMode === 'accrual' ? 'Accrual Basis' : 'Cash Basis'} - {format(dateRange.from!, 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue by Product/Service */}
            <div>
              <h3 className="font-semibold mb-3">Revenue by Product</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tour Packages</span>
                    <span className="text-sm font-medium">{formatCurrency(850000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accommodations</span>
                    <span className="text-sm font-medium">{formatCurrency(320000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transportation</span>
                    <span className="text-sm font-medium">{formatCurrency(180000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Services</span>
                    <span className="text-sm font-medium">{formatCurrency(50000)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(1400000)}</span>
                  </div>
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tours', value: 850000 },
                          { name: 'Hotels', value: 320000 },
                          { name: 'Transport', value: 180000 },
                          { name: 'Other', value: 50000 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Costs by Category */}
            <div>
              <h3 className="font-semibold mb-3">Costs & Expenses</h3>
              <div className="space-y-2">
                {workflowData.costCenters.map((center) => (
                  <div key={center.id} className="flex justify-between">
                    <span className="text-sm">{center.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(center.spent)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Costs</span>
                  <span>{formatCurrency(workflowData.costCenters.reduce((sum, c) => sum + c.spent, 0))}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-4 border-t-2">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Net Profit</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(1400000 - workflowData.costCenters.reduce((sum, c) => sum + c.spent, 0))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Currency Exposure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Currency Exposure</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Multi-currency risk analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={[
                { currency: 'USD', exposure: 45, risk: 30 },
                { currency: 'BRL', exposure: 60, risk: 20 },
                { currency: 'EUR', exposure: 35, risk: 25 },
                { currency: 'ARS', exposure: 25, risk: 45 },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="currency" />
                <PolarRadiusAxis />
                <Radar name="Exposure" dataKey="exposure" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Collection Metrics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">DSO and delinquency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Days Sales Outstanding (DSO)</span>
                  <span className="text-2xl font-bold">32</span>
                </div>
                <Progress value={32} max={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Collection Rate</span>
                  <span className="text-2xl font-bold">87%</span>
                </div>
                <Progress value={87} className="h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Delinquency Rate</span>
                  <span className="text-2xl font-bold text-red-600">8.5%</span>
                </div>
                <Progress value={8.5} className="h-2 bg-red-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Average Payment Delay</span>
                  <span className="text-2xl font-bold">5.2 days</span>
                </div>
                <Progress value={5.2} max={30} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Financial Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete financial system with multi-currency support
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setReconciliationDialogOpen(true)}>
            <GitBranch className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reconcile</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRefundDialogOpen(true)}>
            <Undo2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refund</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAuditDialogOpen(true)}>
            <Shield className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Audit</span>
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-6">
        <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-1">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="operations" className="text-xs sm:text-sm">Operations</TabsTrigger>
          <TabsTrigger value="receivables" className="text-xs sm:text-sm">Receivables</TabsTrigger>
          <TabsTrigger value="payables" className="text-xs sm:text-sm">Payables</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="operations" className="space-y-4 sm:space-y-6">
          <OperationsTab />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4 sm:space-y-6">
          <ReceivablesTab />
        </TabsContent>

        <TabsContent value="payables" className="space-y-4 sm:space-y-6">
          <PayablesTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ReconciliationDialog />
      <AuditLogDialog />
      <RefundDialog />
    </div>
  )
}

export default FinancialPage