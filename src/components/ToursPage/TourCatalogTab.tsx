import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Plus,
  Search,
  Printer,
  Download,
  MapPin,
  Clock,
  Users,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface TourCatalogTabProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  destinationFilter: string
  setDestinationFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  setShowNewTourDialog: (value: boolean) => void
  setSelectedTour: (tour: any) => void
  setShowEditDialog: (value: boolean) => void
  toursData: any[]
  destinations: string[]
  filteredTours: any[]
}

const TourCatalogTab: React.FC<TourCatalogTabProps> = ({
  searchTerm,
  setSearchTerm,
  destinationFilter,
  setDestinationFilter,
  statusFilter,
  setStatusFilter,
  setShowNewTourDialog,
  setSelectedTour,
  setShowEditDialog,
  toursData,
  destinations,
  filteredTours,
}) => {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />{t('tours.active')}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />{t('tours.inactive')}</Badge>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters and Actions */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('tours.searchTours')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('tours.allDestinations')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tours.allDestinations')}</SelectItem>
                {destinations.map(destination => (
                  <SelectItem key={destination} value={destination}>{destination}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('tours.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tours.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('tours.active')}</SelectItem>
                <SelectItem value="inactive">{t('tours.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowNewTourDialog(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t('tours.newTour')}
          </Button>
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Printer className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('tours.print')}</span>
              <span className="sm:hidden">{t('tours.print')}</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('tours.export')}</span>
              <span className="sm:hidden">{t('tours.export')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tours List - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('tours.tourCatalog')}
            <Badge variant="secondary">{filteredTours.length} {t('tours.tours')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tours.tour')}</TableHead>
                  <TableHead>{t('tours.destination')}</TableHead>
                  <TableHead>{t('tours.status')}</TableHead>
                  <TableHead className="text-center">{t('tours.capacity')}</TableHead>
                  <TableHead>{t('tours.startingPoint')}</TableHead>
                  <TableHead>{t('tours.departureTime')}</TableHead>
                  <TableHead className="text-right">{t('tours.adultPrice')}</TableHead>
                  <TableHead className="text-right">{t('tours.childPrice')}</TableHead>
                  <TableHead className="text-right">{t('tours.costs')}</TableHead>
                  <TableHead className="text-center">{t('tours.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour) => (
                  <TableRow key={tour.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{tour.name}</div>
                        <div className="text-sm text-muted-foreground">{tour.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {tour.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tour.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{tour.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tour.startingPoint}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {tour.departureTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">${tour.adultPrice}</TableCell>
                    <TableCell className="text-right font-medium">${tour.childPrice}</TableCell>
                    <TableCell className="text-right">${tour.costs}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTour(tour)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredTours.map((tour) => (
              <Card key={tour.id} className="p-4 hover:bg-muted/50">
                <div className="space-y-3">
                  {/* Tour Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{tour.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{tour.destination}</span>
                        <Badge className="text-xs">{tour.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTour(tour)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.status')}</span>
                      {getStatusBadge(tour.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.capacity')}</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{tour.capacity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.departureTime')}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{tour.departureTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.adultPrice')}</span>
                      <span className="font-medium">${tour.adultPrice}</span>
                    </div>
                  </div>

                  {/* Starting Point */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('tours.startingPoint')}</span>
                    <span className="text-right flex-1 ml-2">{tour.startingPoint}</span>
                  </div>

                  {/* Prices Row */}
                  <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.childPrice')}</span>
                      <span className="font-medium">${tour.childPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('tours.costs')}</span>
                      <span>${tour.costs}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TourCatalogTab