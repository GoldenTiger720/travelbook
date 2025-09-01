import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Globe,
  DollarSign,
  Clock,
  Mail,
  Building,
  Phone,
  MapPin,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const SystemTab: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* General System Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-primary" />
            <span className="truncate">System Configuration</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Manage general system parameters and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input id="systemName" defaultValue="Zenith Travel Operations" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemVersion">System Version</Label>
              <Input id="systemVersion" defaultValue="v2.1.0" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultTimezone">Default Timezone</Label>
              <Select defaultValue="America/New_York">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Sao_Paulo">Brazil Time (BRT)</SelectItem>
                  <SelectItem value="America/Buenos_Aires">Argentina Time (ART)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="w-5 h-5 text-accent" />
            <span className="truncate">Company Information</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Main company details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Zenith Travel Agency" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" defaultValue="ZTA-2024-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input id="companyPhone" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email</Label>
              <Input id="companyEmail" type="email" defaultValue="contact@zenithtravel.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="companyAddress">Business Address</Label>
              <Textarea 
                id="companyAddress" 
                defaultValue="123 Travel Street, Suite 100&#10;New York, NY 10001&#10;United States"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="truncate">Financial Configuration</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Currency and financial parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                  <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input id="taxRate" type="number" defaultValue="8.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Base Commission Rate (%)</Label>
              <Input id="commissionRate" type="number" defaultValue="10" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
              <Input id="paymentTerms" type="number" defaultValue="30" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Payment Methods</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {[
                { method: "Credit Card", enabled: true },
                { method: "Bank Transfer", enabled: true },
                { method: "Cash", enabled: true },
                { method: "Check", enabled: false },
                { method: "PayPal", enabled: true },
                { method: "Cryptocurrency", enabled: false }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium text-sm sm:text-base">{item.method}</span>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="truncate">System Status</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Current system health and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Database</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
                </div>
                <Badge variant="default" className="bg-green-500">Online</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">API Services</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">All services running</p>
                </div>
                <Badge variant="default" className="bg-blue-500">Active</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Backup</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Last: 2 hours ago</p>
                </div>
                <Badge variant="secondary" className="bg-orange-500 text-white">Recent</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-sm sm:text-base">System Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <p className="font-semibold text-xl sm:text-2xl">1,247</p>
                <p className="text-muted-foreground text-xs sm:text-sm">Total Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <p className="font-semibold text-xl sm:text-2xl">34</p>
                <p className="text-muted-foreground text-xs sm:text-sm">Active Sessions</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <p className="font-semibold text-xl sm:text-2xl">89%</p>
                <p className="text-muted-foreground text-xs sm:text-sm">System Load</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/20">
                <p className="font-semibold text-xl sm:text-2xl">99.9%</p>
                <p className="text-muted-foreground text-xs sm:text-sm">Uptime</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemTab