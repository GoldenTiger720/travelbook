import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  commission: string;
  status: string;
}

interface QuoteConfigSectionProps {
  assignedTo: string;
  currency: string;
  leadSource: string;
  users?: User[];
  onAssignedToChange?: (value: string) => void;
  onCurrencyChange?: (value: string) => void;
  onLeadSourceChange?: (value: string) => void;
}

const QuoteConfigSection: React.FC<QuoteConfigSectionProps> = ({
  assignedTo,
  currency,
  leadSource,
  users = [],
  onAssignedToChange,
  onCurrencyChange,
  onLeadSourceChange,
}) => {
  const { t } = useLanguage();

  // Filter salespersons from users list
  const salesPersons = users.filter(user => user.role === 'salesperson' && user.status === 'Active');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {t("quotes.configTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salesperson">{t("quotes.salesperson")}</Label>
            <Select value={assignedTo || ""} onValueChange={onAssignedToChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectSalesperson")} />
              </SelectTrigger>
              <SelectContent>
                {salesPersons.length > 0 ? (
                  salesPersons.map((user) => (
                    <SelectItem key={user.id} value={user.full_name}>
                      {user.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      {t("quotes.internalTeam")}
                    </div>
                    <SelectItem value="thiago">Thiago Andrade</SelectItem>
                    <SelectItem value="ana">Ana Martinez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Travel Plus
                    </div>
                    <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      World Tours
                    </div>
                    <SelectItem value="ana-silva">Ana Silva</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Adventure Agency
                    </div>
                    <SelectItem value="sofia">Sofia Gonzalez</SelectItem>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Sunset Travel
                    </div>
                    <SelectItem value="juan">Juan Rodriguez</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency">{t("quotes.currency")}</Label>
            <Select value={currency || "CLP"} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.chileanPesos")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLP">
                  {t("quotes.chileanPesos")}
                </SelectItem>
                <SelectItem value="USD">{t("quotes.usDollars")}</SelectItem>
                <SelectItem value="EUR">{t("quotes.euros")}</SelectItem>
                <SelectItem value="BRL">
                  {t("quotes.brazilianReais")}
                </SelectItem>
                <SelectItem value="ARS">
                  {t("quotes.argentinePesos")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="origin">{t("quotes.origin")}</Label>
            <Select value={leadSource || ""} onValueChange={onLeadSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("quotes.selectOrigin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">
                  {t("quotes.instagram")}
                </SelectItem>
                <SelectItem value="youtube">
                  {t("quotes.youtube")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteConfigSection;