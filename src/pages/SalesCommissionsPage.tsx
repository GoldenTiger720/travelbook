import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CalendarIcon,
  Search,
  Filter,
  Download,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  FileText,
  AlertTriangle,
  Truck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { commissionService } from '@/services/commissionService'
import {
  Commission,
  CommissionFilters,
  CommissionSummary,
  OperatorPayment,
  OperatorSummary,
  CommissionClosing,
  CloseCommissionsRequest,
  CloseOperatorPaymentsRequest,
  FinancialForecast,
  AdjustmentRequest
} from '@/types/commission'
import { useUsers } from '@/lib/hooks/useUsers'
import { useCurrentUser } from '@/lib/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Textarea } from '@/components/ui/textarea'

type TabType = 'open-salespeople' | 'closed-salespeople' | 'open-operators' | 'closed-operators'

const SalesCommissionsPage = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.isSuperuser || currentUser?.role === 'administrator'
  const [activeTab, setActiveTab] = useState<TabType>('open-salespeople')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedClosings, setExpandedClosings] = useState<Set<string>>(new Set())
  const [closingItems, setClosingItems] = useState<Record<string, (Commission | OperatorPayment)[]>>({})
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showClosingDialog, setShowClosingDialog] = useState(false)
  const [showUndoDialog, setShowUndoDialog] = useState(false)
  const [selectedClosing, setSelectedClosing] = useState<CommissionClosing | null>(null)
  const [undoReason, setUndoReason] = useState('')
  const [adjustments, setAdjustments] = useState<Record<string, { amount?: number; percentage?: number; notes?: string }>>({})

  const [filters, setFilters] = useState<CommissionFilters>({
    dateType: 'sale',
    searchTerm: ''
  })

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  // Determine if we're on salespeople or operators tab
  const isSalespeopleTab = activeTab === 'open-salespeople' || activeTab === 'closed-salespeople'
  const isClosedTab = activeTab === 'closed-salespeople' || activeTab === 'closed-operators'

  // Construct filter criteria with date range and closed status
  const filterCriteria = useMemo((): CommissionFilters => ({
    ...filters,
    startDate: dateRange.from,
    endDate: dateRange.to,
    isClosed: isClosedTab
  }), [filters, dateRange, isClosedTab])

  // Fetch extended unique values for filter dropdowns
  const { data: uniqueValues } = useQuery({
    queryKey: ['commissions', 'extended-unique-values'],
    queryFn: () => commissionService.getExtendedUniqueValues(),
    staleTime: 10 * 60 * 1000,
  })

  // Fetch users for salesperson/agency/operator dropdowns
  const { data: users = [] } = useUsers()

  // Filter users by role
  const salespersonUsers = useMemo(() =>
    users.filter(user => user.role === 'salesperson'),
    [users]
  )

  const agencyUsers = useMemo(() =>
    users.filter(user => user.role === 'agency'),
    [users]
  )

  const operatorUsers = useMemo(() =>
    users.filter(user => user.role === 'supplier'),
    [users]
  )

  // Fetch commissions (for salespeople tabs)
  const { data: commissions = [], isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['commissions', 'list', filterCriteria, isSalespeopleTab],
    queryFn: () => commissionService.getFilteredCommissions(filterCriteria),
    enabled: isSalespeopleTab,
    staleTime: 2 * 60 * 1000,
  })

  // Fetch operator payments (for operators tabs)
  const { data: operatorPayments = [], isLoading: isLoadingOperators } = useQuery({
    queryKey: ['commissions', 'operators', filterCriteria, !isSalespeopleTab],
    queryFn: () => commissionService.getOperatorPayments(filterCriteria),
    enabled: !isSalespeopleTab,
    staleTime: 2 * 60 * 1000,
  })

  // Fetch summary
  const { data: summary } = useQuery<CommissionSummary | OperatorSummary>({
    queryKey: ['commissions', 'summary', filterCriteria, isSalespeopleTab],
    queryFn: () => isSalespeopleTab
      ? commissionService.getCommissionSummary()
      : commissionService.getOperatorSummary(filterCriteria),
    staleTime: 2 * 60 * 1000,
  })

  // Fetch closings for closed tabs
  const { data: closings = [] } = useQuery({
    queryKey: ['commissions', 'closings', activeTab],
    queryFn: () => commissionService.getClosings(
      activeTab === 'closed-salespeople' ? 'salesperson' :
      activeTab === 'closed-operators' ? 'operator' : undefined
    ),
    enabled: isClosedTab,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch financial forecast
  const { data: forecast } = useQuery<FinancialForecast>({
    queryKey: ['commissions', 'forecast'],
    queryFn: () => commissionService.getFinancialForecast(),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch pending adjustments (admin only)
  const { data: pendingAdjustments } = useQuery({
    queryKey: ['commissions', 'adjustments', 'pending'],
    queryFn: () => commissionService.getPendingAdjustments('pending'),
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000,
  })

  // Approve adjustment mutation
  const approveAdjustmentMutation = useMutation({
    mutationFn: (adjustmentId: string) => commissionService.approveAdjustment(adjustmentId),
    onSuccess: (data) => {
      toast({
        title: 'Adjustment Approved',
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  // Reject adjustment mutation
  const rejectAdjustmentMutation = useMutation({
    mutationFn: ({ adjustmentId, reason }: { adjustmentId: string; reason: string }) =>
      commissionService.rejectAdjustment(adjustmentId, reason),
    onSuccess: () => {
      toast({
        title: 'Adjustment Rejected',
        description: 'The adjustment request has been rejected.',
      })
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  // Close commissions mutation
  const closeCommissionsMutation = useMutation({
    mutationFn: (request: CloseCommissionsRequest) => commissionService.closeCommissions(request),
    onSuccess: (data) => {
      toast({
        title: 'Commissions Closed',
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      setSelectedItems(new Set())
      setShowClosingDialog(false)
      setAdjustments({})
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  // Close operator payments mutation
  const closeOperatorsMutation = useMutation({
    mutationFn: (request: CloseOperatorPaymentsRequest) => commissionService.closeOperatorPayments(request),
    onSuccess: (data) => {
      toast({
        title: 'Payments Closed',
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      setSelectedItems(new Set())
      setShowClosingDialog(false)
      setAdjustments({})
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  // Undo closing mutation
  const undoClosingMutation = useMutation({
    mutationFn: ({ closingId, reason }: { closingId: string; reason: string }) =>
      commissionService.undoClosing(closingId, reason),
    onSuccess: (data) => {
      toast({
        title: 'Closing Undone',
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      setShowUndoDialog(false)
      setSelectedClosing(null)
      setUndoReason('')
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const loading = isSalespeopleTab ? isLoadingCommissions : isLoadingOperators
  const data = isSalespeopleTab ? commissions : operatorPayments
  const filterOptions = uniqueValues || {
    salespersons: [],
    agencies: [],
    tours: [],
    operators: [],
    commissionStatuses: [],
    logisticStatuses: [],
    paymentStatuses: [],
    reservationStatuses: []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      dateType: 'sale',
      searchTerm: ''
    })
    setDateRange({
      from: undefined,
      to: undefined
    })
  }

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  const toggleClosingExpansion = async (closingId: string) => {
    setExpandedClosings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(closingId)) {
        newSet.delete(closingId)
      } else {
        newSet.add(closingId)
      }
      return newSet
    })

    // Fetch items for this closing if not already loaded
    if (!closingItems[closingId] && !expandedClosings.has(closingId)) {
      try {
        const detail = await commissionService.getClosingDetail(closingId)
        setClosingItems(prev => ({
          ...prev,
          [closingId]: detail.items || []
        }))
      } catch (error) {
        console.error('Failed to fetch closing items:', error)
        toast({
          title: 'Error',
          description: 'Failed to load invoice items',
          variant: 'destructive',
        })
      }
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const selectAllItems = () => {
    // Get only closable items (for operators, filter by canClose; for salespeople, all are closable)
    const closableItems = isSalespeopleTab
      ? data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : data.filter((item: any) => item.canClose !== false)

    if (selectedItems.size === closableItems.length && closableItems.length > 0) {
      setSelectedItems(new Set())
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedItems(new Set(closableItems.map((item: any) => item.id)))
    }
  }

  const getSelectedItemsData = () => {
    if (isSalespeopleTab) {
      return commissions.filter(c => selectedItems.has(c.id))
    }
    return operatorPayments.filter(p => selectedItems.has(p.id))
  }

  const handleCloseSelected = () => {
    if (selectedItems.size === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to close',
        variant: 'destructive',
      })
      return
    }
    setShowClosingDialog(true)
  }

  const confirmClose = () => {
    const selectedData = getSelectedItemsData()

    if (isSalespeopleTab) {
      const selectedCommissions = selectedData as Commission[]
      // Group by salesperson/agency
      const recipientName = selectedCommissions[0]?.salesperson || selectedCommissions[0]?.externalAgency || 'Unknown'
      const closingType = selectedCommissions[0]?.salesperson ? 'salesperson' : 'agency'

      const request: CloseCommissionsRequest = {
        commission_ids: Array.from(selectedItems),
        closing_type: closingType,
        recipient_name: recipientName,
        period_start: dateRange.from?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        period_end: dateRange.to?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        currency: selectedCommissions[0]?.pricing?.currency || 'CLP',
        adjustments: adjustments
      }

      closeCommissionsMutation.mutate(request)
    } else {
      const selectedPayments = selectedData as OperatorPayment[]
      const operatorName = selectedPayments[0]?.operatorName || 'Unknown'

      const request: CloseOperatorPaymentsRequest = {
        payment_ids: Array.from(selectedItems),
        operator_name: operatorName,
        period_start: dateRange.from?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        period_end: dateRange.to?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        currency: selectedPayments[0]?.currency || 'CLP',
        adjustments: adjustments
      }

      closeOperatorsMutation.mutate(request)
    }
  }

  const handleUndoClosing = (closing: CommissionClosing) => {
    setSelectedClosing(closing)
    setShowUndoDialog(true)
  }

  const confirmUndo = () => {
    if (selectedClosing && undoReason) {
      undoClosingMutation.mutate({ closingId: selectedClosing.id, reason: undoReason })
    }
  }

  const handleDownloadInvoice = async (closingId: string) => {
    try {
      await commissionService.downloadInvoice(closingId)
      toast({
        title: 'Invoice Downloaded',
        description: 'The invoice PDF has been downloaded successfully.',
      })
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to download invoice',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { className: 'bg-blue-100 text-blue-800', label: 'Approved' },
      paid: { className: 'bg-green-100 text-green-800', label: 'Paid' },
      cancelled: { className: 'bg-red-100 text-red-800', label: 'Cancelled' },
      confirmed: { className: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      reconfirmed: { className: 'bg-indigo-100 text-indigo-800', label: 'Reconfirmed' },
      completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
      'no-show': { className: 'bg-orange-100 text-orange-800', label: 'No Show' },
    }

    const variant = variants[status] || { className: 'bg-gray-100 text-gray-800', label: status }
    return (
      <Badge className={cn(variant.className, 'text-xs px-1 py-0')}>
        {variant.label}
      </Badge>
    )
  }

  const formatCompactCurrency = (amount: number, currency: string): string => {
    const symbols: { [key: string]: string } = {
      CLP: '$',
      USD: '$',
      EUR: '€',
      BRL: 'R$',
      ARS: '$'
    }

    if (amount >= 1000000) {
      return `${symbols[currency] || ''}${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 10000) {
      return `${symbols[currency] || ''}${Math.round(amount / 1000)}k`
    }
    return `${symbols[currency] || ''}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const calculateSelectedTotal = () => {
    const selectedData = getSelectedItemsData()
    if (isSalespeopleTab) {
      return (selectedData as Commission[]).reduce((sum, c) => {
        // Use adjusted amount if available, otherwise use original
        const adjustedAmount = adjustments[c.id]?.amount
        return sum + (adjustedAmount !== undefined ? adjustedAmount : c.commission.amount)
      }, 0)
    }
    return (selectedData as OperatorPayment[]).reduce((sum, p) => {
      // Use adjusted amount if available, otherwise use original
      const adjustedAmount = adjustments[p.id]?.amount
      return sum + (adjustedAmount !== undefined ? adjustedAmount : p.costAmount)
    }, 0)
  }

  const exportToCSV = () => {
    // Export logic based on current tab
    toast({
      title: 'Export Started',
      description: 'Your CSV file is being generated'
    })
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Commissions</h1>
          <p className="text-sm text-muted-foreground">Manage commissions and operator payments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isClosedTab && selectedItems.size > 0 && (
            <Button
              onClick={handleCloseSelected}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Lock className="w-3 h-3 mr-1" />
              Close ({selectedItems.size})
            </Button>
          )}
          <Button
            onClick={exportToCSV}
            disabled={data.length === 0}
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Forecast Card */}
      {forecast && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Financial Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Expected Income */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected Payments (Commissions)</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {forecast.expected_income.length > 0 ? (
                      forecast.expected_income.map((item, idx) => (
                        <span key={idx} className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatCompactCurrency(item.amount, item.currency)} ({item.count})
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No open commissions</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Forecast Liabilities */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Forecast Liabilities (Operators)</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {forecast.forecast_liabilities.length > 0 ? (
                      forecast.forecast_liabilities.map((item, idx) => (
                        <span key={idx} className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCompactCurrency(item.amount, item.currency)} ({item.count})
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No open payments</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Net Forecast */}
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Payable</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {forecast.net_forecast.length > 0 ? (
                      forecast.net_forecast.map((item, idx) => (
                        <span key={idx} className={cn(
                          "text-sm font-semibold",
                          item.amount >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                        )}>
                          {formatCompactCurrency(Math.abs(item.amount), item.currency)}
                          {item.amount < 0 && " (receivable)"}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No forecast data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Adjustments Card (Admin Only) */}
      {isAdmin && pendingAdjustments && pendingAdjustments.adjustments.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4" />
              Pending Adjustment Requests ({pendingAdjustments.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingAdjustments.adjustments.slice(0, 5).map((adjustment: AdjustmentRequest) => (
                <div key={adjustment.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-xs",
                        adjustment.adjustment_type === 'increase' ? "bg-green-100 text-green-800" :
                        adjustment.adjustment_type === 'reduction' ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {adjustment.adjustment_type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {adjustment.item_type === 'commission' ? 'Commission' : 'Operator Payment'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {adjustment.customer_name} - Requested by {adjustment.requested_by}
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Original:</span>{' '}
                      <span className="line-through">{formatCompactCurrency(adjustment.original_amount, 'CLP')}</span>
                      {' → '}
                      <span className="font-medium">{formatCompactCurrency(adjustment.new_amount, 'CLP')}</span>
                      {' '}
                      <span className={cn(
                        "text-xs",
                        adjustment.adjustment_amount >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        ({adjustment.adjustment_amount >= 0 ? '+' : ''}{formatCompactCurrency(adjustment.adjustment_amount, 'CLP')})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Reason: {adjustment.reason}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => approveAdjustmentMutation.mutate(adjustment.id)}
                            disabled={approveAdjustmentMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:')
                              if (reason) {
                                rejectAdjustmentMutation.mutate({ adjustmentId: adjustment.id, reason })
                              }
                            }}
                            disabled={rejectAdjustmentMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
              {pendingAdjustments.total > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  And {pendingAdjustments.total - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as TabType)
        setSelectedItems(new Set())
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="open-salespeople" className="text-xs sm:text-sm">
            <Unlock className="w-3 h-3 mr-1 hidden sm:inline" />
            Open Salespeople
          </TabsTrigger>
          <TabsTrigger value="closed-salespeople" className="text-xs sm:text-sm">
            <Lock className="w-3 h-3 mr-1 hidden sm:inline" />
            Closed Salespeople
          </TabsTrigger>
          <TabsTrigger value="open-operators" className="text-xs sm:text-sm">
            <Truck className="w-3 h-3 mr-1 hidden sm:inline" />
            Open Operators
          </TabsTrigger>
          <TabsTrigger value="closed-operators" className="text-xs sm:text-sm">
            <Lock className="w-3 h-3 mr-1 hidden sm:inline" />
            Closed Operators
          </TabsTrigger>
        </TabsList>

        {/* Filters Card */}
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Row 1: Date filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Date Type</Label>
                <Select value={filters.dateType} onValueChange={(value) => handleFilterChange('dateType', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale Date</SelectItem>
                    <SelectItem value="operation">Operation Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-8 justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span className="text-xs">
                        {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Select"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-8 justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span className="text-xs">
                        {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Select"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-7 h-8 text-xs"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Entity-specific filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Tour</Label>
                <Select value={filters.tour || 'all'} onValueChange={(value) => handleFilterChange('tour', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tours</SelectItem>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filterOptions.tours.map((tour: any) => (
                      <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isSalespeopleTab ? (
                <>
                  <div>
                    <Label className="text-xs">Salesperson</Label>
                    <Select value={filters.salesperson || 'all'} onValueChange={(value) => handleFilterChange('salesperson', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {salespersonUsers.map((user) => (
                          <SelectItem key={user.id} value={user.full_name}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Agency</Label>
                    <Select value={filters.externalAgency || 'all'} onValueChange={(value) => handleFilterChange('externalAgency', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {agencyUsers.map((user) => (
                          <SelectItem key={user.id} value={user.full_name}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Operator</Label>
                    <Select value={filters.operator || 'all'} onValueChange={(value) => handleFilterChange('operator', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {operatorUsers.map((user) => (
                          <SelectItem key={user.id} value={user.full_name}>{user.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Logistic Status</Label>
                    <Select value={filters.logisticStatus || 'all'} onValueChange={(value) => handleFilterChange('logisticStatus', value === 'all' ? undefined : value)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {filterOptions.logisticStatuses.map((status: any) => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label className="text-xs">Status</Label>
                <Select value={filters.commissionStatus || 'all'} onValueChange={(value) => handleFilterChange('commissionStatus', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filterOptions.commissionStatuses.map((status: any) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Payment Status</Label>
                <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => handleFilterChange('paymentStatus', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filterOptions.paymentStatuses.map((status: any) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Reservation Status</Label>
                <Select value={filters.reservationStatus || 'all'} onValueChange={(value) => handleFilterChange('reservationStatus', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filterOptions.reservationStatuses.map((status: any) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="sm"
                  className="w-full h-8 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Count</p>
                  <p className="text-sm font-bold">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {isSalespeopleTab ? (summary as any).reservationCount : (summary as any).count}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatCompactCurrency(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      isSalespeopleTab ? (summary as any).totalCommissions : (summary as any).totalAmount,
                      'CLP'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-bold text-yellow-600">
                    {formatCompactCurrency(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      isSalespeopleTab ? (summary as any).pendingCommissions : (summary as any).pendingAmount,
                      'CLP'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Selected</p>
                  <p className="text-sm font-bold text-blue-600">
                    {formatCompactCurrency(calculateSelectedTotal(), 'CLP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content for each tab */}
        <TabsContent value={activeTab} className="mt-3">
          {/* Open tabs: Show items table */}
          {!isClosedTab && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Open Items ({data.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-6 text-xs">
                    Loading data...
                  </div>
                ) : data.length === 0 ? (
                  <div className="text-center py-6 text-xs">
                    No records found
                  </div>
                ) : (
                  <TooltipProvider>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox
                              checked={selectedItems.size === data.length && data.length > 0}
                              onCheckedChange={selectAllItems}
                            />
                          </TableHead>
                          <TableHead className="w-[70px] text-xs">Date</TableHead>
                          <TableHead className="w-[90px] text-xs">Reservation</TableHead>
                          <TableHead className="w-[140px] text-xs">Tour</TableHead>
                          <TableHead className="w-[100px] text-xs">Client</TableHead>
                          <TableHead className="w-[100px] text-xs">
                            {isSalespeopleTab ? 'Sales' : 'Operator'}
                          </TableHead>
                          <TableHead className="w-[35px] text-center text-xs">PAX</TableHead>
                          <TableHead className="w-[80px] text-right text-xs">Amount</TableHead>
                          <TableHead className="w-[50px] text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {data.slice(0, 100).map((item: any) => (
                          <React.Fragment key={item.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleRowExpansion(item.id)}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {/* For operators, check canClose property; salespeople can always close */}
                                {!isSalespeopleTab && item.canClose === false ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <Checkbox disabled checked={false} />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Cannot close: Logistic status must be Completed, No-Show, or Cancelled
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onCheckedChange={() => toggleItemSelection(item.id)}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="text-xs">
                                  {format(item.saleDate, 'dd/MM')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(item.operationDate, 'dd/MM')}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {item.reservationNumber?.slice(-7)}
                              </TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs">
                                      <div className="truncate max-w-[130px] font-medium">
                                        {item.tour?.name}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {item.tour?.code}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{item.tour?.name}</p>
                                    <p className="text-xs">{item.tour?.destination}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs">
                                      <div className="truncate max-w-[90px] font-medium">
                                        {item.client?.name?.split(' ')[0]}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {item.client?.country}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{item.client?.name}</p>
                                    <p className="text-xs">{item.client?.email}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="text-xs truncate max-w-[90px]">
                                {isSalespeopleTab
                                  ? (item.salesperson || item.externalAgency || '-')
                                  : item.operatorName
                                }
                              </TableCell>
                              <TableCell className="text-center text-xs font-medium">
                                {item.passengers?.total}
                              </TableCell>
                              <TableCell className="text-right text-xs font-bold text-green-600">
                                {formatCompactCurrency(
                                  isSalespeopleTab ? item.commission?.amount : item.costAmount,
                                  isSalespeopleTab ? item.pricing?.currency : item.currency
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(
                                  isSalespeopleTab
                                    ? item.commission?.status
                                    : (item.logisticStatus || item.status)
                                )}
                              </TableCell>
                            </TableRow>
                            {expandedRows.has(item.id) && (
                              <TableRow>
                                <TableCell colSpan={9} className="bg-muted/30 p-2">
                                  <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <p className="font-semibold mb-1">Passenger Details</p>
                                      <p>Adults: {item.passengers?.adults}</p>
                                      {item.passengers?.children > 0 && (
                                        <p>Children: {item.passengers?.children}</p>
                                      )}
                                      {item.passengers?.infants > 0 && (
                                        <p>Infants: {item.passengers?.infants}</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold mb-1">
                                        {isSalespeopleTab ? 'Financial Details' : 'Payment Details'}
                                      </p>
                                      {isSalespeopleTab ? (
                                        <>
                                          <p>Gross: {commissionService.formatCurrency(item.pricing?.grossTotal, item.pricing?.currency)}</p>
                                          <p>Costs: {commissionService.formatCurrency(item.pricing?.costs, item.pricing?.currency)}</p>
                                          <p>Net: {commissionService.formatCurrency(item.pricing?.netReceived, item.pricing?.currency)}</p>
                                        </>
                                      ) : (
                                        <>
                                          <p>Amount: {commissionService.formatCurrency(item.costAmount, item.currency)}</p>
                                          <p>Operator: {item.operatorName}</p>
                                          <p>Type: {item.operationType}</p>
                                        </>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold mb-1">
                                        {isSalespeopleTab ? 'Commission Info' : 'Status Info'}
                                      </p>
                                      {isSalespeopleTab ? (
                                        <>
                                          <p>Rate: {item.commission?.percentage}%</p>
                                          <p>Amount: {commissionService.formatCurrency(item.commission?.amount, item.pricing?.currency)}</p>
                                        </>
                                      ) : (
                                        <>
                                          <p>Logistic: {item.logisticStatus}</p>
                                          <p>Can Close: {item.canClose ? 'Yes' : 'No'}</p>
                                        </>
                                      )}
                                      {item.notes && <p>Note: {item.notes}</p>}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                )}

                {data.length > 100 && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t">
                    Showing first 100 of {data.length} records
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Closed tabs: Show invoices (closings) with expandable items */}
          {isClosedTab && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Closed Invoices ({closings.filter(c => c.isActive).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-6 text-xs">
                    Loading data...
                  </div>
                ) : closings.filter(c => c.isActive).length === 0 ? (
                  <div className="text-center py-6 text-xs">
                    No closed invoices found
                  </div>
                ) : (
                  <TooltipProvider>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead className="text-xs">Invoice #</TableHead>
                          <TableHead className="text-xs">Recipient</TableHead>
                          <TableHead className="text-xs">Period</TableHead>
                          <TableHead className="text-xs text-center">Items</TableHead>
                          <TableHead className="text-xs text-right">Total</TableHead>
                          <TableHead className="text-xs">Created</TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {closings.filter(c => c.isActive).map((closing) => (
                          <React.Fragment key={closing.id}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleClosingExpansion(closing.id)}
                                >
                                  {expandedClosings.has(closing.id) ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {closing.invoiceNumber}
                              </TableCell>
                              <TableCell className="text-xs">
                                {closing.recipientName}
                              </TableCell>
                              <TableCell className="text-xs">
                                {closing.periodStart} - {closing.periodEnd}
                              </TableCell>
                              <TableCell className="text-xs text-center">
                                {closing.itemCount}
                              </TableCell>
                              <TableCell className="text-xs text-right font-bold text-green-600">
                                {formatCompactCurrency(closing.totalAmount, closing.currency)}
                              </TableCell>
                              <TableCell className="text-xs">
                                {format(new Date(closing.createdAt), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleDownloadInvoice(closing.id)}
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download Invoice</TooltipContent>
                                  </Tooltip>
                                  {isAdmin && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => handleUndoClosing(closing)}
                                        >
                                          <Unlock className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Reopen (Admin Only)</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {/* Expanded items for this closing */}
                            {expandedClosings.has(closing.id) && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/30 p-0">
                                  {!closingItems[closing.id] ? (
                                    <div className="text-center py-4 text-xs text-muted-foreground">
                                      Loading items...
                                    </div>
                                  ) : closingItems[closing.id].length === 0 ? (
                                    <div className="text-center py-4 text-xs text-muted-foreground">
                                      No items found
                                    </div>
                                  ) : (
                                    <div className="p-2">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-muted/50">
                                            <TableHead className="text-xs py-2">Reservation</TableHead>
                                            <TableHead className="text-xs py-2">Tour</TableHead>
                                            <TableHead className="text-xs py-2">Client</TableHead>
                                            <TableHead className="text-xs py-2 text-center">PAX</TableHead>
                                            <TableHead className="text-xs py-2 text-right">Amount</TableHead>
                                            <TableHead className="text-xs py-2">Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                          {closingItems[closing.id].map((item: any) => (
                                            <TableRow key={item.id} className="hover:bg-muted/20">
                                              <TableCell className="text-xs py-2">
                                                <div className="font-medium">{item.reservationNumber?.slice(-7) || item.reservation_number?.slice(-7)}</div>
                                                <div className="text-muted-foreground">
                                                  {format(new Date(item.operationDate || item.operation_date), 'dd/MM/yy')}
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-xs py-2">
                                                <div className="truncate max-w-[120px]">{item.tour?.name}</div>
                                                <div className="text-muted-foreground">{item.tour?.code}</div>
                                              </TableCell>
                                              <TableCell className="text-xs py-2">
                                                <div className="truncate max-w-[100px]">{item.client?.name}</div>
                                                <div className="text-muted-foreground">{item.client?.country}</div>
                                              </TableCell>
                                              <TableCell className="text-xs py-2 text-center">
                                                {item.passengers?.total}
                                              </TableCell>
                                              <TableCell className="text-xs py-2 text-right font-medium text-green-600">
                                                {formatCompactCurrency(
                                                  isSalespeopleTab
                                                    ? (item.commission?.amount || 0)
                                                    : (item.costAmount || item.cost_amount || 0),
                                                  closing.currency
                                                )}
                                              </TableCell>
                                              <TableCell className="text-xs py-2">
                                                {getStatusBadge(
                                                  isSalespeopleTab
                                                    ? item.commission?.status
                                                    : (item.logisticStatus || item.logistic_status || item.status)
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Closing Confirmation Dialog */}
      <Dialog open={showClosingDialog} onOpenChange={setShowClosingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Closing</DialogTitle>
            <DialogDescription>
              You are about to close {selectedItems.size} {isSalespeopleTab ? 'commission(s)' : 'operator payment(s)'}.
              This will generate an invoice and create an entry in Accounts Payable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCompactCurrency(calculateSelectedTotal(), 'CLP')}
                </span>
              </div>
            </div>

            {isAdmin ? (
              <div className="text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-600" />
                You can adjust individual amounts before closing (admin only).
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                <Lock className="w-4 h-4 inline mr-1 text-gray-400" />
                Only administrators can modify amounts before closing.
              </div>
            )}

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Reservation</TableHead>
                    <TableHead className="text-xs">{isSalespeopleTab ? 'Salesperson' : 'Operator'}</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {getSelectedItemsData().map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.reservationNumber}</TableCell>
                      <TableCell className="text-xs">
                        {isSalespeopleTab
                          ? (item.salesperson || item.externalAgency)
                          : item.operatorName
                        }
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {isAdmin ? (
                          <Input
                            type="number"
                            className="h-6 w-24 text-xs text-right"
                            defaultValue={isSalespeopleTab ? item.commission?.amount : item.costAmount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value)
                              setAdjustments(prev => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], amount: isNaN(value) ? 0 : value }
                              }))
                            }}
                          />
                        ) : (
                          <span className="font-medium">
                            {formatCompactCurrency(
                              isSalespeopleTab ? item.commission?.amount : item.costAmount,
                              'CLP'
                            )}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClosingDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmClose}
              disabled={closeCommissionsMutation.isPending || closeOperatorsMutation.isPending}
            >
              {(closeCommissionsMutation.isPending || closeOperatorsMutation.isPending)
                ? 'Processing...'
                : 'Confirm Close'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Closing Dialog */}
      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Closing</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo closing {selectedClosing?.invoiceNumber}?
              This will reopen all {selectedClosing?.itemCount} items and delete the associated expense.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm">Reason for Undo (required)</Label>
              <Textarea
                placeholder="Enter reason for undoing this closing..."
                value={undoReason}
                onChange={(e) => setUndoReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUndoDialog(false)
              setSelectedClosing(null)
              setUndoReason('')
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUndo}
              disabled={!undoReason || undoClosingMutation.isPending}
            >
              {undoClosingMutation.isPending ? 'Processing...' : 'Undo Closing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalesCommissionsPage
