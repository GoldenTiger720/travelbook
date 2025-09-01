import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Building } from 'lucide-react'

interface CompanyTabProps {
  timezone: string
  setTimezone: (value: string) => void
  currency: string
  setCurrency: (value: string) => void
}

const CompanyTab: React.FC<CompanyTabProps> = ({
  timezone,
  setTimezone,
  currency,
  setCurrency,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-accent" />
            Company Information
          </CardTitle>
          <CardDescription>
            Manage your travel agency details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Zenith Travel Agency" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" defaultValue="ZTA-2024-001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea 
                id="address" 
                defaultValue="123 Travel Street, Suite 100&#10;New York, NY 10001&#10;United States"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monday - Friday</Label>
                <div className="flex items-center gap-2">
                  <Input type="time" defaultValue="09:00" className="w-32" />
                  <span>to</span>
                  <Input type="time" defaultValue="18:00" className="w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Saturday - Sunday</Label>
                <div className="flex items-center gap-2">
                  <Input type="time" defaultValue="10:00" className="w-32" />
                  <span>to</span>
                  <Input type="time" defaultValue="14:00" className="w-32" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanyTab