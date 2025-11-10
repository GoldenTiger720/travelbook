import React, { useState } from 'react'
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
  Trash2,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  onDeleteTour: (tour: any) => void
  toursData: any[]
  destinations: string[]
  filteredTours: any[]
  onPrintTours: () => void
  onExportTours: () => void
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
  onDeleteTour,
  toursData,
  destinations,
  filteredTours,
  onPrintTours,
  onExportTours,
}) => {
  const { t } = useLanguage()

  // Sort state
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort icon helper
  const getSortIcon = (field: string) => {
    if (field !== sortField) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 inline" />
    )
  }

  // Sort filtered tours
  const sortedTours = [...filteredTours].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue === undefined || bValue === undefined) return 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />{t('tours.active')}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />{t('tours.inactive')}</Badge>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
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
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onPrintTours}>
              <Printer className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('tours.print')}</span>
              <span className="sm:hidden">{t('tours.print')}</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={onExportTours}>
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
        <CardContent className="p-3 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden xl:block">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    {t('tours.tour')}
                    {getSortIcon('name')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('destination')}
                  >
                    {t('tours.destination')}
                    {getSortIcon('destination')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('capacity')}
                  >
                    {t('tours.capacity')}
                    {getSortIcon('capacity')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('startingPoint')}
                  >
                    {t('tours.startingPoint')}
                    {getSortIcon('startingPoint')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('departureTime')}
                  >
                    {t('tours.departureTime')}
                    {getSortIcon('departureTime')}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('adultPrice')}
                  >
                    {t('tours.adultPrice')}
                    {getSortIcon('adultPrice')}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('childPrice')}
                  >
                    {t('tours.childPrice')}
                    {getSortIcon('childPrice')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('status')}
                  >
                    {t('tours.status')}
                    {getSortIcon('status')}
                  </TableHead>
                  <TableHead className="text-center">{t('tours.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTours.map((tour) => (
                  <TableRow key={tour.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{tour.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tour.code && <span className="mr-2 font-mono">{tour.code}</span>}
                          {tour.category}
                          {tour.duration && <span className="ml-2">• {tour.duration}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {tour.destination}
                      </div>
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
                    <TableCell className="text-right font-medium">
                      {tour.currency || '$'}{tour.adultPrice}
                      {tour.infant_price && tour.infant_price > 0 && (
                        <div className="text-xs text-muted-foreground">Infant: {tour.currency || '$'}{tour.infant_price}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{tour.currency || '$'}{tour.childPrice}</TableCell>
                    <TableCell>
                      {getStatusBadge(tour.status)}
                    </TableCell>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTour(tour)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </div>

          {/* Tablet Table View - Horizontal Scroll */}
          <div className="hidden lg:block xl:hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="min-w-[150px] cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleSort('name')}
                      >
                        {t('tours.tour')}
                        {getSortIcon('name')}
                      </TableHead>
                      <TableHead
                        className="min-w-[120px] cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleSort('destination')}
                      >
                        {t('tours.destination')}
                        {getSortIcon('destination')}
                      </TableHead>
                      <TableHead
                        className="min-w-[80px] text-center cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleSort('capacity')}
                      >
                        {t('tours.capacity')}
                        {getSortIcon('capacity')}
                      </TableHead>
                      <TableHead
                        className="min-w-[100px] text-right cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleSort('adultPrice')}
                      >
                        {t('tours.adultPrice')}
                        {getSortIcon('adultPrice')}
                      </TableHead>
                      <TableHead
                        className="min-w-[100px] cursor-pointer hover:bg-muted transition-colors select-none"
                        onClick={() => handleSort('status')}
                      >
                        {t('tours.status')}
                        {getSortIcon('status')}
                      </TableHead>
                      <TableHead className="min-w-[120px] text-center">{t('tours.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTours.map((tour) => (
                      <TableRow key={tour.id} className="hover:bg-muted/50">
                        <TableCell className="min-w-[150px]">
                          <div>
                            <div className="font-medium truncate">{tour.name}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {tour.code && <span className="mr-1 font-mono">{tour.code}</span>}
                              {tour.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{tour.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[80px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{tour.capacity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] text-right font-medium">{tour.currency || '$'}{tour.adultPrice}</TableCell>
                        <TableCell className="min-w-[100px]">
                          {getStatusBadge(tour.status)}
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="flex items-center justify-center gap-1">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteTour(tour)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {sortedTours.map((tour) => (
              <Card key={tour.id} className="p-3 sm:p-4 hover:bg-muted/50">
                <div className="space-y-2 sm:space-y-3">
                  {/* Tour Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{tour.name}</h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">{tour.destination}</span>
                        <Badge className="text-xs flex-shrink-0">{tour.category}</Badge>
                        {tour.duration && <Badge variant="outline" className="text-xs flex-shrink-0">{tour.duration}</Badge>}
                      </div>
                      {tour.code && (
                        <div className="text-xs text-muted-foreground font-mono mt-1">Code: {tour.code}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedTour(tour)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteTour(tour)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground truncate">{t('tours.status')}</span>
                      <div className="flex-shrink-0">{getStatusBadge(tour.status)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground truncate">{t('tours.capacity')}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="font-medium">{tour.capacity}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground truncate">{t('tours.departureTime')}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="truncate">{tour.departureTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground truncate">{t('tours.adultPrice')}</span>
                      <span className="font-medium flex-shrink-0">{tour.currency || '$'}{tour.adultPrice}</span>
                    </div>
                  </div>

                  {/* Starting Point */}
                  <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-muted-foreground flex-shrink-0">{t('tours.startingPoint')}</span>
                    <span className="text-right truncate max-w-[60%]">{tour.startingPoint}</span>
                  </div>

                  {/* Prices Row */}
                  <div className="text-xs sm:text-sm border-t pt-2 sm:pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground truncate">{t('tours.childPrice')}</span>
                      <span className="font-medium flex-shrink-0">{tour.currency || '$'}{tour.childPrice}</span>
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