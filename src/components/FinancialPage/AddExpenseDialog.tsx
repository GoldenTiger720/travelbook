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
import { Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { apiCall, API_ENDPOINTS } from '@/config/api'
import type { ExpenseFormData, ExpenseType, ExpenseCategory, Currency, Recurrence } from '@/types/financial'

interface FinancialCategory {
  id: string
  name: string
  description?: string
  is_active: boolean
}

interface User {
  id: string
  full_name: string
}

interface PaymentAccount {
  id: string
  accountName: string
  currency: string
}

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (expense: ExpenseFormData) => Promise<void>
  users?: User[]
  loadingUsers?: boolean
  paymentAccounts?: PaymentAccount[]
  loadingPaymentAccounts?: boolean
}

export const AddExpenseDialog = ({ open, onOpenChange, onSave, users = [], loadingUsers = false, paymentAccounts = [], loadingPaymentAccounts = false }: AddExpenseDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState<Date>()
  const [paymentDate, setPaymentDate] = useState<Date>()
  const [categories, setCategories] = useState<FinancialCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    person_id: '',
    expense_type: 'fc',
    category: 'other',
    amount: 0,
    currency: 'USD',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    recurrence: 'once',
  })

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await apiCall(API_ENDPOINTS.SETTINGS.CATEGORIES.LIST)
        const data = await response.json()
        // Handle paginated response
        const categoryList = data.results || data
        setCategories(categoryList.filter((cat: FinancialCategory) => cat.is_active))
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to empty array - will use hardcoded categories
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : formData.due_date,
        payment_date: paymentDate ? format(paymentDate, 'yyyy-MM-dd') : undefined,
        attachment: attachment || undefined,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        person_id: '',
        expense_type: 'fc',
        category: 'other',
        amount: 0,
        currency: 'USD',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        recurrence: 'once',
      })
      setDueDate(undefined)
      setPaymentDate(undefined)
      setAttachment(null)
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const expenseTypes: { value: ExpenseType; label: string }[] = [
    { value: 'fc', label: 'Fixed Cost (FC)' },
    { value: 'ivc', label: 'Indirect Variable Cost (IVC)' },
    { value: 'dvc', label: 'Direct Variable Cost (DVC)' },
  ]

  // Fallback hardcoded categories (used if backend fetch fails)
  const fallbackCategories: { value: ExpenseCategory; label: string }[] = [
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

  // Use backend categories if available, otherwise use fallback
  const displayCategories = categories.length > 0
    ? categories.map(cat => ({ value: cat.name.toLowerCase().replace(/\s+/g, '-'), label: cat.name }))
    : fallbackCategories

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'BRL', label: 'BRL - Brazilian Real' },
    { value: 'ARS', label: 'ARS - Argentine Peso' },
    { value: 'CLP', label: 'CLP - Chilean Peso' },
  ]

  const recurrences: { value: Recurrence; label: string }[] = [
    { value: 'once', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachment(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Person/User */}
            <div>
              <Label htmlFor="person_id">Person/User *</Label>
              <Select
                value={formData.person_id}
                onValueChange={(value) => setFormData({ ...formData, person_id: value })}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select person"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
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

            {/* Payment Date */}
            <div>
              <Label>Payment Date *</Label>
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

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Currency */}
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

            {/* Expense Type */}
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

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ExpenseCategory) => setFormData({ ...formData, category: value })}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurrence */}
            <div>
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value: Recurrence) => setFormData({ ...formData, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recurrences.map((rec) => (
                    <SelectItem key={rec.value} value={rec.value}>
                      {rec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Account */}
            <div>
              <Label htmlFor="payment_account">Payment Account</Label>
              <Select
                value={formData.payment_account || ''}
                onValueChange={(value) => setFormData({ ...formData, payment_account: value || undefined })}
                disabled={loadingPaymentAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPaymentAccounts ? "Loading accounts..." : "Select payment account"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attachment */}
            <div className="col-span-2">
              <Label htmlFor="attachment">Attachment</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachment')?.click()}
                  className="w-full justify-start"
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  {attachment ? attachment.name : 'Choose file...'}
                </Button>
                {attachment && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachment(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
