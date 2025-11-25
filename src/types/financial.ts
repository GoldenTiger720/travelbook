// Financial Types and Interfaces

export type ExpenseType = 'fixed' | 'variable' | 'fc' | 'ivc' | 'dvc'

export type ExpenseCategory =
  | 'salary'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'supplies'
  | 'transportation'
  | 'insurance'
  | 'maintenance'
  | 'software'
  | 'professional-services'
  | 'taxes'
  | 'commission'
  | 'other'

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export type Currency = 'CLP' | 'USD' | 'EUR' | 'BRL' | 'ARS'

// PaymentMethod is now dynamic - loaded from bank accounts in Settings
export type PaymentMethod = string

export type Recurrence =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit-card'
  | 'investment'
  | 'other'

export interface Expense {
  id: string
  person_id?: string
  person_name?: string
  expense_type: ExpenseType
  cost_type?: string
  category: ExpenseCategory
  description?: string
  amount: number
  currency: Currency
  due_date: string
  payment_date?: string
  payment_account_id?: string
  payment_account_name?: string
  recurrence: Recurrence
  attachment?: string
  notes?: string
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  is_overdue: boolean
  payment_status: PaymentStatus // Derived from payment_date and due_date
  is_recurring?: boolean // Whether this expense is part of a recurring series
  recurring_count?: number // Number of related recurring expenses
}

export interface FinancialAccount {
  id: string
  name: string
  account_type: AccountType
  bank_name?: string
  account_number?: string
  currency: Currency
  initial_balance: number
  current_balance: number
  converted_balance?: number | null
  is_active: boolean
  notes?: string
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
}

export interface Receivable {
  id: number
  bookingId: string
  customerName: string
  amount: number
  currency: Currency
  dueDate: string
  status: string
  method: string
  percentage: number
}

export interface PayableExpense {
  id: string
  person_name?: string
  amount: number
  currency: Currency
  dueDate: string
  status: PaymentStatus
  category: ExpenseCategory
  expenseType: ExpenseType
}

export interface PayableCommission {
  id: string
  bookingId?: string
  salesperson: string
  amount: number
  currency: Currency
  status: string
  percentage: number
}

export interface Payables {
  expenses: PayableExpense[]
  commissions: PayableCommission[]
}

export interface RevenueByMethod {
  method: string
  total: number
  count: number
}

export interface ExpenseByCategory {
  category: ExpenseCategory
  total: number
  count: number
}

export interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  commissions: number
  netIncome: number
}

export interface FinancialDashboard {
  totals: {
    totalRevenue: number
    totalExpenses: number
    totalCommissions: number
    netIncome: number
    cashPosition: number
    totalBalance: number
    totalReceivables: number
    totalPayables: number
  }
  revenue: {
    total: number
    pending: number
    paid: number
    byMethod: RevenueByMethod[]
  }
  expenses: {
    total: number
    fixed: number
    variable: number
    fc: number
    ivc: number
    dvc: number
    pending: number
    paid: number
    overdue: number
    byCategory: ExpenseByCategory[]
  }
  commissions: {
    total: number
    pending: number
    paid: number
  }
  accounts: FinancialAccount[]
  monthlyData: MonthlyData[]
  dateRange: {
    startDate: string
    endDate: string
  }
  currency: string
}

export interface ExpenseSummary {
  totalPending: number
  totalPaid: number
  totalOverdue: number
  fixedExpenses: number
  variableExpenses: number
  byCategory: ExpenseByCategory[]
}

// Form data types for creating/updating
export interface ExpenseFormData {
  person_id?: string
  expense_type: ExpenseType
  category: ExpenseCategory
  description?: string
  amount: number
  currency: Currency
  due_date: string
  payment_date?: string
  payment_account?: string
  recurrence?: Recurrence
  attachment?: File
  notes?: string
}

export interface AccountFormData {
  name: string
  account_type: AccountType
  bank_name?: string
  account_number?: string
  currency: Currency
  initial_balance: number
  current_balance: number
  is_active: boolean
  notes?: string
}

// Bank Transfer Types
export type TransferStatus = 'pending' | 'completed' | 'cancelled'

export interface BankTransfer {
  id: string
  source_account: string
  source_account_id: string
  source_account_name: string
  source_currency: Currency
  source_amount: number
  destination_account: string
  destination_account_id: string
  destination_account_name: string
  destination_currency: Currency
  destination_amount: number
  exchange_rate: number
  transfer_date: string
  description?: string
  reference_number?: string
  status: TransferStatus
  receipt?: string
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  is_cross_currency: boolean
}

export interface BankTransferFormData {
  source_account: string
  source_currency: Currency
  source_amount: number
  destination_account: string
  destination_currency: Currency
  destination_amount: number
  exchange_rate: number
  transfer_date: string
  description?: string
  reference_number?: string
  status?: TransferStatus
  receipt?: File
}

// Bank Statement Types
export type TransactionType = 'expense' | 'payment' | 'transfer'
export type TransactionDirection = 'incoming' | 'outgoing'

export interface BankTransaction {
  id: string
  type: TransactionType
  direction: TransactionDirection
  date: string
  description: string
  amount: number
  currency: Currency
  reference: string
  account_id?: string
  account_name?: string
  category?: string
  person_name?: string
  created_by?: string
  status: string
  // Optional fields for specific transaction types
  booking_id?: string
  method?: string
  destination_account_id?: string
  destination_account_name?: string
  source_account_id?: string
  source_account_name?: string
  exchange_rate?: number
  destination_amount?: number
  source_amount?: number
}

export interface BankStatementSummary {
  totalIncoming: number
  totalOutgoing: number
  netChange: number
  transactionCount: number
}

export interface BankStatementAccount {
  id: string
  name: string
  currency: Currency
}

export interface BankStatement {
  account: BankStatementAccount | null
  dateRange: {
    startDate: string
    endDate: string
  }
  summary: BankStatementSummary
  transactions: BankTransaction[]
}
