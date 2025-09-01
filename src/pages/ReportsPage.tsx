import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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
  Share2,
  Trophy,
  Star,
  Medal,
  Award,
  Target,
  BarChart3
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

// Mock data for Sales Report - 3 year comparison
const salesComparison = [
  { month: 'Jan', sales2023: 45000, sales2024: 58000, sales2025: 73000, reservations2023: 32, reservations2024: 41, reservations2025: 52, pax2023: 128, pax2024: 164, pax2025: 208 },
  { month: 'Feb', sales2023: 48000, sales2024: 62000, sales2025: 78000, reservations2023: 34, reservations2024: 44, reservations2025: 55, pax2023: 136, pax2024: 176, pax2025: 220 },
  { month: 'Mar', sales2023: 52000, sales2024: 65000, sales2025: 82000, reservations2023: 37, reservations2024: 46, reservations2025: 58, pax2023: 148, pax2024: 184, pax2025: 232 },
  { month: 'Apr', sales2023: 58000, sales2024: 72000, sales2025: 89000, reservations2023: 41, reservations2024: 51, reservations2025: 63, pax2023: 164, pax2024: 204, pax2025: 252 },
  { month: 'May', sales2023: 65000, sales2024: 78000, sales2025: 95000, reservations2023: 46, reservations2024: 55, reservations2025: 67, pax2023: 184, pax2024: 220, pax2025: 268 },
  { month: 'Jun', sales2023: 72000, sales2024: 85000, sales2025: 102000, reservations2023: 51, reservations2024: 60, reservations2025: 72, pax2023: 204, pax2024: 240, pax2025: 288 },
  { month: 'Jul', sales2023: 78000, sales2024: 92000, sales2025: 108000, reservations2023: 55, reservations2024: 65, reservations2025: 76, pax2023: 220, pax2024: 260, pax2025: 304 },
  { month: 'Aug', sales2023: 82000, sales2024: 98000, sales2025: 115000, reservations2023: 58, reservations2024: 69, reservations2025: 81, pax2023: 232, pax2024: 276, pax2025: 324 },
  { month: 'Sep', sales2023: 75000, sales2024: 89000, sales2025: 105000, reservations2023: 53, reservations2024: 63, reservations2025: 74, pax2023: 212, pax2024: 252, pax2025: 296 },
  { month: 'Oct', sales2023: 68000, sales2024: 82000, sales2025: 98000, reservations2023: 48, reservations2024: 58, reservations2025: 69, pax2023: 192, pax2024: 232, pax2025: 276 },
  { month: 'Nov', sales2023: 85000, sales2024: 102000, sales2025: 125000, reservations2023: 60, reservations2024: 72, reservations2025: 88, pax2023: 240, pax2024: 288, pax2025: 352 },
  { month: 'Dec', sales2023: 95000, sales2024: 115000, sales2025: 142000, reservations2023: 67, reservations2024: 81, reservations2025: 100, pax2023: 268, pax2024: 324, pax2025: 400 }
]

// Salesperson Ranking Data
const salespersonData = [
  {
    id: 1,
    name: "Maria García",
    sales: 485000,
    reservations: 167,
    passengers: 668,
    avgValue: 2904,
    commission: 24250,
    rank: 1,
    performance: 95
  },
  {
    id: 2,
    name: "Carlos Rodriguez",
    sales: 428000,
    reservations: 152,
    passengers: 608,
    avgValue: 2816,
    commission: 21400,
    rank: 2,
    performance: 88
  },
  {
    id: 3,
    name: "Ana Silva",
    sales: 392000,
    reservations: 145,
    passengers: 580,
    avgValue: 2703,
    commission: 19600,
    rank: 3,
    performance: 85
  },
  {
    id: 4,
    name: "Luis Martinez",
    sales: 358000,
    reservations: 132,
    passengers: 528,
    avgValue: 2712,
    commission: 17900,
    rank: 4,
    performance: 78
  },
  {
    id: 5,
    name: "Sofia Gonzalez",
    sales: 325000,
    reservations: 128,
    passengers: 512,
    avgValue: 2539,
    commission: 16250,
    rank: 5,
    performance: 72
  },
  {
    id: 6,
    name: "Diego Fernandez",
    sales: 295000,
    reservations: 115,
    passengers: 460,
    avgValue: 2565,
    commission: 14750,
    rank: 6,
    performance: 68
  }
]

