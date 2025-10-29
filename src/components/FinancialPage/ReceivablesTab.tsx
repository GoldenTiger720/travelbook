import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Upload,
  Download,
  Plus,
  Eye,
} from 'lucide-react'

interface Receivable {
  id: number
  bookingId: string
  customerName: string
  amount: number
  currency: string
  dueDate: string
  status: string
  method: string
  percentage: number
}

interface ReceivablesTabProps {
  receivables: Receivable[]
  formatCurrency: (amount: number, currency?: string) => string
  loading: boolean
  onAddInvoice: () => void
}

const ReceivablesTab: React.FC<ReceivablesTabProps> = ({
  receivables,
  formatCurrency,
  loading,
  onAddInvoice,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')

  // Filter receivables by search term
  const filteredReceivables = receivables.filter(r =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading receivables...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 sm:w-64 h-8"
            />
          </div>
          <Select value="all">
            <SelectTrigger className="w-32 sm:w-40 h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={onAddInvoice}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="min-w-[120px]">Booking ID</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Due Date</TableHead>
                  <TableHead className="min-w-[100px]">Payment Method</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'No receivables found matching your search.' : 'No receivables found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceivables.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {item.bookingId}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell className="capitalize">{item.method}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'paid' ? 'success' :
                          item.status === 'overdue' ? 'destructive' :
                          item.status === 'pending' ? 'default' :
                          'secondary'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Record Payment</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Mark as Overdue</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReceivablesTab