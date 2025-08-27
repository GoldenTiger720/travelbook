import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search,
  MapPin,
  Users,
  Clock,
  User,
  Car,
  Calendar
} from "lucide-react"

// Mock services data
const services = [
  {
    id: "S001",
    type: "guide",
    name: "Carlos Martinez",
    tour: "Buenos Aires City Tour",
    date: "2024-01-15",
    passengers: 8,
    duration: "4 hours",
    amount: "$320",
    status: "completed"
  },
  {
    id: "S002", 
    type: "driver",
    name: "Ana Silva",
    tour: "Rio Beach Transfer",
    date: "2024-01-16",
    passengers: 4,
    duration: "2 hours",
    amount: "$180",
    status: "scheduled"
  },
  {
    id: "S003",
    type: "guide", 
    name: "Miguel Rodriguez",
    tour: "Patagonia Trekking",
    date: "2024-01-18",
    passengers: 6,
    duration: "8 hours",
    amount: "$480",
    status: "in-progress"
  },
  {
    id: "S004",
    type: "driver",
    name: "Isabella Costa",
    tour: "Iguazu Falls Tour",
    date: "2024-01-20",
    passengers: 12,
    duration: "6 hours", 
    amount: "$360",
    status: "scheduled"
  }
]

const getServiceIcon = (type: string) => {
  return type === "guide" ? User : Car
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-success text-success-foreground"
    case "in-progress": return "bg-primary text-primary-foreground"
    case "scheduled": return "bg-warning text-warning-foreground"
    case "cancelled": return "bg-destructive text-destructive-foreground"
    default: return "bg-muted text-muted-foreground"
  }
}

const getTypeColor = (type: string) => {
  return type === "guide"
    ? "bg-accent text-accent-foreground"
    : "bg-secondary text-secondary-foreground"
}

const ServicesPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services Management</h1>
          <p className="text-muted-foreground">
            Manage guides, drivers, and tour services
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search services by name, tour, date..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => {
          const ServiceIcon = getServiceIcon(service.type)
          return (
            <Card key={service.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <ServiceIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(service.type)}>
                      {service.type}
                    </Badge>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{service.tour}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{service.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{service.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {service.passengers} passengers
                      </span>
                    </div>
                    <span className="font-semibold text-foreground text-lg">
                      {service.amount}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Duplicate
                  </Button>
                  <Button size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-sm text-muted-foreground">Active Guides</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Car className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-sm text-muted-foreground">Available Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-sm text-muted-foreground">Scheduled Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">45</div>
            <p className="text-sm text-muted-foreground">Tours This Month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ServicesPage