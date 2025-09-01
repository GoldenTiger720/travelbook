import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Users,
  ArrowUp,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SalesReportTabProps {
  salesComparison: any[]
  performanceMetrics: {
    sales: {
      total2025: number
      total2024: number
      growth: number
      avgValue: number
    }
    reservations: {
      total2025: number
      total2024: number
      growth: number
    }
    passengers: {
      total2025: number
      total2024: number
      growth: number
    }
  }
}

const SalesReportTab: React.FC<SalesReportTabProps> = ({
  salesComparison,
  performanceMetrics,
}) => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Sales Report KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.totalSales2025')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${performanceMetrics.sales.total2025.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+{performanceMetrics.sales.growth}%</span>
              <span className="text-muted-foreground ml-1">{t('reports.vsLastYear')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.totalReservations2025')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.reservations.total2025}</div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+{performanceMetrics.reservations.growth}%</span>
              <span className="text-muted-foreground ml-1">{t('reports.vsLastYear')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.totalPassengers2025')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.passengers.total2025}</div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+{performanceMetrics.passengers.growth}%</span>
              <span className="text-muted-foreground ml-1">{t('reports.vsLastYear')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('reports.averageBookingValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${performanceMetrics.sales.avgValue}</div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.4%</span>
              <span className="text-muted-foreground ml-1">{t('reports.vsLastYear')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              {t('reports.monthlySalesComparison')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="sales2023" stroke="#94a3b8" name="2023" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="sales2024" stroke="#3b82f6" name="2024" />
                <Line type="monotone" dataKey="sales2025" stroke="#22c55e" name="2025" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reservations and PAX Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              {t('reports.reservationsPaxComparison')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="reservations2025" fill="#3b82f6" name="Reservations 2025" />
                <Line yAxisId="right" type="monotone" dataKey="pax2025" stroke="#ec4899" strokeWidth={3} name="PAX 2025" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3-Year Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            {t('reports.threeYearOverview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={salesComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="sales2023" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} name="2023" />
              <Area type="monotone" dataKey="sales2024" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="2024" />
              <Area type="monotone" dataKey="sales2025" stackId="3" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="2025" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesReportTab