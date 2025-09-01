import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell } from 'lucide-react'

interface NotificationsTabProps {
  emailNotifications: boolean
  setEmailNotifications: (value: boolean) => void
  pushNotifications: boolean
  setPushNotifications: (value: boolean) => void
  marketingEmails: boolean
  setMarketingEmails: (value: boolean) => void
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  emailNotifications,
  setEmailNotifications,
  pushNotifications,
  setPushNotifications,
  marketingEmails,
  setMarketingEmails,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive booking confirmations and updates via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts for urgent bookings and messages
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional offers and travel deals
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "New Bookings", enabled: true },
                { label: "Booking Cancellations", enabled: true },
                { label: "Payment Received", enabled: true },
                { label: "Customer Messages", enabled: true },
                { label: "Quote Requests", enabled: false },
                { label: "System Updates", enabled: false }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Switch defaultChecked={item.enabled} />
                  <Label>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsTab