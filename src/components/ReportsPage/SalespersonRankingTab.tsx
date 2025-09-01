import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Trophy,
  Target,
  BarChart3,
  Medal,
  Award,
  Star,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SalespersonRankingTabProps {
  salespersonData: any[]
  COLORS: string[]
}

const SalespersonRankingTab: React.FC<SalespersonRankingTabProps> = ({
  salespersonData,
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

  // Helper function to get performance color
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-600"
    if (value >= 80) return "text-blue-600"
    if (value >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
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
    </div>
  )
}

export default SalespersonRankingTab