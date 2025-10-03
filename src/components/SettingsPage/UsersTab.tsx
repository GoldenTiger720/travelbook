import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  FileDown,
  Printer,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Check,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  User,
  CreateUserData,
  UpdateUserData
} from '@/lib/hooks/useUsers'
import {
  exportUsersToExcel,
  exportUsersToPDF,
  printUsers
} from '@/lib/utils/exportUtils'

// Form data interfaces
interface NewUserFormData {
  full_name: string  // Updated to match API
  email: string
  phone: string
  role: string
  commission: number
  status: boolean
}

const UsersTab: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // ReactQuery hooks
  const { data: users = [], isLoading, isError } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  // Form state for new user
  const [newUserData, setNewUserData] = useState<NewUserFormData>({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    commission: 0,
    status: true
  })

  // Form state for edit user
  const [editUserData, setEditUserData] = useState<Partial<User>>({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    commission: 0,
    status: 'Active'
  })

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.login?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter || !user.role // Include users without role when "all" is selected
    const matchesStatus = statusFilter === "all" || user.status === statusFilter || !user.status // Include users without status when "all" is selected

    return matchesSearch && matchesRole && matchesStatus
  })

  // Handle create user
  const handleCreateUser = () => {
    const createData: CreateUserData = {
      full_name: newUserData.full_name,
      email: newUserData.email,
      phone: newUserData.phone,
      role: newUserData.role,
      commission: newUserData.commission,
      status: newUserData.status ? 'Active' : 'Inactive'
    }

    createUserMutation.mutate(createData, {
      onSuccess: () => {
        // Reset form and close dialog
        setNewUserData({
          full_name: '',
          email: '',
          phone: '',
          role: '',
          commission: 0,
          status: true
        })
        setShowNewUserDialog(false)
      }
    })
  }

  // Handle update user
  const handleUpdateUser = () => {
    if (!selectedUser || !editUserData.full_name) return

    const updateData: UpdateUserData & { id: string } = {
      id: selectedUser.id,
      full_name: editUserData.full_name,
      email: editUserData.email || '',
      phone: editUserData.phone || '',
      role: editUserData.role || '',
      commission: editUserData.commission || 0,
      status: editUserData.status || 'Active'
    }

    updateUserMutation.mutate(updateData, {
      onSuccess: () => {
        setShowEditDialog(false)
        setSelectedUser(null)
      }
    })
  }

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId)
  }

  // Export handlers
  const handleExportToExcel = () => {
    try {
      exportUsersToExcel(filteredUsers)
    } catch (error) {
      console.error('Excel export failed:', error)
    }
  }

  const handleExportToPDF = async () => {
    try {
      await exportUsersToPDF(filteredUsers)
    } catch (error) {
      console.error('PDF export failed:', error)
    }
  }

  const handlePrint = () => {
    try {
      printUsers(filteredUsers)
    } catch (error) {
      console.error('Print failed:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      administrator: { color: "bg-red-500", label: "Administrator" },
      salesperson: { color: "bg-blue-500", label: "Sales person" },
      agency: { color: "bg-purple-600", label: "Agency" },
      assistant_guide: { color: "bg-blue-600", label: "Assistant guide" },
      guide: { color: "bg-green-500", label: "Main guide" },
      driver: { color: "bg-orange-500", label: "Driver" }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: "bg-gray-500", label: role }
    
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80 text-xs px-1.5 py-0`}>
        {config.label}
      </Badge>
    )
  }



  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">Error loading users. Please try again.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="truncate">User Management</span>
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowNewUserDialog(true)}
                
                className="w-full sm:w-auto shrink-0"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New User</span>
                <span className="sm:hidden">Add User</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-4">
              {/* Filters Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="text-sm h-9">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                        <SelectItem value="salesperson">Sales person</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="assistant_guide">Assistant guide</SelectItem>
                        <SelectItem value="guide">Main guide</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="text-sm h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Export Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <div className="grid grid-cols-3 sm:flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:text-black text-green-700 border-green-200 text-xs px-3 py-2 h-9"
                    onClick={handleExportToExcel}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="truncate">Excel</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 hover:text-black text-red-700 border-red-200 text-xs px-3 py-2 h-9"
                    onClick={handleExportToPDF}
                  >
                    <FileDown className="w-3 h-3 mr-1" />
                    <span className="truncate">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 hover:text-black text-blue-700 border-blue-200 text-xs px-3 py-2 h-9"
                    onClick={handlePrint}
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    <span className="truncate">Print</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">User</TableHead>
                  <TableHead className="w-[32%]">Contact</TableHead>
                  <TableHead className="w-[20%]">Role</TableHead>
                  <TableHead className="w-[12%] text-right">Commission</TableHead>
                  <TableHead className="w-[8%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                          user.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Check className={`h-4 w-4 ${
                            user.status === 'Active' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{user.full_name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-0">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1 text-xs min-w-0">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate block min-w-0" title={user.email}>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs min-w-0">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="truncate block min-w-0" title={user.phone || 'No phone'}>{user.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role ? getRoleBadge(user.role) : <Badge className="bg-gray-500 text-white text-xs px-1.5 py-0">No Role</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">{user.commission ? `${user.commission}%` : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setEditUserData({
                                full_name: user.full_name,
                                email: user.email,
                                phone: user.phone || '',
                                role: user.role || '',
                                commission: user.commission || 0,
                                status: user.status || 'Active'
                              })
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                      user.status === 'Active' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Check className={`h-5 w-5 ${
                        user.status === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{user.full_name}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setEditUserData({
                            full_name: user.full_name,
                            email: user.email,
                            phone: user.phone || '',
                            role: user.role || '',
                            commission: user.commission || 0,
                            status: user.status || 'Active'
                          })
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate min-w-0" title={user.email}>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="truncate min-w-0" title={user.phone || 'No phone'}>{user.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role ? getRoleBadge(user.role) : <Badge className="bg-gray-500 text-white text-xs px-1.5 py-0">No Role</Badge>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <span className="font-medium text-foreground text-sm">
                    Commission: {user.commission ? `${user.commission}%` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New User</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new user to the system with appropriate role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Full Name</Label>
              <Input
                id="newName"
                placeholder="Full Name"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData({...newUserData, full_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="user@zenithtravel.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone</Label>
              <Input
                id="newPhone"
                placeholder="+1 (555) 123-4567"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRole">Role</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value) => setNewUserData({...newUserData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="salesperson">Sales person</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="assistant_guide">Assistant guide</SelectItem>
                  <SelectItem value="guide">Main guide</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCommission">Commission (%)</Label>
              <Input
                id="newCommission"
                type="number"
                placeholder="10.0"
                step="0.1"
                value={newUserData.commission}
                onChange={(e) => setNewUserData({...newUserData, commission: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 flex items-center justify-between pt-6">
              <Label htmlFor="newStatus">Active User</Label>
              <Switch
                id="newStatus"
                checked={newUserData.status}
                onCheckedChange={(checked) => setNewUserData({...newUserData, status: checked})}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNewUserDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit User</DialogTitle>
            <DialogDescription className="text-sm">
              Modify user information, role, and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input
                  id="editName"
                  value={editUserData.full_name || ''}
                  onChange={(e) => setEditUserData({...editUserData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editUserData.email || ''}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editUserData.phone || ''}
                  onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={editUserData.role || ''}
                  onValueChange={(value) => setEditUserData({...editUserData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="salesperson">Sales person</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="assistant_guide">Assistant guide</SelectItem>
                    <SelectItem value="guide">Main guide</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCommission">Commission (%)</Label>
                <Input
                  id="editCommission"
                  type="number"
                  step="0.1"
                  value={editUserData.commission || 0}
                  onChange={(e) => setEditUserData({...editUserData, commission: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 flex items-center justify-between pt-6">
                <Label htmlFor="editStatus">Active User</Label>
                <Switch
                  id="editStatus"
                  checked={editUserData.status === 'Active'}
                  onCheckedChange={(checked) => setEditUserData({...editUserData, status: checked ? 'Active' : 'Inactive'})}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersTab