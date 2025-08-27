import { Hero } from "@/components/Hero"
import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
  heroImage: string
  heroTitle: string
  heroSubtitle?: string
}

export function PageLayout({ children, heroImage, heroTitle, heroSubtitle }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero 
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={heroImage}
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}