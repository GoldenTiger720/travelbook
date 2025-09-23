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

// Mock data for users
const usersData = [
  {
    id: 1,
    login: "mgarcía",
    name: "María García",
    email: "maria.garcia@zenithtravel.com",
    phone: "+1 (555) 123-4567",
    role: "administrator",
    supervisor: "Admin",
    agency: "Internal",
    commission: 15.0,
    status: "active",
    lastLogin: "2024-01-15 14:30",
    avatar: null
  },
  {
    id: 2,
    login: "crodriguez",
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@zenithtravel.com",
    phone: "+1 (555) 234-5678",
    role: "salesperson",
    supervisor: "María García",
    agency: "Travel Plus",
    commission: 12.5,
    status: "active",
    lastLogin: "2024-01-15 16:45",
    avatar: null
  },
  {
    id: 3,
    login: "asilva",
    name: "Ana Silva",
    email: "ana.silva@zenithtravel.com",
    phone: "+1 (555) 345-6789",
    role: "salesperson",
    supervisor: "Carlos Rodriguez",
    agency: "World Tours",
    commission: 10.0,
    status: "active",
    lastLogin: "2024-01-15 09:15",
    avatar: null
  },
  {
    id: 4,
    login: "lmartinez",
    name: "Luis Martinez",
    email: "luis.martinez@zenithtravel.com",
    phone: "+1 (555) 456-7890",
    role: "driver",
    supervisor: "Carlos Rodriguez",
    agency: "Internal",
    commission: 8.0,
    status: "inactive",
    lastLogin: "2024-01-10 11:20",
    avatar: null
  },
  {
    id: 5,
    login: "sgonzalez",
    name: "Sofia Gonzalez",
    email: "sofia.gonzalez@zenithtravel.com",
    phone: "+1 (555) 567-8901",
    role: "salesperson",
    supervisor: "María García",
    agency: "Adventure Agency",
    commission: 11.0,
    status: "active",
    lastLogin: "2024-01-15 13:10",
    avatar: null
  },
  {
    id: 6,
    login: "tandrade",
    name: "Thiago Andrade",
    email: "thiago.andrade@zenithtravel.com",
    phone: "+1 (555) 678-9012",
    role: "salesperson",
    supervisor: "María García",
    agency: "Internal",
    commission: 14.0,
    status: "active",
    lastLogin: "2024-01-15 18:20",
    avatar: null
  },
  {
    id: 7,
    login: "jrodriguez",
    name: "Juan Rodriguez",
    email: "juan.rodriguez@zenithtravel.com",
    phone: "+1 (555) 789-0123",
    role: "salesperson",
    supervisor: "María García",
    agency: "Sunset Travel",
    commission: 13.0,
    status: "active",
    lastLogin: "2024-01-15 17:45",
    avatar: null
  },
  {
    id: 8,
    login: "amartinez",
    name: "Ana Martinez",
    email: "ana.martinez@zenithtravel.com",
    phone: "+1 (555) 890-1234",
    role: "salesperson",
    supervisor: "María García",
    agency: "Internal",
    commission: 15.5,
    status: "active",
    lastLogin: "2024-01-15 16:30",
    avatar: null
  }
]

const UsersTab: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.login.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      administrator: { color: "bg-red-500", label: "Admin" },
      salesperson: { color: "bg-blue-500", label: "Sales" },
      agency: { color: "bg-purple-600", label: "Agency" },
      supersalesperson: { color: "bg-blue-600", label: "SuperSales" },
      "external agency": { color: "bg-purple-500", label: "External" },
      "post-sale": { color: "bg-teal-500", label: "Post-Sale" },
      supervision: { color: "bg-indigo-500", label: "Supervision" },
      guide: { color: "bg-green-500", label: "Guide" },
      driver: { color: "bg-orange-500", label: "Driver" }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: "bg-gray-500", label: role }
    
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80 text-xs px-1.5 py-0`}>
        {config.label}
      </Badge>
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
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="supersalesperson">SuperSalesperson</SelectItem>
                        <SelectItem value="external agency">External agency</SelectItem>
                        <SelectItem value="post-sale">Post-Sale</SelectItem>
                        <SelectItem value="supervision">Supervision</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Export Buttons Section */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <div className="grid grid-cols-3 sm:flex gap-2">
                  <Button variant="outline" size="sm" className="bg-green-50 hover:text-black text-green-700 border-green-200 text-xs px-3 py-2 h-9">
                    <Download className="w-3 h-3 mr-1" />
                    <span className="truncate">Excel</span>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-red-50 hover:text-black text-red-700 border-red-200 text-xs px-3 py-2 h-9">
                    <FileDown className="w-3 h-3 mr-1" />
                    <span className="truncate">PDF</span>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-50 hover:text-black text-blue-700 border-blue-200 text-xs px-3 py-2 h-9">
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
                          user.status === 'active' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Check className={`h-4 w-4 ${
                            user.status === 'active' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{user.name}</div>
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
                          <span className="truncate block min-w-0" title={user.phone}>{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">{user.commission}%</TableCell>
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
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
                      user.status === 'active' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Check className={`h-5 w-5 ${
                        user.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{user.name}</div>
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
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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
                      <span className="truncate min-w-0" title={user.phone}>{user.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <div className="flex justify-end">
                  <span className="font-medium text-foreground text-sm">
                    Commission: {user.commission}%
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
              <Input id="newName" placeholder="Full Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email</Label>
              <Input id="newEmail" type="email" placeholder="user@zenithtravel.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPhone">Phone</Label>
              <Input id="newPhone" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password</Label>
              <Input id="newPassword" type="text" placeholder="Enter password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRole">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="salesperson">Salesperson</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCommission">Commission (%)</Label>
              <Input id="newCommission" type="number" placeholder="10.0" step="0.1" />
            </div>
            <div className="space-y-2 sm:col-span-2 flex items-center justify-between pt-6">
              <Label htmlFor="newStatus">Active User</Label>
              <Switch id="newStatus" defaultChecked />
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
              onClick={() => setShowNewUserDialog(false)}
              className="w-full sm:w-auto"
            >
              Create User
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
                <Input id="editName" defaultValue={selectedUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" defaultValue={selectedUser.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input id="editPhone" defaultValue={selectedUser.phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPassword">Password</Label>
                <Input id="editPassword" type="text" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCommission">Commission (%)</Label>
                <Input id="editCommission" type="number" defaultValue={selectedUser.commission} step="0.1" />
              </div>
              <div className="space-y-2 sm:col-span-2 flex items-center justify-between pt-6">
                <Label htmlFor="editStatus">Active User</Label>
                <Switch id="editStatus" defaultChecked={selectedUser.status === 'active'} />
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
              onClick={() => setShowEditDialog(false)}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersTab