import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/LanguageContext"
import { useDashboardData } from "@/hooks/useDashboard"
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Clock,
  AlertTriangle,
  Loader2
} from "lucide-react"
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
  ResponsiveContainer
} from "recharts"

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-success text-success-foreground"
    case "pending": return "bg-warning text-warning-foreground"
    case "quoted": return "bg-secondary text-secondary-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

export function Dashboard() {
  const { t } = useLanguage();
  const { data: dashboardData, isLoading, isError } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Error loading dashboard data</p>
              <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from API response
  const { statusAlerts, metrics: apiMetrics, monthlySales, monthlyReservations, recentReservations } = dashboardData;

  const metrics = [
    {
      title: t('dashboard.totalRevenue'),
      value: apiMetrics.totalRevenue.value,
      change: apiMetrics.totalRevenue.change,
      trend: apiMetrics.totalRevenue.trend,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: t('dashboard.activeReservations'),
      value: apiMetrics.activeReservations.value,
      change: apiMetrics.activeReservations.change,
      trend: apiMetrics.activeReservations.trend,
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: t('dashboard.totalCustomers'),
      value: apiMetrics.totalCustomers.value,
      change: apiMetrics.totalCustomers.change,
      trend: apiMetrics.totalCustomers.trend,
      icon: Users,
      color: "text-accent"
    },
    {
      title: t('dashboard.totalPax'),
      value: apiMetrics.totalPax.value,
      change: apiMetrics.totalPax.change,
      trend: apiMetrics.totalPax.trend,
      icon: Users,
      color: "text-primary"
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="space-y-3">
        {statusAlerts.map((alert) => (
          <Alert key={alert.id} variant={alert.type === "overdue" ? "destructive" : "default"}>
            {alert.type === "overdue" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <AlertTitle className="text-sm sm:text-base">{t(`dashboard.${alert.type === 'overdue' ? 'overduePayment' : 'pendingPayment'}`)}</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm">{alert.description}</span>
              <span className="font-semibold text-sm sm:text-base">{alert.amount}</span>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center mt-1">
                {metric.trend === "up" ? (
                  <ArrowUp className="w-3 h-3 text-success mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-destructive mr-1" />
                )}
                <span className={`text-xs ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {metric.change} {t('dashboard.fromLastYear')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Sales Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {t('dashboard.monthlySalesTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="2023" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="2024" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="2025" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Reservations and PAX Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              {t('dashboard.monthlyReservationsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <BarChart data={monthlyReservations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="reservations" fill="#8884d8" name={t('dashboard.reservations')} />
                  <Bar yAxisId="right" dataKey="pax" fill="#82ca9d" name={t('dashboard.pax')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {t('dashboard.recentReservations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground text-sm">
                        {reservation.customer}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        {reservation.amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getStatusColor(reservation.status)} text-xs`}>
                        {t(`dashboard.${reservation.status}`)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {reservation.pax} {t('dashboard.pax')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reservation.destination} • {reservation.date}
                    </p>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-foreground">
                          {reservation.customer}
                        </span>
                        <Badge className={getStatusColor(reservation.status)}>
                          {t(`dashboard.${reservation.status}`)}
                        </Badge>
                        <Badge variant="outline">
                          {reservation.pax} {t('dashboard.pax')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reservation.destination} • {reservation.date}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-foreground">
                        {reservation.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              {t('dashboard.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm leading-tight text-center">{t('dashboard.viewCalendar')}</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm leading-tight text-center">{t('dashboard.manageCustomers')}</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm leading-tight text-center">{t('dashboard.financialReports')}</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2">
                <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm leading-tight text-center">{t('dashboard.tourServices')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}