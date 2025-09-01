import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Trophy,
  BarChart3,
  Calendar,
  Medal,
  Award,
  Star,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface TourRankingTabProps {
  tourRankingData: any[]
  COLORS: string[]
}

const TourRankingTab: React.FC<TourRankingTabProps> = ({
  tourRankingData,
  COLORS,
}) => {
  const { t } = useLanguage()

  // Helper function to get ranking badge color
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 hover:bg-yellow-600"
    if (rank === 2) return "bg-gray-400 hover:bg-gray-500"
    if (rank === 3) return "bg-amber-600 hover:bg-amber-700"
    return "bg-blue-500 hover:bg-blue-600"
  }

  return (
    <div className="space-y-6">
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
    </div>
  )
}

export default TourRankingTab