// Tour Ranking Data
const tourRankingData = [
  {
    id: 1,
    name: "Buenos Aires City Tour",
    category: "City Tours",
    revenue: 285000,
    bookings: 142,
    passengers: 568,
    avgValue: 2007,
    occupancyRate: 89,
    profitMargin: 35,
    rank: 1
  },
  {
    id: 2,
    name: "Patagonia Adventure",
    category: "Adventure",
    revenue: 265000,
    bookings: 65,
    passengers: 260,
    avgValue: 4077,
    occupancyRate: 92,
    profitMargin: 42,
    rank: 2
  },
  {
    id: 3,
    name: "Iguazu Falls Experience",
    category: "Nature",
    revenue: 248000,
    bookings: 98,
    passengers: 392,
    avgValue: 2531,
    occupancyRate: 85,
    profitMargin: 38,
    rank: 3
  },
  {
    id: 4,
    name: "Wine Country Tour",
    category: "Culinary",
    revenue: 225000,
    bookings: 87,
    passengers: 348,
    avgValue: 2586,
    occupancyRate: 78,
    profitMargin: 45,
    rank: 4
  },
  {
    id: 5,
    name: "Machu Picchu Trek",
    category: "Adventure",
    revenue: 198000,
    bookings: 42,
    passengers: 168,
    avgValue: 4714,
    occupancyRate: 95,
    profitMargin: 40,
    rank: 5
  },
  {
    id: 6,
    name: "Rio de Janeiro Highlights",
    category: "City Tours",
    revenue: 185000,
    bookings: 78,
    passengers: 312,
    avgValue: 2372,
    occupancyRate: 82,
    profitMargin: 33,
    rank: 6
  }
]

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#fb923c', '#22c55e', '#94a3b8', '#f59e0b', '#ef4444']

// Key Performance Indicators
const performanceMetrics = {
  sales: {
    total2025: 1248000,
    total2024: 1055000,
    growth: 18.3,
    avgValue: 2895
  },
  reservations: {
    total2025: 431,
    total2024: 362,
    growth: 19.1
  },
  passengers: {
    total2025: 1724,
    total2024: 1448,
    growth: 19.1
  },
  topSalesperson: salespersonData[0],
  topTour: tourRankingData[0]
}

