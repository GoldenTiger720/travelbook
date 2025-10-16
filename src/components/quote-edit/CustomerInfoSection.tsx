import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface CustomerInfoSectionProps {
  customer: {
    name: string;
    email: string;
    phone: string;
    language: string;
    country: string;
    idNumber: string;
    cpf: string;
    address: string;
    hotel: string;
    room: string;
    comments: string;
  };
  onCustomerChange?: (field: string, value: string) => void;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customer,
  onCustomerChange,
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t("quotes.clientInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t("quotes.fullName")}</Label>
            <Input
              id="name"
              placeholder={t("quotes.fullNamePlaceholder")}
              value={customer?.name || ""}
              onChange={(e) => onCustomerChange?.('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="idPassport">{t("quotes.idPassport")}</Label>
            <Input
              id="idPassport"
              placeholder={t("quotes.idPassportPlaceholder")}
              value={customer?.idNumber || ""}
              onChange={(e) => onCustomerChange?.('idNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">{t("quotes.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("quotes.emailPlaceholder")}
              value={customer?.email || ""}
              onChange={(e) => onCustomerChange?.('email', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("quotes.phone")}</Label>
            <Input
              id="phone"
              placeholder={t("quotes.phonePlaceholder")}
              value={customer?.phone || ""}
              onChange={(e) => onCustomerChange?.('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="language">{t("quotes.language")}</Label>
            <Select value={customer?.language || ""} onValueChange={(value) => onCustomerChange?.('language', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t("quotes.spanish")}</SelectItem>
                <SelectItem value="en">{t("quotes.english")}</SelectItem>
                <SelectItem value="pt">{t("quotes.portuguese")}</SelectItem>
                <SelectItem value="fr">{t("quotes.french")}</SelectItem>
                <SelectItem value="de">{t("quotes.german")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="countryOfOrigin">
              {t("quotes.countryOfOrigin")}
            </Label>
            <Input
              id="countryOfOrigin"
              placeholder={t("quotes.countryPlaceholder")}
              value={customer?.country || ""}
              onChange={(e) => onCustomerChange?.('country', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cpf">{t("quotes.cpf")}</Label>
            <Input
              id="cpf"
              placeholder=""
              value={customer?.cpf || ""}
              onChange={(e) => onCustomerChange?.('cpf', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">{t("quotes.address")}</Label>
          <Input
            id="address"
            placeholder={t("quotes.addressPlaceholder")}
            value={customer?.address || ""}
            onChange={(e) => onCustomerChange?.('address', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultHotel">
                {t("quotes.defaultHotel")}
              </Label>
              <Input
                id="defaultHotel"
                placeholder={t("quotes.hotelPlaceholder")}
                value={customer?.hotel || ""}
                onChange={(e) => onCustomerChange?.('hotel', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="defaultRoom">{t("quotes.roomNumber")}</Label>
              <Input
                id="defaultRoom"
                placeholder={t("quotes.roomPlaceholder")}
                value={customer?.room || ""}
                onChange={(e) => onCustomerChange?.('room', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accommodationComments">
              {t("quotes.accommodationComments")}
            </Label>
            <Textarea
              id="accommodationComments"
              rows={3}
              placeholder={t("quotes.accommodationPlaceholder")}
              value={customer?.comments || ""}
              onChange={(e) => onCustomerChange?.('comments', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInfoSection;