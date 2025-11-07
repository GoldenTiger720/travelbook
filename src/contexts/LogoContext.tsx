import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiCall } from '@/config/api'

interface LogoContextType {
  companyLogo: string | null
  updateLogo: (logo: string) => void
  refreshLogo: () => Promise<void>
}

const LogoContext = createContext<LogoContextType | undefined>(undefined)

export const LogoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  const fetchLogo = async () => {
    try {
      const response = await apiCall('/api/settings/system/appearance/', {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          // Get the most recent logo (first item due to ordering by updated_at desc)
          const latestLogo = data[0]
          if (latestLogo.company_logo) {
            setCompanyLogo(latestLogo.company_logo)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching company logo:', error)
    }
  }

  useEffect(() => {
    fetchLogo()
  }, [])

  const updateLogo = (logo: string) => {
    setCompanyLogo(logo)
  }

  const refreshLogo = async () => {
    await fetchLogo()
  }

  return (
    <LogoContext.Provider value={{ companyLogo, updateLogo, refreshLogo }}>
      {children}
    </LogoContext.Provider>
  )
}

export const useLogo = () => {
  const context = useContext(LogoContext)
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider')
  }
  return context
}
