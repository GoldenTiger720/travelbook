import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, ArrowRight, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { BankTransferFormData, Currency } from '@/types/financial'

interface PaymentAccount {
  id: string
  accountName: string
  currency: string
}

interface AddTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: BankTransferFormData) => Promise<void>
  paymentAccounts: PaymentAccount[]
  loadingAccounts?: boolean
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
]

export const AddTransferDialog: React.FC<AddTransferDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  paymentAccounts,
  loadingAccounts = false,
}) => {
  const [loading, setLoading] = useState(false)
  const [transferDate, setTransferDate] = useState<Date>(new Date())
  const [receipt, setReceipt] = useState<File | null>(null)

  const [formData, setFormData] = useState<{
    source_account: string
    source_currency: Currency
    source_amount: string
    destination_account: string
    destination_currency: Currency
    destination_amount: string
    exchange_rate: string
    description: string
    reference_number: string
  }>({
    source_account: '',
    source_currency: 'USD',
    source_amount: '',
    destination_account: '',
    destination_currency: 'USD',
    destination_amount: '',
    exchange_rate: '1.000000',
    description: '',
    reference_number: '',
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        source_account: '',
        source_currency: 'USD',
        source_amount: '',
        destination_account: '',
        destination_currency: 'USD',
        destination_amount: '',
        exchange_rate: '1.000000',
        description: '',
        reference_number: '',
      })
      setTransferDate(new Date())
      setReceipt(null)
    }
  }, [open])

  // Auto-update currencies when accounts are selected
  useEffect(() => {
    if (formData.source_account) {
      const account = paymentAccounts.find((a) => a.id === formData.source_account)
      if (account) {
        setFormData((prev) => ({
          ...prev,
          source_currency: account.currency as Currency,
        }))
      }
    }
  }, [formData.source_account, paymentAccounts])

  useEffect(() => {
    if (formData.destination_account) {
      const account = paymentAccounts.find((a) => a.id === formData.destination_account)
      if (account) {
        setFormData((prev) => ({
          ...prev,
          destination_currency: account.currency as Currency,
        }))
      }
    }
  }, [formData.destination_account, paymentAccounts])

  // Auto-calculate destination amount when source amount or exchange rate changes
  useEffect(() => {
    const sourceAmount = parseFloat(formData.source_amount) || 0
    const exchangeRate = parseFloat(formData.exchange_rate) || 1

    if (sourceAmount > 0 && exchangeRate > 0) {
      const destinationAmount = sourceAmount * exchangeRate
      setFormData((prev) => ({
        ...prev,
        destination_amount: destinationAmount.toFixed(2),
      }))
    }
  }, [formData.source_amount, formData.exchange_rate])

  // Check if currencies are different
  const isCrossCurrency = formData.source_currency !== formData.destination_currency

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const transferData: BankTransferFormData = {
        source_account: formData.source_account,
        source_currency: formData.source_currency,
        source_amount: parseFloat(formData.source_amount),
        destination_account: formData.destination_account,
        destination_currency: formData.destination_currency,
        destination_amount: parseFloat(formData.destination_amount),
        exchange_rate: parseFloat(formData.exchange_rate),
        transfer_date: format(transferDate, 'yyyy-MM-dd'),
        description: formData.description || undefined,
        reference_number: formData.reference_number || undefined,
        status: 'completed',
        receipt: receipt || undefined,
      }

      await onSave(transferData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating transfer:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceipt(file)
    }
  }

  // Swap accounts
  const handleSwapAccounts = () => {
    setFormData((prev) => ({
      ...prev,
      source_account: prev.destination_account,
      source_currency: prev.destination_currency,
      destination_account: prev.source_account,
      destination_currency: prev.source_currency,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bank Transfer</DialogTitle>
          <DialogDescription>
            Record an account-to-account transfer for reconciliation purposes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source and Destination Accounts */}
          <div className="grid grid-cols-5 gap-4 items-end">
            {/* Source Account */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="source_account">Source Account *</Label>
              <Select
                value={formData.source_account}
                onValueChange={(value) => setFormData({ ...formData, source_account: value })}
              >
                <SelectTrigger id="source_account">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {loadingAccounts ? (
                    <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                  ) : (
                    paymentAccounts
                      .filter((a) => a.id !== formData.destination_account)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} ({account.currency})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSwapAccounts}
                disabled={!formData.source_account || !formData.destination_account}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Destination Account */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="destination_account">Destination Account *</Label>
              <Select
                value={formData.destination_account}
                onValueChange={(value) => setFormData({ ...formData, destination_account: value })}
              >
                <SelectTrigger id="destination_account">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {loadingAccounts ? (
                    <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                  ) : (
                    paymentAccounts
                      .filter((a) => a.id !== formData.source_account)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} ({account.currency})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amounts and Exchange Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source Amount */}
            <div className="space-y-2">
              <Label htmlFor="source_amount">Amount Withdrawn *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.source_currency}
                  onValueChange={(value) => setFormData({ ...formData, source_currency: value as Currency })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="source_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.source_amount}
                  onChange={(e) => setFormData({ ...formData, source_amount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">
                Exchange Rate
                {isCrossCurrency && <span className="text-amber-600 ml-1">*</span>}
              </Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="1.000000"
                value={formData.exchange_rate}
                onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                required={isCrossCurrency}
                className={isCrossCurrency ? 'border-amber-300' : ''}
              />
              {isCrossCurrency && (
                <p className="text-xs text-muted-foreground">
                  1 {formData.source_currency} = {formData.exchange_rate} {formData.destination_currency}
                </p>
              )}
            </div>

            {/* Destination Amount */}
            <div className="space-y-2">
              <Label htmlFor="destination_amount">Amount Deposited *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.destination_currency}
                  onValueChange={(value) => setFormData({ ...formData, destination_currency: value as Currency })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="destination_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.destination_amount}
                  onChange={(e) => setFormData({ ...formData, destination_amount: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transfer Date */}
            <div className="space-y-2">
              <Label>Transfer Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !transferDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transferDate ? format(transferDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={transferDate}
                    onSelect={(date) => date && setTransferDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference/Transaction Number</Label>
              <Input
                id="reference_number"
                placeholder="Bank reference or transaction ID"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description/Note</Label>
            <Textarea
              id="description"
              placeholder="Optional description or note for this transfer"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Attached Receipt</Label>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {receipt && (
              <p className="text-sm text-muted-foreground">
                Selected: {receipt.name}
              </p>
            )}
          </div>

          {/* Transfer Summary */}
          {formData.source_account && formData.destination_account && formData.source_amount && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transfer Summary</h4>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">
                    {paymentAccounts.find((a) => a.id === formData.source_account)?.accountName}
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    -{formData.source_currency} {parseFloat(formData.source_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-muted-foreground">To</p>
                  <p className="font-medium">
                    {paymentAccounts.find((a) => a.id === formData.destination_account)?.accountName}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    +{formData.destination_currency} {parseFloat(formData.destination_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {isCrossCurrency && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Exchange Rate: 1 {formData.source_currency} = {formData.exchange_rate} {formData.destination_currency}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.source_account || !formData.destination_account || !formData.source_amount}
            >
              {loading ? 'Creating...' : 'Create Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTransferDialog
