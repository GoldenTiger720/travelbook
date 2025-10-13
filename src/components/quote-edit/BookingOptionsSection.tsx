import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface BookingOptionsSectionProps {
  includePayment: boolean;
  copyComments: boolean;
  sendPurchaseOrder: boolean;
  sendQuotationAccess: boolean;
  validUntil: Date;
  quotationComments: string;
  customerEmail: string;
  onIncludePaymentChange?: (value: boolean) => void;
  onCopyCommentsChange?: (value: boolean) => void;
  onSendPurchaseOrderChange?: (value: boolean) => void;
  onSendQuotationAccessChange?: (value: boolean) => void;
  onValidUntilChange?: (value: Date) => void;
  onQuotationCommentsChange?: (value: string) => void;
}

const BookingOptionsSection: React.FC<BookingOptionsSectionProps> = ({
  includePayment,
  copyComments,
  sendPurchaseOrder,
  sendQuotationAccess,
  validUntil,
  quotationComments,
  customerEmail,
  onIncludePaymentChange,
  onCopyCommentsChange,
  onSendPurchaseOrderChange,
  onSendQuotationAccessChange,
  onValidUntilChange,
  onQuotationCommentsChange,
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="include-payment"
                className="text-base font-medium"
              >
                {t("quotes.includePayment")}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="include-payment"
                  checked={includePayment}
                  className="data-[state=unchecked]:bg-red-500"
                  onCheckedChange={onIncludePaymentChange}
                />
                <span className="text-sm font-medium min-w-[30px]">
                  {includePayment ? t("quotes.yes") : t("quotes.no")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="copy-comments"
                className="text-base font-medium"
              >
                {t("quotes.copyCommentsToOrder")}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="copy-comments"
                  checked={copyComments}
                  className="data-[state=checked]:bg-green-500"
                  onCheckedChange={onCopyCommentsChange}
                />
                <span className="text-sm font-medium min-w-[30px]">
                  {copyComments ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="send-purchase-order"
                  className="text-base font-medium"
                >
                  {t("quotes.sendPurchaseOrderAccess")}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="send-purchase-order"
                    checked={sendPurchaseOrder}
                    className="data-[state=checked]:bg-green-500"
                    onCheckedChange={onSendPurchaseOrderChange}
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
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
              >
                {t("quotes.reserve")}
              </Button>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-green-500">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-green-700">
                  {t("quotes.readyToBook")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label
                  htmlFor="valid-until"
                  className="text-base font-medium"
                >
                  {t("quotes.validUntil")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(validUntil, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={(date) => date && onValidUntilChange?.(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label
                  htmlFor="quotation-comments"
                  className="text-base font-medium"
                >
                  {t("quotes.commentsOnQuotation")}
                </Label>
                <Textarea
                  id="quotation-comments"
                  rows={1}
                  className="mt-2 min-h-[40px] resize-none"
                  placeholder={t("quotes.quotationCommentsPlaceholder")}
                  value={quotationComments || ""}
                  onChange={(e) => onQuotationCommentsChange?.(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="send-quotation-access"
                  className="text-base font-medium"
                >
                  {t("quotes.sendQuotationAccess")}
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="send-quotation-access"
                    checked={sendQuotationAccess}
                    className="data-[state=checked]:bg-green-500"
                    onCheckedChange={onSendQuotationAccessChange}
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
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
              >
                Update Quotation
              </Button>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-green-500">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-green-700">
                  {t("quotes.readyToQuote")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingOptionsSection;