// Financial Types and Interfaces

export type ExpenseType = 'fixed' | 'variable'

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
  name: string
  expense_type: ExpenseType
  category: ExpenseCategory
  description?: string
  amount: number
  currency: Currency
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  payment_date?: string
  due_date: string
  recurrence: Recurrence
  recurrence_end_date?: string
  vendor?: string
  vendor_id_number?: string
  invoice_number?: string
  receipt_file?: string
  department?: string
  notes?: string
  reference?: string
  requires_approval: boolean
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  is_overdue: boolean
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
  name: string
  vendor?: string
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
  name: string
  expense_type: ExpenseType
  category: ExpenseCategory
  description?: string
  amount: number
  currency: Currency
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  payment_date?: string
  due_date: string
  recurrence?: Recurrence
  recurrence_end_date?: string
  vendor?: string
  vendor_id_number?: string
  invoice_number?: string
  receipt_file?: File
  department?: string
  notes?: string
  reference?: string
  requires_approval?: boolean
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
