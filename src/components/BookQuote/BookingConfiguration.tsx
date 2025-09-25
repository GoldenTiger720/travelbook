import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  commission: string
  status: string
}

interface BookingConfigurationProps {
  formData: {
    salesperson: string
    currency: string
    origin: string
  }
  users: User[]
  onFieldChange: (field: string, value: string) => void
}

const BookingConfiguration: React.FC<BookingConfigurationProps> = ({
  formData,
  users,
  onFieldChange
}) => {
  const { t } = useLanguage()

  // Filter users with salesperson role
  const salesPersons = users.filter(user => user.role === 'salesperson' && user.status === 'Active')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t('quotes.configTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salesperson">{t('quotes.salesperson')}</Label>
            <Select value={formData.salesperson} onValueChange={(value) => onFieldChange("salesperson", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.selectSalesperson')} />
              </SelectTrigger>
              <SelectContent>
                {salesPersons.length > 0 ? (
                  salesPersons.map((salesperson) => (
                    <SelectItem key={salesperson.id} value={salesperson.id}>
                      {salesperson.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">No salespersons available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency">{t('quotes.currency')}</Label>
            <Select value={formData.currency} onValueChange={(value) => onFieldChange("currency", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.chileanPesos')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLP">{t('quotes.chileanPesos')}</SelectItem>
                <SelectItem value="USD">{t('quotes.usDollars')}</SelectItem>
                <SelectItem value="EUR">{t('quotes.euros')}</SelectItem>
                <SelectItem value="BRL">{t('quotes.brazilianReais')}</SelectItem>
                <SelectItem value="ARS">{t('quotes.argentinePesos')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="origin">{t('quotes.origin')}</Label>
            <Select value={formData.origin} onValueChange={(value) => onFieldChange("origin", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.selectOrigin')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">{t('quotes.instagram')}</SelectItem>
                <SelectItem value="youtube">{t('quotes.youtube')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingConfiguration