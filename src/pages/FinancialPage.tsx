import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from '@/components/FinancialPage/DashboardTab'
import OperationsTab from '@/components/FinancialPage/OperationsTab'
import ReceivablesTab from '@/components/FinancialPage/ReceivablesTab'
import PayablesTab from '@/components/FinancialPage/PayablesTab'
import ReportsTab from '@/components/FinancialPage/ReportsTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  GitBranch,
  Undo2,
  Shield,
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
  const [kanbanView, setKanbanView] = useState(false)
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
          <DashboardTab
            totals={totals}
            formatCurrency={formatCurrency}
            workflowData={workflowData}
            receivablesWithInstallments={receivablesWithInstallments}
            payablesWithWorkflow={payablesWithWorkflow}
            cashFlowForecast={cashFlowForecast}
            scenarioData={scenarioData}
            selectedScenario={selectedScenario}
            setSelectedScenario={setSelectedScenario}
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-4 sm:space-y-6">
          <OperationsTab
            kanbanView={kanbanView}
            setKanbanView={setKanbanView}
            receivablesWithInstallments={receivablesWithInstallments}
            payablesWithWorkflow={payablesWithWorkflow}
            workflowData={workflowData}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4 sm:space-y-6">
          <ReceivablesTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            receivablesWithInstallments={receivablesWithInstallments}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="payables" className="space-y-4 sm:space-y-6">
          <PayablesTab
            payablesWithWorkflow={payablesWithWorkflow}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6">
          <ReportsTab
            dateRange={dateRange}
            setDateRange={setDateRange}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            workflowData={workflowData}
            formatCurrency={formatCurrency}
          />
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