import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  Globe,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react'
import { tourOperatorService, TourOperator, TourOperatorFormData } from '@/services/tourOperatorService'
import { useToast } from '@/components/ui/use-toast'
import Swal from 'sweetalert2'

const TourOperatorsManagement: React.FC = () => {
  const { toast } = useToast()
  const [operators, setOperators] = useState<TourOperator[]>([])
  const [filteredOperators, setFilteredOperators] = useState<TourOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingOperator, setEditingOperator] = useState<TourOperator | null>(null)

  // Form state
  const [formData, setFormData] = useState<TourOperatorFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    commission_rate: 0,
  })

  useEffect(() => {
    loadOperators()
  }, [])

  useEffect(() => {
    // Filter operators based on search term
    const filtered = operators.filter(operator =>
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOperators(filtered)
  }, [searchTerm, operators])

  const loadOperators = async () => {
    try {
      setLoading(true)
      const data = await tourOperatorService.getOperators()
      setOperators(data)
      setFilteredOperators(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tour operators',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (operator?: TourOperator) => {
    if (operator) {
      setEditingOperator(operator)
      setFormData({
        name: operator.name,
        contact_person: operator.contact_person || '',
        email: operator.email || '',
        phone: operator.phone || '',
        website: operator.website || '',
        commission_rate: operator.commission_rate,
      })
    } else {
      setEditingOperator(null)
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        website: '',
        commission_rate: 0,
      })
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingOperator(null)
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      website: '',
      commission_rate: 0,
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Company name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingOperator) {
        await tourOperatorService.updateOperator(editingOperator.id, formData)
        toast({
          title: 'Success',
          description: 'Tour operator updated successfully',
        })
      } else {
        await tourOperatorService.createOperator(formData)
        toast({
          title: 'Success',
          description: 'Tour operator created successfully',
        })
      }
      loadOperators()
      handleCloseDialog()
    } catch (error) {
      toast({
        title: 'Error',
        description: editingOperator
          ? 'Failed to update tour operator'
          : 'Failed to create tour operator',
        variant: 'destructive',
      })
    }
  }

  const handleToggleStatus = async (operator: TourOperator) => {
    try {
      await tourOperatorService.toggleOperatorStatus(operator.id, !operator.is_active)
      toast({
        title: 'Success',
        description: `Tour operator ${!operator.is_active ? 'activated' : 'deactivated'} successfully`,
      })
      loadOperators()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update operator status',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (operator: TourOperator) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${operator.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    })

    if (result.isConfirmed) {
      try {
        await tourOperatorService.deleteOperator(operator.id)
        toast({
          title: 'Success',
          description: 'Tour operator deleted successfully',
        })
        loadOperators()
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete tour operator',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Tour Operators Management
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Operator
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search operators by name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Operators Table */}
        {loading ? (
          <div className="text-center py-8">Loading operators...</div>
        ) : filteredOperators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No operators found matching your search' : 'No tour operators added yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{operator.name}</div>
                        {operator.website && (
                          <a
                            href={operator.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {operator.contact_person && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {operator.contact_person}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {operator.email && (
                        <a
                          href={`mailto:${operator.email}`}
                          className="text-sm hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {operator.email}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {operator.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {operator.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        {operator.commission_rate}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {operator.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(operator)}
                          title={operator.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {operator.is_active ? (
                            <XCircle className="w-4 h-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(operator)}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(operator)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingOperator ? 'Edit Tour Operator' : 'Add New Tour Operator'}
              </DialogTitle>
              <DialogDescription>
                {editingOperator
                  ? 'Update the tour operator information below'
                  : 'Enter the details for the new tour operator company'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingOperator ? 'Update' : 'Create'} Operator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default TourOperatorsManagement