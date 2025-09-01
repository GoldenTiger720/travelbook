import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SalesReportTab from "@/components/ReportsPage/SalesReportTab"
import SalespersonRankingTab from "@/components/ReportsPage/SalespersonRankingTab"
import TourRankingTab from "@/components/ReportsPage/TourRankingTab"
import {
  Download,
  MapPin,
  Printer,
  Share2,
  BarChart3,
  Users
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
          <SalesReportTab
            salesComparison={salesComparison}
            performanceMetrics={performanceMetrics}
          />
        </TabsContent>

        {/* Salesperson Ranking Tab */}
        <TabsContent value="salesperson" className="space-y-6">
          <SalespersonRankingTab
            salespersonData={salespersonData}
            COLORS={COLORS}
          />
        </TabsContent>

        {/* Tour Ranking Tab */}
        <TabsContent value="tours" className="space-y-6">
          <TourRankingTab
            tourRankingData={tourRankingData}
            COLORS={COLORS}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsPage