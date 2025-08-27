import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  FileText,
  ArrowUp,
  ArrowDown,
  Printer,
  Share2
} from "lucide-react"

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 72000 },
  { month: 'Mar', revenue: 68000 },
  { month: 'Apr', revenue: 85000 },
  { month: 'May', revenue: 92000 },
  { month: 'Jun', revenue: 95000 },
  { month: 'Jul', revenue: 98000 },
  { month: 'Aug', revenue: 102000 },
  { month: 'Sep', revenue: 110000 },
  { month: 'Oct', revenue: 115000 },
  { month: 'Nov', revenue: 125000 },
  { month: 'Dec', revenue: 127450 }
]

const bookingsByDestination = [
  { name: 'Buenos Aires', value: 35 },
  { name: 'Rio de Janeiro', value: 28 },
  { name: 'Patagonia', value: 22 },
  { name: 'Iguazu Falls', value: 18 },
  { name: 'Cusco', value: 15 },
  { name: 'Santiago', value: 12 }
]

const monthlyBookings = [
  { month: 'Jan', confirmed: 45, pending: 12, cancelled: 5 },
  { month: 'Feb', confirmed: 52, pending: 15, cancelled: 3 },
  { month: 'Mar', confirmed: 48, pending: 10, cancelled: 7 },
  { month: 'Apr', confirmed: 58, pending: 18, cancelled: 4 },
  { month: 'May', confirmed: 62, pending: 20, cancelled: 6 },
  { month: 'Jun', confirmed: 65, pending: 15, cancelled: 5 },
  { month: 'Jul', confirmed: 68, pending: 12, cancelled: 3 },
  { month: 'Aug', confirmed: 72, pending: 10, cancelled: 2 },
  { month: 'Sep', confirmed: 78, pending: 8, cancelled: 4 },
  { month: 'Oct', confirmed: 82, pending: 12, cancelled: 3 },
  { month: 'Nov', confirmed: 87, pending: 15, cancelled: 5 },
  { month: 'Dec', confirmed: 89, pending: 23, cancelled: 4 }
]

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#fb923c', '#22c55e', '#94a3b8']

const keyMetrics = [
  {
    title: "Total Revenue",
    value: "$1,127,450",
    change: "+15.3%",
    trend: "up",
    period: "YTD"
  },
  {
    title: "Average Booking Value",
    value: "$2,847",
    change: "+8.7%",
    trend: "up",
    period: "vs last year"
  },
  {
    title: "Customer Retention",
    value: "78.5%",
    change: "+5.2%",
    trend: "up",
    period: "vs last year"
  },
  {
    title: "Cancellation Rate",
    value: "4.2%",
    change: "-1.8%",
    trend: "down",
    period: "vs last month"
  }
]

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined)
  const [reportType, setReportType] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your travel agency performance and insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="revenue">Revenue Analysis</SelectItem>
            <SelectItem value="bookings">Bookings Report</SelectItem>
            <SelectItem value="customers">Customer Analytics</SelectItem>
            <SelectItem value="destinations">Destination Performance</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select defaultValue="year">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-2 text-sm">
                {metric.trend === "up" ? (
                  <ArrowUp className="w-4 h-4 text-success mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-destructive mr-1" />
                )}
                <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground ml-1">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
          <TabsTrigger value="destinations">Top Destinations</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Booking Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="confirmed" stackId="a" fill="#22c55e" name="Confirmed" />
                  <Bar dataKey="pending" stackId="a" fill="#fb923c" name="Pending" />
                  <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-warning" />
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingsByDestination}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingsByDestination.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destination Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Buenos Aires', 'Rio de Janeiro', 'Patagonia', 'Iguazu Falls'].map((destination, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{destination}</span>
                      <span className="text-muted-foreground">{[35, 28, 22, 18][index]}%</span>
                    </div>
                    <Progress value={[35, 28, 22, 18][index]} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Best Performing Month</h3>
                <p className="text-2xl font-bold">December</p>
                <p className="text-sm text-muted-foreground">$127,450 in revenue</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Top Customer Segment</h3>
                <p className="text-2xl font-bold">VIP Customers</p>
                <p className="text-sm text-muted-foreground">48% of total revenue</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Growth Rate</h3>
                <p className="text-2xl font-bold">+15.3%</p>
                <p className="text-sm text-muted-foreground">Year over year</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsPage