import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
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
    role: "agency",
    supervisor: "María García",
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
    role: "guide",
    supervisor: "Carlos Rodriguez",
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
    role: "agency",
    supervisor: "María García",
    commission: 11.0,
    status: "active",
    lastLogin: "2024-01-15 13:10",
    avatar: null
  }
]

const UsersTab: React.FC = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.login.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      administrator: { color: "bg-red-500", label: "Administrator" },
      agency: { color: "bg-blue-500", label: "Agency" },
      guide: { color: "bg-green-500", label: "Guide" },
      driver: { color: "bg-orange-500", label: "Driver" }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: "bg-gray-500", label: role }
    
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80`}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" className="sm:w-auto">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead className="text-right">Commission %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">@{user.login}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>{user.supervisor}</TableCell>
                    <TableCell className="text-right font-medium">{user.commission}%</TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
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
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Reset Password
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
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">@{user.login}</div>
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
                      <DropdownMenuItem>
                        <Shield className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div>
                      {getRoleBadge(user.role)}
                    </div>
                    <div>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Supervisor: <span className="font-medium">{user.supervisor}</span>
                  </span>
                  <span className="font-medium">
                    Commission: {user.commission}%
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last login: {user.lastLogin}
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
              <Label htmlFor="newLogin">Login Username</Label>
              <Input id="newLogin" placeholder="username" />
            </div>
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
              <Label htmlFor="newRole">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSupervisor">Supervisor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">María García</SelectItem>
                  <SelectItem value="carlos">Carlos Rodriguez</SelectItem>
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
                <Label htmlFor="editLogin">Login Username</Label>
                <Input id="editLogin" defaultValue={selectedUser.login} />
              </div>
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
                <Label htmlFor="editRole">Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupervisor">Supervisor</Label>
                <Select defaultValue={selectedUser.supervisor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maría garcía">María García</SelectItem>
                    <SelectItem value="carlos rodriguez">Carlos Rodriguez</SelectItem>
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