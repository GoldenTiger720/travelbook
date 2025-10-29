import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Expense, ExpenseFormData, ExpenseType, ExpenseCategory, PaymentStatus, Currency, PaymentMethod, Recurrence } from '@/types/financial'

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSave: (id: string, expense: ExpenseFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const EditExpenseDialog = ({ open, onOpenChange, expense, onSave, onDelete }: EditExpenseDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dueDate, setDueDate] = useState<Date>()
  const [paymentDate, setPaymentDate] = useState<Date>()
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    expense_type: 'variable',
    category: 'other',
    amount: 0,
    currency: 'CLP',
    payment_status: 'pending',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    recurrence: 'once',
    requires_approval: false,
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        expense_type: expense.expense_type,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        payment_status: expense.payment_status,
        payment_method: expense.payment_method,
        payment_date: expense.payment_date,
        due_date: expense.due_date,
        recurrence: expense.recurrence,
        recurrence_end_date: expense.recurrence_end_date,
        vendor: expense.vendor,
        vendor_id_number: expense.vendor_id_number,
        invoice_number: expense.invoice_number,
        department: expense.department,
        notes: expense.notes,
        reference: expense.reference,
        requires_approval: expense.requires_approval,
      })
      setDueDate(expense.due_date ? new Date(expense.due_date) : undefined)
      setPaymentDate(expense.payment_date ? new Date(expense.payment_date) : undefined)
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expense) return

    setLoading(true)
    try {
      await onSave(expense.id, {
        ...formData,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : formData.due_date,
        payment_date: paymentDate ? format(paymentDate, 'yyyy-MM-dd') : undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expense || !confirm('Are you sure you want to delete this expense?')) return

    setDeleting(true)
    try {
      await onDelete(expense.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setDeleting(false)
    }
  }

  // Same options as AddExpenseDialog
  const expenseTypes: { value: ExpenseType; label: string }[] = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'variable', label: 'Variable' },
  ]

  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: 'salary', label: 'Salary' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'software', label: 'Software/Technology' },
    { value: 'professional-services', label: 'Professional Services' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'commission', label: 'Commission' },
    { value: 'other', label: 'Other' },
  ]

  const paymentStatuses: { value: PaymentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const currencies: { value: Currency; label: string }[] = [
    { value: 'CLP', label: 'CLP' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'BRL', label: 'BRL' },
    { value: 'ARS', label: 'ARS' },
  ]

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'debit-card', label: 'Debit Card' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' },
  ]

  const recurrences: { value: Recurrence; label: string }[] = [
    { value: 'once', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Same fields as AddExpenseDialog but with pre-filled values */}
            <div className="col-span-2">
              <Label htmlFor="name">Expense Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expense_type">Expense Type *</Label>
              <Select
                value={formData.expense_type}
                onValueChange={(value: ExpenseType) => setFormData({ ...formData, expense_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ExpenseCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Payment Status *</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value: PaymentStatus) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: PaymentMethod) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !paymentDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="vendor">Vendor/Supplier</Label>
              <Input
                id="vendor"
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number || ''}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Update Expense'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
