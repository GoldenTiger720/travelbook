import { ReactNode } from "react"
import { Hero } from "@/components/Hero"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

interface AppLayoutProps {
  children: ReactNode
  heroTitle: string
  heroSubtitle?: string
  heroImage: string
}

export function AppLayout({ children, heroTitle, heroSubtitle, heroImage }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero 
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={heroImage}
      />
      <SidebarProvider>
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <SidebarTrigger className="mr-4" />
              <img 
                src="/logo1.png" 
                alt="Zenith Travel Ops" 
                className="w-10 h-10 object-contain"
              />
            </header>
            <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}