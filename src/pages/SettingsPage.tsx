import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SystemTab from "@/components/SettingsPage/SystemTab"
import UsersTab from "@/components/SettingsPage/UsersTab"
import DestinationsTab from "@/components/SettingsPage/DestinationsTab"
import VehiclesTab from "@/components/SettingsPage/VehiclesTab"
import {
  Settings,
  Users,
  MapPin,
  Car,
} from "lucide-react"

const SettingsPage = () => {

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Administrative Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Centralized administrative functions for system management
        </p>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        {/* Mobile: Scrollable tabs */}
        <div className="block sm:hidden">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="system" className="flex flex-col items-center gap-1 py-3 text-xs">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col items-center gap-1 py-3 text-xs">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 h-auto mt-2">
            <TabsTrigger value="destinations" className="flex flex-col items-center gap-1 py-3 text-xs">
              <MapPin className="w-4 h-4" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex flex-col items-center gap-1 py-3 text-xs">
              <Car className="w-4 h-4" />
              Vehicles
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: Single row tabs */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="destinations" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden lg:inline">Destinations</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden lg:inline">Vehicles</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <SystemTab />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UsersTab />
        </TabsContent>

        {/* Destinations Tab */}
        <TabsContent value="destinations" className="space-y-6">
          <DestinationsTab />
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <VehiclesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage