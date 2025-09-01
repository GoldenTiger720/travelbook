import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { MoreVertical } from 'lucide-react'

interface PayablesTabProps {
  payablesWithWorkflow: any[]
  formatCurrency: (amount: number, currency?: string) => string
}

const PayablesTab: React.FC<PayablesTabProps> = ({
  payablesWithWorkflow,
  formatCurrency,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Bill ID</TableHead>
                  <TableHead className="min-w-[150px]">Supplier</TableHead>
                  <TableHead className="min-w-[120px]">PO Number</TableHead>
                  <TableHead className="min-w-[120px]">Reservation</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Due Date</TableHead>
                  <TableHead className="min-w-[150px]">Approval</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payablesWithWorkflow.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {item.poNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {item.reservationId}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.approvalFlow.map((approval: any, idx: number) => (
                          <Badge
                            key={idx}
                            variant={approval.status === 'approved' ? 'success' : 'default'}
                            className="text-xs"
                          >
                            L{approval.level}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'paid' ? 'success' :
                        item.status === 'approved' ? 'default' :
                        'secondary'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Attachments</DropdownMenuItem>
                          <DropdownMenuItem>Approve Payment</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Dispute</DropdownMenuItem>
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
    </div>
  )
}

export default PayablesTab