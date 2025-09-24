import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download } from 'lucide-react'
import type { VehicleFilters } from '@/types/vehicle'

interface VehicleFiltersProps {
  filters: VehicleFilters
  onFiltersChange: (filters: VehicleFilters) => void
  onExport?: () => void
}

const VehicleFiltersComponent: React.FC<VehicleFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  const handleFilterChange = (field: keyof VehicleFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    })
  }

  return (
    <>
      {/* Mobile: Stacked filters */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={filters.statusFilter} onValueChange={(value) => handleFilterChange('statusFilter', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.typeFilter} onValueChange={(value) => handleFilterChange('typeFilter', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onExport && (
          <Button variant="outline" size="sm" className="w-full" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Desktop: Horizontal filters */}
      <div className="hidden sm:flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles, license plates, or models..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.statusFilter} onValueChange={(value) => handleFilterChange('statusFilter', value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.typeFilter} onValueChange={(value) => handleFilterChange('typeFilter', value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </>
  )
}

export default VehicleFiltersComponent