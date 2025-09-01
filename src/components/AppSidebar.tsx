import { 
  Calendar, 
  DollarSign, 
  Home, 
  FileText, 
  Users, 
  Car, 
  TrendingUp,
  Settings,
  MapPin,
  BookOpen,
  CircleDollarSign,
  ClipboardList,
  Compass,
  HeadphonesIcon
} from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useLanguage } from "@/contexts/LanguageContext"

export function AppSidebar() {
  const { state } = useSidebar()
  const { t } = useLanguage()
  const isCollapsed = state === 'collapsed'
  
  const mainItems = [
    { titleKey: "sidebar.dashboard", url: "/", icon: Home },
    { titleKey: "sidebar.reservations", url: "/reservations", icon: Calendar },
    { titleKey: "sidebar.allReservations", url: "/all-reservations", icon: ClipboardList },
    { titleKey: "sidebar.quotes", url: "/quotes", icon: FileText },
    { titleKey: "sidebar.myQuotes", url: "/my-quotes", icon: BookOpen },
    { titleKey: "sidebar.customers", url: "/customers", icon: Users },
    { titleKey: "sidebar.financial", url: "/financial", icon: DollarSign },
    { titleKey: "sidebar.salesCommissions", url: "/sales-commissions", icon: CircleDollarSign },
  ]

  const operationsItems = [
    { titleKey: "sidebar.services", url: "/services", icon: MapPin },
    { titleKey: "sidebar.tours", url: "/tours", icon: Compass },
    { titleKey: "sidebar.logistics", url: "/logistics", icon: Car },
    { titleKey: "sidebar.reports", url: "/reports", icon: TrendingUp },
    { titleKey: "sidebar.support", url: "/support", icon: HeadphonesIcon },
  ]
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `transition-all duration-200 ${
      isActive 
        ? "bg-primary text-white shadow-md" 
        : "text-black hover:bg-gray-100 hover:text-black"
    }`

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-white">
        <div className="p-4">
          <div className="flex items-center justify-center">
            <img 
              src="/logo1.png" 
              alt="Zenith Travel Ops" 
              className={isCollapsed ? "w-10 h-10 object-contain" : "w-16 h-16 object-contain"}
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium uppercase text-xs tracking-wider px-3">{t('sidebar.mainGroup')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className="text-black data-[active=true]:text-white">
                    <NavLink to={item.url} end className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-inherit">{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium uppercase text-xs tracking-wider px-3">{t('sidebar.operationsGroup')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className="text-black data-[active=true]:text-white">
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-inherit">{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <SidebarMenuButton asChild className="text-black data-[active=true]:text-white">
            <NavLink to="/settings" className={getNavClassName}>
              <Settings className="w-4 h-4" />
              {!isCollapsed && <span className="text-inherit">{t('sidebar.settings')}</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}