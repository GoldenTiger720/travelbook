import React, { useMemo } from 'react'
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
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import authService from '@/services/authService'
import { EditPaymentStatusDialog } from './ReceivablesTab/index'
import { usePaymentAccounts } from '@/lib/hooks/usePaymentAccounts'

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
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
  selectedCurrency: string
  loading: boolean
  onAddRecipe: () => void
}

type SortField = 'id' | 'customerName' | 'amount' | 'dueDate' | 'method' | 'status'
type SortOrder = 'asc' | 'desc' | null

const ReceivablesTab: React.FC<ReceivablesTabProps> = ({
  receivables,
  formatCurrency,
  convertCurrency,
  selectedCurrency,
  loading,
  onAddRecipe,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [methodFilter, setMethodFilter] = React.useState<string>('all')
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(null)
  const [editStatusDialog, setEditStatusDialog] = React.useState<{ open: boolean, receivable: Receivable | null }>({
    open: false,
    receivable: null
  })
  const [newStatus, setNewStatus] = React.useState<string>('')
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch payment accounts for filter dropdown
  const { paymentAccounts } = usePaymentAccounts()

  // Get current user and check permissions
  const currentUser = authService.getCurrentUser()
  const canEditPaymentStatus = currentUser?.role === 'administrator' ||
    currentUser?.role === 'Finance' ||
    currentUser?.isSuperuser

  // Get unique payment methods from receivables data
  const uniquePaymentMethods = useMemo(() => {
    const methods = new Set<string>()
    receivables.forEach(r => {
      if (r.method) methods.add(r.method)
    })
    return Array.from(methods).sort()
  }, [receivables])

  // Calculate financial summary metrics with currency conversion
  const financialSummary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    let overdue = 0
    let dueToday = 0
    let due = 0 // Pending/upcoming
    let received = 0
    let total = 0

    receivables.forEach(item => {
      const rawAmount = Number(item.amount) || 0
      // Convert amount from item's currency to selected currency
      const amount = item.currency && item.currency !== selectedCurrency
        ? convertCurrency(rawAmount, item.currency, selectedCurrency)
        : rawAmount

      total += amount

      const itemDueDate = new Date(item.dueDate)
      itemDueDate.setHours(0, 0, 0, 0)
      const itemDueDateStr = item.dueDate?.split('T')[0] || item.dueDate

      if (item.status === 'paid') {
        received += amount
      } else if (item.status === 'overdue' || (itemDueDate < today && item.status !== 'paid')) {
        overdue += amount
      } else if (itemDueDateStr === todayStr) {
        dueToday += amount
      } else if (item.status === 'pending' || item.status === 'partial') {
        due += amount
      }
    })

    return { overdue, dueToday, due, received, total }
  }, [receivables, selectedCurrency, convertCurrency])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Get sort icon for a field
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="w-4 h-4 ml-1" />
    }
    if (sortOrder === 'desc') {
      return <ArrowDown className="w-4 h-4 ml-1" />
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />
  }

  // Filter and sort receivables
  let filteredReceivables = receivables.filter(r => {
    // Search filter
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter

    // Payment method filter
    const matchesMethod = methodFilter === 'all' || r.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  // Apply sorting
  if (sortField && sortOrder) {
    filteredReceivables = [...filteredReceivables].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle different data types
      if (sortField === 'amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortField === 'dueDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

  // Handle opening edit status dialog
  const handleEditStatus = (receivable: Receivable) => {
    setEditStatusDialog({ open: true, receivable })
    setNewStatus(receivable.status)
  }

  // Handle saving status change
  const handleSaveStatus = () => {
    if (!editStatusDialog.receivable) return

    // TODO: Implement API call to update payment status
    // For now, just show a success message
    toast({
      title: 'Status Updated',
      description: `Payment status for ${editStatusDialog.receivable.customerName} has been updated to ${newStatus}.`
    })

    setEditStatusDialog({ open: false, receivable: null })
    setNewStatus('')
  }

  // Navigate to Edit Reservation page
  const handleEditReservation = (bookingId: string) => {
    navigate(`/reservations/${bookingId}/edit`)
  }

  // Export to CSV
  const exportToCSV = () => {
    try {
      // CSV headers
      const headers = ['ID', 'Customer', 'Amount', 'Currency', 'Due Date', 'Payment Method', 'Status', 'Percentage']

      // CSV rows
      const rows = filteredReceivables.map(item => [
        item.id,
        item.customerName,
        item.amount,
        item.currency,
        item.dueDate,
        item.method,
        item.status,
        item.percentage
      ])

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `receivables_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Success',
        description: 'Receivables exported to CSV successfully'
      })
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to export receivables',
        variant: 'destructive'
      })
    }
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      // Create HTML content for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Receivables Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status-paid { color: green; font-weight: bold; }
            .status-pending { color: orange; font-weight: bold; }
            .status-overdue { color: red; font-weight: bold; }
            .header-info { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Receivables Report</h1>
          <div class="header-info">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Records:</strong> ${filteredReceivables.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `

      filteredReceivables.forEach(item => {
        const statusClass = `status-${item.status}`
        htmlContent += `
              <tr>
                <td>#${item.id}</td>
                <td>${item.customerName}</td>
                <td>${formatCurrency(item.amount, item.currency)}</td>
                <td>${item.dueDate}</td>
                <td>${item.method}</td>
                <td class="${statusClass}">${item.status.toUpperCase()}</td>
              </tr>
        `
      })

      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `

      // Open print dialog with the HTML content
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()

        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print()
          toast({
            title: 'Success',
            description: 'PDF export initiated. Use your browser\'s print dialog to save as PDF.'
          })
        }, 250)
      } else {
        throw new Error('Could not open print window')
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        variant: 'destructive'
      })
    }
  }

  // Handle CSV import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid')
        }

        // Parse CSV (basic implementation)
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
          return values
        })

        toast({
          title: 'Import Preview',
          description: `Found ${data.length} records. Import functionality requires backend API implementation.`
        })

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error importing CSV:', error)
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
  }

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
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-red-700">Overdue</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600">
              {formatCurrency(financialSummary.overdue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-xs sm:text-sm font-medium text-orange-700">Due Today</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-orange-600">
              {formatCurrency(financialSummary.dueToday)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs sm:text-sm font-medium text-yellow-700">Due</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-yellow-600">
              {formatCurrency(financialSummary.due)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-700">Received</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {formatCurrency(financialSummary.received)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700">Total for Period</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-blue-600">
              {formatCurrency(financialSummary.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 sm:w-40 h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-40 sm:w-48 h-8">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              {/* Show unique methods from data */}
              {uniquePaymentMethods.map(method => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
              {/* Also show payment accounts from settings if not already in data */}
              {paymentAccounts
                .filter(acc => !uniquePaymentMethods.includes(acc.accountName))
                .map(account => (
                  <SelectItem key={account.id} value={account.accountName}>
                    {account.accountName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={onAddRecipe}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Recipe</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('id')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      ID
                      {getSortIcon('id')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('customerName')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      Customer
                      {getSortIcon('customerName')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('amount')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      Amount
                      {getSortIcon('amount')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('dueDate')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      Due Date
                      {getSortIcon('dueDate')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('method')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      Payment Method
                      {getSortIcon('method')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-8 px-2 hover:bg-transparent text-black hover:text-black"
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'No receivables found matching your search.' : 'No receivables found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceivables.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditReservation(item.bookingId)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Reservation
                            </DropdownMenuItem>
                            {canEditPaymentStatus && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditStatus(item)}>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Edit Payment Status
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* Edit Payment Status Dialog */}
      <EditPaymentStatusDialog
        open={editStatusDialog.open}
        receivable={editStatusDialog.receivable}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onClose={() => setEditStatusDialog({ open: false, receivable: null })}
        onSave={handleSaveStatus}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}

export default ReceivablesTab