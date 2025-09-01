import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import {
  CalendarIcon,
  RefreshCw,
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'

interface ReportsTabProps {
  dateRange: { from: Date; to: Date }
  setDateRange: (range: any) => void
  viewMode: 'accrual' | 'cash'
  setViewMode: (mode: 'accrual' | 'cash') => void
  selectedCurrency: string
  setSelectedCurrency: (currency: string) => void
  workflowData: any
  formatCurrency: (amount: number, currency?: string) => string
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  dateRange,
  setDateRange,
  viewMode,
  setViewMode,
  selectedCurrency,
  setSelectedCurrency,
  workflowData,
  formatCurrency,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                    </>
                  ) : (
                    'Date range'
                  )}
                </span>
                <span className="sm:hidden">Date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range: any) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-24 sm:w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accrual">Accrual</SelectItem>
              <SelectItem value="cash">Cash Basis</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-20 sm:w-28 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">BRL</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Profit & Loss Statement</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {viewMode === 'accrual' ? 'Accrual Basis' : 'Cash Basis'} - {format(dateRange.from!, 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue by Product/Service */}
            <div>
              <h3 className="font-semibold mb-3">Revenue by Product</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tour Packages</span>
                    <span className="text-sm font-medium">{formatCurrency(850000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accommodations</span>
                    <span className="text-sm font-medium">{formatCurrency(320000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transportation</span>
                    <span className="text-sm font-medium">{formatCurrency(180000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Services</span>
                    <span className="text-sm font-medium">{formatCurrency(50000)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(1400000)}</span>
                  </div>
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tours', value: 850000 },
                          { name: 'Hotels', value: 320000 },
                          { name: 'Transport', value: 180000 },
                          { name: 'Other', value: 50000 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Costs by Category */}
            <div>
              <h3 className="font-semibold mb-3">Costs & Expenses</h3>
              <div className="space-y-2">
                {workflowData.costCenters.map((center: any) => (
                  <div key={center.id} className="flex justify-between">
                    <span className="text-sm">{center.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(center.spent)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Costs</span>
                  <span>{formatCurrency(workflowData.costCenters.reduce((sum: number, c: any) => sum + c.spent, 0))}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-4 border-t-2">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Net Profit</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(1400000 - workflowData.costCenters.reduce((sum: number, c: any) => sum + c.spent, 0))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Currency Exposure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Currency Exposure</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Multi-currency risk analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={[
                { currency: 'USD', exposure: 45, risk: 30 },
                { currency: 'BRL', exposure: 60, risk: 20 },
                { currency: 'EUR', exposure: 35, risk: 25 },
                { currency: 'ARS', exposure: 25, risk: 45 },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="currency" />
                <PolarRadiusAxis />
                <Radar name="Exposure" dataKey="exposure" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Collection Metrics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">DSO and delinquency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Days Sales Outstanding (DSO)</span>
                  <span className="text-2xl font-bold">32</span>
                </div>
                <Progress value={32} max={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Collection Rate</span>
                  <span className="text-2xl font-bold">87%</span>
                </div>
                <Progress value={87} className="h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Delinquency Rate</span>
                  <span className="text-2xl font-bold text-red-600">8.5%</span>
                </div>
                <Progress value={8.5} className="h-2 bg-red-100" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Average Payment Delay</span>
                  <span className="text-2xl font-bold">5.2 days</span>
                </div>
                <Progress value={5.2} max={30} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportsTab