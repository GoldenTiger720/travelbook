import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, MapPin, Clock, Users, Plus } from "lucide-react"

const mockVehicles = [
  {
    id: 1,
    name: "Bus Mercedes 45 seats",
    capacity: 45,
    status: "available",
    currentLocation: "Terminal Central",
    nextService: "City Tour - 14:00"
  },
  {
    id: 2,
    name: "Van Toyota 12 seats",
    capacity: 12,
    status: "in-service",
    currentLocation: "Airport",
    currentTour: "Airport Transfer"
  },
  {
    id: 3,
    name: "Bus Volvo 50 seats",
    capacity: 50,
    status: "maintenance",
    currentLocation: "Workshop",
    nextService: "Available tomorrow"
  }
]

const mockRoutes = [
  {
    id: 1,
    name: "City Tour Route A",
    duration: "4 hours",
    stops: 8,
    assignedVehicle: "Bus Mercedes 45 seats",
    nextDeparture: "14:00"
  },
  {
    id: 2,
    name: "Airport Transfers",
    duration: "1 hour",
    stops: 2,
    assignedVehicle: "Van Toyota 12 seats",
    status: "active"
  }
]

export default function LogisticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logistics Management</h1>
          <p className="text-muted-foreground">Vehicle fleet and route coordination</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Fleet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Vehicle Fleet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockVehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-card-foreground">{vehicle.name}</h4>
                  <Badge 
                    variant={vehicle.status === 'available' ? 'default' : 
                            vehicle.status === 'in-service' ? 'secondary' : 'destructive'}
                  >
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity: {vehicle.capacity} passengers
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location: {vehicle.currentLocation}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {vehicle.nextService || vehicle.currentTour}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Active Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRoutes.map((route) => (
              <div key={route.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-card-foreground">{route.name}</h4>
                  {route.status === 'active' && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration: {route.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Stops: {route.stops}
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle: {route.assignedVehicle}
                  </div>
                  {route.nextDeparture && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Next departure: {route.nextDeparture}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Car className="w-4 h-4 mr-2" />
              Vehicle Check-in
            </Button>
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Update Location
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Assign Driver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}