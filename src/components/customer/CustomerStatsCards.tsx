import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerStat } from "./types"

interface CustomerStatsCardsProps {
  stats: CustomerStat[]
}

export const CustomerStatsCards = ({ stats }: CustomerStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