const ReportsPage = () => {
  const { t } = useLanguage()
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("sales")
  const [yearFilter, setYearFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Helper function to get ranking badge color
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 hover:bg-yellow-600"
    if (rank === 2) return "bg-gray-400 hover:bg-gray-500"
    if (rank === 3) return "bg-amber-600 hover:bg-amber-700"
    return "bg-blue-500 hover:bg-blue-600"
  }

  // Helper function to get performance color
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-600"
    if (value >= 80) return "text-blue-600"
    if (value >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            {t('reports.print')}
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            {t('reports.share')}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            {t('reports.exportReport')}
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('reports.salesReport')}
          </TabsTrigger>
          <TabsTrigger value="salesperson" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('reports.salespersonRanking')}
          </TabsTrigger>
          <TabsTrigger value="tours" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('reports.tourRanking')}
          </TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6">
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
        </TabsContent>

        {/* Salesperson Ranking Tab */}
        <TabsContent value="salesperson" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers Cards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {t('reports.salespersonPerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('reports.rank')}</TableHead>
                        <TableHead>{t('reports.salesperson')}</TableHead>
                        <TableHead>{t('reports.sales')}</TableHead>
                        <TableHead>{t('reports.reservations')}</TableHead>
                        <TableHead>{t('reports.passengers')}</TableHead>
                        <TableHead>{t('reports.avgValue')}</TableHead>
                        <TableHead>{t('reports.performance')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salespersonData.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>
                            <Badge className={getRankBadgeColor(person.rank)}>
                              {person.rank === 1 && <Medal className="w-3 h-3 mr-1" />}
                              {person.rank === 2 && <Award className="w-3 h-3 mr-1" />}
                              {person.rank === 3 && <Star className="w-3 h-3 mr-1" />}
                              #{person.rank}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{person.name}</TableCell>
                          <TableCell className="font-semibold">${person.sales.toLocaleString()}</TableCell>
                          <TableCell>{person.reservations}</TableCell>
                          <TableCell>{person.passengers}</TableCell>
                          <TableCell>${person.avgValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={person.performance} className="w-16 h-2" />
                              <span className={`text-sm font-medium ${getPerformanceColor(person.performance)}`}>
                                {person.performance}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sales Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t('reports.salesDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salespersonData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name.split(' ')[0]} $${(value / 1000).toFixed(0)}k`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sales"
                    >
                      {salespersonData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                {t('reports.performanceRadar')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  {
                    subject: t('reports.salesVolume'),
                    A: (salespersonData[0].sales / salespersonData[0].sales) * 100,
                    B: (salespersonData[1].sales / salespersonData[0].sales) * 100,
                    C: (salespersonData[2].sales / salespersonData[0].sales) * 100,
                  },
                  {
                    subject: t('reports.reservationCount'),
                    A: (salespersonData[0].reservations / salespersonData[0].reservations) * 100,
                    B: (salespersonData[1].reservations / salespersonData[0].reservations) * 100,
                    C: (salespersonData[2].reservations / salespersonData[0].reservations) * 100,
                  },
                  {
                    subject: t('reports.passengerCount'),
                    A: (salespersonData[0].passengers / salespersonData[0].passengers) * 100,
                    B: (salespersonData[1].passengers / salespersonData[0].passengers) * 100,
                    C: (salespersonData[2].passengers / salespersonData[0].passengers) * 100,
                  },
                  {
                    subject: t('reports.avgBookingValue'),
                    A: (salespersonData[0].avgValue / salespersonData[0].avgValue) * 100,
                    B: (salespersonData[1].avgValue / salespersonData[0].avgValue) * 100,
                    C: (salespersonData[2].avgValue / salespersonData[0].avgValue) * 100,
                  },
                  {
                    subject: t('reports.performance'),
                    A: salespersonData[0].performance,
                    B: salespersonData[1].performance,
                    C: salespersonData[2].performance,
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name={salespersonData[0].name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name={salespersonData[1].name} dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Radar name={salespersonData[2].name} dataKey="C" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tour Ranking Tab */}
        <TabsContent value="tours" className="space-y-6">
          {/* Period Selection Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{t('reports.toursByRevenue')}</h2>
              <p className="text-sm text-muted-foreground">{t('reports.tourRankingDescription')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select defaultValue="year">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('reports.thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
                  <SelectItem value="quarter">{t('reports.thisQuarter')}</SelectItem>
                  <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
                  <SelectItem value="custom">{t('reports.customPeriod')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tours Revenue Ranking Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {t('reports.topRevenueGeneratingTours')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t('reports.rank')}</TableHead>
                        <TableHead>{t('reports.tour')}</TableHead>
                        <TableHead className="text-right">{t('reports.totalRevenue')}</TableHead>
                        <TableHead className="text-center">{t('reports.bookings')}</TableHead>
                        <TableHead className="text-center">{t('reports.passengers')}</TableHead>
                        <TableHead className="text-right">{t('reports.avgReservationValue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tourRankingData.map((tour) => (
                        <TableRow key={tour.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Badge className={getRankBadgeColor(tour.rank)} variant="default">
                              {tour.rank === 1 && <Medal className="w-3 h-3 mr-1" />}
                              {tour.rank === 2 && <Award className="w-3 h-3 mr-1" />}
                              {tour.rank === 3 && <Star className="w-3 h-3 mr-1" />}
                              #{tour.rank}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{tour.name}</div>
                              <Badge variant="outline" className="text-xs">{tour.category}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${tour.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">{tour.bookings}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">{tour.passengers}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">${tour.avgValue.toLocaleString()}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Tour Revenue Contribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {t('reports.revenueContribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={tourRankingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {tourRankingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `$${value.toLocaleString()}`,
                        props.payload.name
                      ]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value: any, entry: any) => (
                        <span className="text-xs">{entry.payload.name}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalTourRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${tourRankingData.reduce((sum, tour) => sum + tour.revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {tourRankingData.length} {t('reports.activeTours')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalBookings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tourRankingData.reduce((sum, tour) => sum + tour.bookings, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('reports.acrossAllTours')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.totalPassengers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tourRankingData.reduce((sum, tour) => sum + tour.passengers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('reports.allToursCombined')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('reports.overallAvgValue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round(
                    tourRankingData.reduce((sum, tour) => sum + tour.revenue, 0) /
                    tourRankingData.reduce((sum, tour) => sum + tour.bookings, 0)
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('reports.perReservation')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsPage