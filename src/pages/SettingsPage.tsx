import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileTab from "@/components/SettingsPage/ProfileTab"
import CompanyTab from "@/components/SettingsPage/CompanyTab"
import NotificationsTab from "@/components/SettingsPage/NotificationsTab"
import AppearanceTab from "@/components/SettingsPage/AppearanceTab"
import SecurityTab from "@/components/SettingsPage/SecurityTab"
import { useToast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"

const SettingsPage = () => {
  const { toast } = useToast()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [theme, setTheme] = useState("system")
  const [currency, setCurrency] = useState("USD")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("America/New_York")

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileTab />
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <CompanyTab
            timezone={timezone}
            setTimezone={setTimezone}
            currency={currency}
            setCurrency={setCurrency}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            pushNotifications={pushNotifications}
            setPushNotifications={setPushNotifications}
            marketingEmails={marketingEmails}
            setMarketingEmails={setMarketingEmails}
          />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceTab
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
          />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage