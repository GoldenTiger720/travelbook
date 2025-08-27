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

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Reservation Calendar", url: "/reservations", icon: Calendar },
  { title: "All Reservations", url: "/all-reservations", icon: ClipboardList },
  { title: "Book/Quote", url: "/quotes", icon: FileText },
  { title: "My Quotes", url: "/my-quotes", icon: BookOpen },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Financial", url: "/financial", icon: DollarSign },
  { title: "Sales Commissions", url: "/sales-commissions", icon: CircleDollarSign },
]

const operationsItems = [
  { title: "Service Log", url: "/services", icon: MapPin },
  { title: "Tours", url: "/tours", icon: Compass },
  { title: "Logistics", url: "/logistics", icon: Car },
  { title: "Reports", url: "/reports", icon: TrendingUp },
  { title: "Support", url: "/support", icon: HeadphonesIcon },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  
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
          <SidebarGroupLabel className="text-gray-600 font-medium uppercase text-xs tracking-wider px-3">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-black data-[active=true]:text-white">
                    <NavLink to={item.url} end className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-inherit">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium uppercase text-xs tracking-wider px-3">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-black data-[active=true]:text-white">
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span className="text-inherit">{item.title}</span>}
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
              {!isCollapsed && <span className="text-inherit">Settings</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}