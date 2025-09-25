import React from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomerFormData {
  name: string
  idPassport: string
  email: string
  phone: string
  language: string
  countryOfOrigin: string
  cpf: string
  address: string
  defaultHotel: string
  defaultRoom: string
  accommodationComments: string
}

interface CustomerInformationProps {
  formData: CustomerFormData
  onFieldChange: (field: string, value: string) => void
}

const CustomerInformation: React.FC<CustomerInformationProps> = ({
  formData,
  onFieldChange
}) => {
  const { t } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t('quotes.clientInfo')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t('quotes.fullName')}</Label>
            <Input
              id="name"
              placeholder={t('quotes.fullNamePlaceholder')}
              value={formData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="idPassport">{t('quotes.idPassport')}</Label>
            <Input
              id="idPassport"
              placeholder={t('quotes.idPassportPlaceholder')}
              value={formData.idPassport}
              onChange={(e) => onFieldChange("idPassport", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">{t('quotes.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('quotes.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t('quotes.phone')}</Label>
            <Input
              id="phone"
              placeholder={t('quotes.phonePlaceholder')}
              value={formData.phone}
              onChange={(e) => onFieldChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="language">{t('quotes.language')}</Label>
            <Select value={formData.language} onValueChange={(value) => onFieldChange("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('quotes.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t('quotes.spanish')}</SelectItem>
                <SelectItem value="en">{t('quotes.english')}</SelectItem>
                <SelectItem value="pt">{t('quotes.portuguese')}</SelectItem>
                <SelectItem value="fr">{t('quotes.french')}</SelectItem>
                <SelectItem value="de">{t('quotes.german')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="countryOfOrigin">{t('quotes.countryOfOrigin')}</Label>
            <Input
              id="countryOfOrigin"
              placeholder={t('quotes.countryPlaceholder')}
              value={formData.countryOfOrigin}
              onChange={(e) => onFieldChange("countryOfOrigin", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cpf">{t('quotes.cpf')}</Label>
            <Input
              id="cpf"
              placeholder=""
              value={formData.cpf}
              onChange={(e) => onFieldChange("cpf", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">{t('quotes.address')}</Label>
          <Input
            id="address"
            placeholder={t('quotes.addressPlaceholder')}
            value={formData.address}
            onChange={(e) => onFieldChange("address", e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultHotel">{t('quotes.defaultHotel')}</Label>
              <Input
                id="defaultHotel"
                placeholder={t('quotes.hotelPlaceholder')}
                value={formData.defaultHotel}
                onChange={(e) => onFieldChange("defaultHotel", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="defaultRoom">{t('quotes.roomNumber')}</Label>
              <Input
                id="defaultRoom"
                placeholder={t('quotes.roomPlaceholder')}
                value={formData.defaultRoom}
                onChange={(e) => onFieldChange("defaultRoom", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accommodationComments">{t('quotes.accommodationComments')}</Label>
            <Textarea
              id="accommodationComments"
              rows={3}
              placeholder={t('quotes.accommodationPlaceholder')}
              value={formData.accommodationComments}
              onChange={(e) => onFieldChange("accommodationComments", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInformation