import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Filter,
  Calendar,
  Plus,
  MoreVertical,
  MoreHorizontal,
  Table2,
  Layers,
} from 'lucide-react'

interface OperationsTabProps {
  kanbanView: boolean
  setKanbanView: (value: boolean) => void
  receivablesWithInstallments: any[]
  payablesWithWorkflow: any[]
  workflowData: any
  formatCurrency: (amount: number, currency?: string) => string
}

const OperationsTab: React.FC<OperationsTabProps> = ({
  kanbanView,
  setKanbanView,
  receivablesWithInstallments,
  payablesWithWorkflow,
  workflowData,
  formatCurrency,
}) => {
  // Kanban Card Component
  const KanbanCard = ({ item, type }: any) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'destructive' : 'default'}>
            {item.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h4 className="font-medium text-sm mb-1">{item.client || item.supplier}</h4>
        <p className="text-xs text-muted-foreground mb-2">{item.id}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{formatCurrency(item.amount || item.totalAmount, item.currency)}</span>
          <span className="text-xs text-muted-foreground">{item.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={!kanbanView ? "default" : "outline"}
            size="sm"
            onClick={() => setKanbanView(false)}
          >
            <Table2 className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button
            variant={kanbanView ? "default" : "outline"}
            size="sm"
            onClick={() => setKanbanView(true)}
          >
            <Layers className="w-4 h-4 mr-2" />
            Kanban
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Due Dates
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {kanbanView ? (
        // Kanban View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {/* Pending Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Pending</h3>
              <Badge variant="secondary">8</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {receivablesWithInstallments.slice(0, 3).map((item) => (
                  <KanbanCard key={item.id} item={item} type="receivable" />
                ))}
                {payablesWithWorkflow.slice(0, 2).map((item) => (
                  <KanbanCard key={item.id} item={item} type="payable" />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* In Progress Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">In Progress</h3>
              <Badge variant="secondary">5</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {workflowData.reconciliations.map((item: any) => (
                  <Card key={item.id} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <Badge variant="default" className="mb-2">{item.status}</Badge>
                      <h4 className="font-medium text-sm mb-1">Reconciliation {item.id}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.account} • {item.period}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs">{item.items} items</span>
                        <span className="text-xs font-medium">
                          {item.difference === 0 ? 'Balanced' : formatCurrency(Math.abs(item.difference))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Review Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Review</h3>
              <Badge variant="secondary">3</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {workflowData.refunds.map((item: any) => (
                  <Card key={item.id} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <Badge variant="warning" className="mb-2">{item.status}</Badge>
                      <h4 className="font-medium text-sm mb-1">{item.client}</h4>
                      <p className="text-xs text-muted-foreground mb-2">Refund • {item.reason}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">{formatCurrency(item.amount, item.currency)}</span>
                        <span className="text-xs text-muted-foreground">Fee: {formatCurrency(item.fee, item.currency)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Completed Column */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Completed</h3>
              <Badge variant="secondary">12</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <Badge variant="success" className="mb-2">paid</Badge>
                    <h4 className="font-medium text-sm mb-1">Global Tours Ltd</h4>
                    <p className="text-xs text-muted-foreground mb-2">AR004 • Completed</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{formatCurrency(15000, 'EUR')}</span>
                      <span className="text-xs text-green-600">✓ Reconciled</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      ) : (
        // Table View
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Operations Queue</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All pending financial operations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[150px]">Entity</TableHead>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Due Date</TableHead>
                    <TableHead className="min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...receivablesWithInstallments, ...payablesWithWorkflow].map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.client ? 'Receivable' : 'Payable'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.client || item.supplier}</TableCell>
                      <TableCell>{formatCurrency(item.totalAmount || item.amount, item.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'paid' ? 'success' :
                          item.status === 'overdue' ? 'destructive' :
                          item.status === 'approved' ? 'default' :
                          'secondary'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.dueDate || 'N/A'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Process Payment</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OperationsTab