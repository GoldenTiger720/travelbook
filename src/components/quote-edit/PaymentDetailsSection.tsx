import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface PaymentDetailsSectionProps {
  includePayment: boolean;
  currency: string;
  getCurrencySymbol: (currency: string) => string;
  calculateGrandTotal: () => number;
  paymentDate?: Date | undefined;
  paymentMethod: string;
  paymentPercentage: number;
  amountPaid: number;
  paymentComments: string;
  paymentStatus: string;
  receiptFile?: File | null;
  onPaymentDateChange: (date: Date | undefined) => void;
  onPaymentMethodChange: (method: string) => void;
  onPaymentPercentageChange: (percentage: number) => void;
  onAmountPaidChange: (amount: number) => void;
  onPaymentCommentsChange: (comments: string) => void;
  onPaymentStatusChange: (status: string) => void;
  onReceiptFileChange: (file: File | null) => void;
}

const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({
  includePayment,
  currency,
  getCurrencySymbol,
  calculateGrandTotal,
  paymentDate,
  paymentMethod,
  paymentPercentage,
  amountPaid,
  paymentComments,
  paymentStatus,
  receiptFile,
  onPaymentDateChange,
  onPaymentMethodChange,
  onPaymentPercentageChange,
  onAmountPaidChange,
  onPaymentCommentsChange,
  onPaymentStatusChange,
  onReceiptFileChange,
}) => {
  const { t } = useLanguage();

  if (!includePayment) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t("quotes.paymentDetails")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Payment Date */}
          <div>
            <Label htmlFor="payment-date" className="text-sm font-medium">
              {t("quotes.paymentDate")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "dd/MM/yyyy") : t("quotes.selectDate")}
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
            <Label
              htmlFor="payment-method"
              className="text-sm font-medium"
            >
              {t("quotes.paymentMethod")}
            </Label>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("quotes.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">
                  {t("quotes.creditCard")}
                </SelectItem>
                <SelectItem value="bank-transfer">
                  {t("quotes.bankTransfer")}
                </SelectItem>
                <SelectItem value="cash-office">
                  {t("quotes.cashOffice")}
                </SelectItem>
                <SelectItem value="mercado-pago">
                  {t("quotes.mercadoPago")}
                </SelectItem>
                <SelectItem value="van-is-broken">
                  {t("quotes.vanIsBroken")}
                </SelectItem>
                <SelectItem value="pix">{t("quotes.pix")}</SelectItem>
                <SelectItem value="test">{t("quotes.test")}</SelectItem>
                <SelectItem value="transfer">
                  {t("quotes.transfer")}
                </SelectItem>
                <SelectItem value="nubank-transfer">
                  {t("quotes.nubankTransfer")}
                </SelectItem>
                <SelectItem value="wise">{t("quotes.wise")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Price */}
          <div>
            <Label className="text-sm font-medium">
              {t("quotes.totalPrice")}{" "}
              {getCurrencySymbol(currency || "CLP")}
            </Label>
            <div className="mt-1 p-2 bg-green-100 border rounded-md">
              <span className="font-semibold">
                {calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Percentage */}
          <div>
            <Label
              htmlFor="payment-percentage"
              className="text-sm font-medium"
            >
              {t("quotes.percentage")}
            </Label>
            <Input
              id="payment-percentage"
              type="number"
              min="0"
              max="100"
              value={paymentPercentage}
              onChange={(e) => {
                const percentage = parseInt(e.target.value) || 0;
                onPaymentPercentageChange(percentage);
                const totalAmount = calculateGrandTotal();
                const calculatedAmount = Math.round((totalAmount * percentage) / 100);
                onAmountPaidChange(calculatedAmount);
              }}
              className="mt-1"
            />
          </div>

          {/* Amount Paid */}
          <div>
            <Label htmlFor="amount-paid" className="text-sm font-medium">
              {t("quotes.amountPaid")}{" "}
              {getCurrencySymbol(currency || "CLP")}
            </Label>
            <Input
              id="amount-paid"
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) => {
                const amount = parseInt(e.target.value) || 0;
                onAmountPaidChange(amount);
                const totalAmount = calculateGrandTotal();
                if (totalAmount > 0) {
                  const calculatedPercentage = Math.round((amount / totalAmount) * 100);
                  onPaymentPercentageChange(calculatedPercentage);
                }
              }}
              className="mt-1"
            />
          </div>

          {/* Amount Pending */}
          <div>
            <Label className="text-sm font-medium">
              {t("quotes.amountPending")}{" "}
              {getCurrencySymbol(currency || "CLP")}
            </Label>
            <div className="mt-1 p-2 bg-gray-100 border rounded-md">
              <span className="font-semibold text-red-600">
                {(calculateGrandTotal() - amountPaid).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {/* Receipt Upload */}
          <div>
            <Label
              htmlFor="receipt-upload"
              className="text-sm font-medium"
            >
              {t("quotes.receipt")}
            </Label>
            <div className="mt-1">
              <Input
                id="receipt-upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => onReceiptFileChange(e.target.files?.[0] || null)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100"
              />
              {!receiptFile && (
                <span className="text-xs text-gray-500">
                  {t("quotes.noFileChosen")}
                </span>
              )}
            </div>
          </div>

          {/* Payment Comments */}
          <div>
            <Label
              htmlFor="payment-comments"
              className="text-sm font-medium"
            >
              {t("quotes.commentsOnPayment")}
            </Label>
            <Textarea
              id="payment-comments"
              rows={3}
              className="mt-1"
              placeholder={t("quotes.paymentCommentsPlaceholder")}
              value={paymentComments}
              onChange={(e) => onPaymentCommentsChange(e.target.value)}
            />
          </div>

          {/* Payment Status */}
          <div>
            <Label
              htmlFor="payment-status"
              className="text-sm font-medium"
            >
              {t("quotes.paymentStatus")}
            </Label>
            <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("quotes.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  {t("quotes.pending")}
                </SelectItem>
                <SelectItem value="partial">
                  {t("quotes.partial")}
                </SelectItem>
                <SelectItem value="paid">{t("quotes.paid")}</SelectItem>
                <SelectItem value="refunded">
                  {t("quotes.refunded")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("quotes.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentDetailsSection;