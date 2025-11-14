import React from "react"
import { format } from "date-fns"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TourBooking } from "@/types/tour"
import { usePaymentAccounts } from "@/lib/hooks/usePaymentAccounts"

interface PaymentDetailsProps {
  includePayment: boolean
  paymentDate: Date | undefined
  paymentMethod: string
  paymentPercentage: number
  amountPaid: number
  paymentComments: string
  paymentStatus: string
  receiptFile: File | null
  copyComments: boolean
  sendPurchaseOrder: boolean
  validUntilDate: Date | undefined
  quotationComments: string
  sendQuotationAccess: boolean
  customerEmail: string
  tourBookings: TourBooking[]
  currency: string
  isQuotationSaved: boolean
  createBookingMutation: { isPending: boolean }
  createBookingPaymentMutation: { isPending: boolean }
  onPaymentDateChange: (date: Date | undefined) => void
  onPaymentMethodChange: (method: string) => void
  onPaymentPercentageChange: (percentage: number) => void
  onAmountPaidChange: (amount: number) => void
  onPaymentCommentsChange: (comments: string) => void
  onPaymentStatusChange: (status: string) => void
  onReceiptFileChange: (file: File | null) => void
  onCopyCommentsChange: (value: boolean) => void
  onSendPurchaseOrderChange: (value: boolean) => void
  onValidUntilDateChange: (date: Date | undefined) => void
  onQuotationCommentsChange: (comments: string) => void
  onSendQuotationAccessChange: (value: boolean) => void
  onIncludePaymentChange: (value: boolean) => void
  onBookReservation: () => void
  getCurrencySymbol: (currency: string) => string
  calculateGrandTotal: () => number
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  includePayment,
  paymentDate,
  paymentMethod,
  paymentPercentage,
  amountPaid,
  paymentComments,
  paymentStatus,
  receiptFile,
  copyComments,
  sendPurchaseOrder,
  validUntilDate,
  quotationComments,
  sendQuotationAccess,
  customerEmail,
  tourBookings,
  currency,
  isQuotationSaved,
  createBookingMutation,
  createBookingPaymentMutation,
  onPaymentDateChange,
  onPaymentMethodChange,
  onPaymentPercentageChange,
  onAmountPaidChange,
  onPaymentCommentsChange,
  onPaymentStatusChange,
  onReceiptFileChange,
  onCopyCommentsChange,
  onSendPurchaseOrderChange,
  onValidUntilDateChange,
  onQuotationCommentsChange,
  onSendQuotationAccessChange,
  onIncludePaymentChange,
  onBookReservation,
  getCurrencySymbol,
  calculateGrandTotal
}) => {
  const { t } = useLanguage()
  const { paymentAccounts, loading: loadingPaymentAccounts } = usePaymentAccounts()

  return (
    <>
      {/* Payment Details Section - Only show when Include Payment is enabled */}
      {includePayment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('quotes.paymentDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Payment Date */}
              <div>
                <Label htmlFor="payment-date" className="text-sm font-medium">
                  {t('quotes.paymentDate')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "dd/MM/yyyy") : t('quotes.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={onPaymentDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment-method" className="text-sm font-medium">
                  {t('quotes.paymentMethod')}
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={onPaymentMethodChange}
                  disabled={loadingPaymentAccounts}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingPaymentAccounts ? "Loading..." : t('quotes.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {loadingPaymentAccounts ? 'Loading...' : 'No payment accounts configured'}
                      </div>
                    ) : (
                      paymentAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.accountName}>
                          {account.accountName} ({account.currency})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Total Price */}
              <div>
                <Label className="text-sm font-medium">{t('quotes.totalPrice')} {getCurrencySymbol(currency)}</Label>
                <div className="mt-1 p-2 bg-green-100 border rounded-md">
                  <span className="font-semibold">{calculateGrandTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Percentage */}
              <div>
                <Label htmlFor="payment-percentage" className="text-sm font-medium">{t('quotes.percentage')}</Label>
                <Input
                  id="payment-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={paymentPercentage}
                  onChange={(e) => {
                    const percentage = parseInt(e.target.value) || 0
                    onPaymentPercentageChange(percentage)
                    const totalAmount = calculateGrandTotal()
                    const calculatedAmount = Math.round((totalAmount * percentage) / 100)
                    onAmountPaidChange(calculatedAmount)
                  }}
                  className="mt-1"
                />
              </div>

              {/* Amount Paid */}
              <div>
                <Label htmlFor="amount-paid" className="text-sm font-medium">
                  {t('quotes.amountPaid')} {getCurrencySymbol(currency)}
                </Label>
                <Input
                  id="amount-paid"
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 0
                    onAmountPaidChange(amount)
                    const totalAmount = calculateGrandTotal()
                    if (totalAmount > 0) {
                      const calculatedPercentage = Math.round((amount / totalAmount) * 100)
                      onPaymentPercentageChange(calculatedPercentage)
                    }
                  }}
                  className="mt-1"
                />
              </div>

              {/* Amount Pending */}
              <div>
                <Label className="text-sm font-medium">{t('quotes.amountPending')} {getCurrencySymbol(currency)}</Label>
                <div className="mt-1 p-2 bg-gray-100 border rounded-md">
                  <span className="font-semibold text-red-600">
                    {(calculateGrandTotal() - amountPaid).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Receipt Upload */}
              <div>
                <Label htmlFor="receipt-upload" className="text-sm font-medium">{t('quotes.receipt')}</Label>
                <div className="mt-1">
                  <Input
                    id="receipt-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => onReceiptFileChange(e.target.files?.[0] || null)}
                    className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
                  />
                  {!receiptFile && (
                    <span className="text-xs text-gray-500">{t('quotes.noFileChosen')}</span>
                  )}
                </div>
              </div>

              {/* Payment Comments */}
              <div>
                <Label htmlFor="payment-comments" className="text-sm font-medium">{t('quotes.commentsOnPayment')}</Label>
                <Textarea
                  id="payment-comments"
                  rows={3}
                  className="mt-1"
                  placeholder={t('quotes.paymentCommentsPlaceholder')}
                  value={paymentComments}
                  onChange={(e) => onPaymentCommentsChange(e.target.value)}
                />
              </div>

              {/* Payment Status */}
              <div>
                <Label htmlFor="payment-status" className="text-sm font-medium">
                  {t('quotes.paymentStatus')}
                </Label>
                <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('quotes.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('quotes.pending')}</SelectItem>
                    <SelectItem value="partial">{t('quotes.partial')}</SelectItem>
                    <SelectItem value="paid">{t('quotes.paid')}</SelectItem>
                    <SelectItem value="refunded">{t('quotes.refunded')}</SelectItem>
                    <SelectItem value="cancelled">{t('quotes.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Options Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-payment" className="text-base font-medium">
                  {t('quotes.includePayment')}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="include-payment"
                    checked={includePayment}
                    onCheckedChange={onIncludePaymentChange}
                    className={includePayment ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                  />
                  <span className="text-sm font-medium min-w-[30px]">
                    {includePayment ? t('quotes.yes') : t('quotes.no')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="copy-comments" className="text-base font-medium">
                  {t('quotes.copyCommentsToOrder')}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="copy-comments"
                    checked={copyComments}
                    onCheckedChange={onCopyCommentsChange}
                    className={copyComments ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                  />
                  <span className="text-sm font-medium min-w-[30px]">
                    {copyComments ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-purchase-order" className="text-base font-medium">
                    {t('quotes.sendPurchaseOrderAccess')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="send-purchase-order"
                      checked={sendPurchaseOrder}
                      onCheckedChange={onSendPurchaseOrderChange}
                      className={sendPurchaseOrder ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {sendPurchaseOrder ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground ml-0">
                  {customerEmail || "admin@teampulse.com"}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={tourBookings.length === 0 || createBookingPaymentMutation.isPending || createBookingMutation.isPending}
                  onClick={onBookReservation}
                >
                  {(createBookingPaymentMutation.isPending || createBookingMutation.isPending) ? "Processing..." : t('quotes.reserve')}
                </Button>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${isQuotationSaved ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${isQuotationSaved ? 'bg-green-500' : 'bg-gray-400'}`}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className={`font-medium ${isQuotationSaved ? 'text-green-700' : 'text-gray-600'}`}>
                    {isQuotationSaved ? t('quotes.readyToBook') : 'Save quotation first'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="valid-until" className="text-base font-medium">
                    {t('quotes.validUntil')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !validUntilDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {validUntilDate ? format(validUntilDate, "dd/MM/yyyy") : t('quotes.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={validUntilDate}
                        onSelect={onValidUntilDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="quotation-comments" className="text-base font-medium">
                    {t('quotes.commentsOnQuotation')}
                  </Label>
                  <Textarea
                    id="quotation-comments"
                    rows={1}
                    className="mt-2 min-h-[40px] resize-none"
                    placeholder={t('quotes.quotationCommentsPlaceholder')}
                    value={quotationComments}
                    onChange={(e) => onQuotationCommentsChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-quotation-access" className="text-base font-medium">
                    {t('quotes.sendQuotationAccess')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="send-quotation-access"
                      checked={sendQuotationAccess}
                      onCheckedChange={onSendQuotationAccessChange}
                      className={sendQuotationAccess ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
                    />
                    <span className="text-sm font-medium min-w-[30px]">
                      {sendQuotationAccess ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground ml-0">
                  {customerEmail || "admin@teampulse.com"}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={tourBookings.length === 0 || createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? 'Saving...' : t('quotes.saveQuotation')}
                </Button>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${tourBookings.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${tourBookings.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className={`font-medium ${tourBookings.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                    {t('quotes.readyToQuote')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default PaymentDetails