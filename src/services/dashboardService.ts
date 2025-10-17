import { apiCall, API_ENDPOINTS } from '@/config/api'

export interface StatusAlert {
  id: number
  type: 'overdue' | 'pending'
  title: string
  description: string
  amount: string
  daysOverdue?: number
  dueIn?: number
}

export interface Metric {
  value: string
  change: string
  trend: 'up' | 'down'
}

export interface Metrics {
  totalRevenue: Metric
  activeReservations: Metric
  totalCustomers: Metric
  totalPax: Metric
}

export interface MonthlySales {
  month: string
  [year: string]: number | string
}

export interface MonthlyReservation {
  month: string
  reservations: number
  pax: number
}

export interface RecentReservation {
  id: string
  customer: string
  destination: string
  date: string
  status: string
  amount: string
  pax: number
}

export interface DashboardData {
  statusAlerts: StatusAlert[]
  metrics: Metrics
  monthlySales: MonthlySales[]
  monthlyReservations: MonthlyReservation[]
  recentReservations: RecentReservation[]
}

class DashboardService {
  /**
   * Get all dashboard data
   * @returns Promise<DashboardData> All dashboard data from backend
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiCall(API_ENDPOINTS.DASHBOARD.ALL_DATA, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        return result.data
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Error fetching dashboard data from backend:', error)
      throw error
    }
  }
}

export const dashboardService = new DashboardService()
