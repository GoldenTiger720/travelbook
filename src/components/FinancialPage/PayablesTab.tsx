import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
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
import type { Payables, Expense, PayableExpense, PayableCommission } from '@/types/financial'

interface PayablesTabProps {
  payables: Payables
  expenses: Expense[]
  formatCurrency: (amount: number, currency?: string) => string
  loading: boolean
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
}

const PayablesTab: React.FC<PayablesTabProps> = ({
  payables,
  expenses,
  formatCurrency,
  loading,
  onAddExpense,
  onEditExpense,
}) => {
  // Ensure expenses is always an array
  const expensesList = Array.isArray(expenses) ? expenses : []
  const commissionsList = Array.isArray(payables?.commissions) ? payables.commissions : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payables...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Expenses</CardTitle>
            <Button size="sm" onClick={onAddExpense}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Due Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No expenses found. Click "Add Expense" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  expensesList.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell className="capitalize">{expense.expense_type}</TableCell>
                      <TableCell className="capitalize">{expense.category.replace('-', ' ')}</TableCell>
                      <TableCell>{formatCurrency(expense.amount, expense.currency)}</TableCell>
                      <TableCell>{expense.due_date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          expense.payment_status === 'paid' ? 'success' :
                          expense.payment_status === 'overdue' ? 'destructive' :
                          expense.payment_status === 'cancelled' ? 'secondary' :
                          'default'
                        }>
                          {expense.payment_status}
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
                            <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                              Edit Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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

      {/* Commissions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[120px]">Booking ID</TableHead>
                  <TableHead className="min-w-[150px]">Salesperson</TableHead>
                  <TableHead className="min-w-[120px]">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Percentage</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No commissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  commissionsList.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.id}</TableCell>
                      <TableCell>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {commission.bookingId || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{commission.salesperson}</TableCell>
                      <TableCell>{formatCurrency(commission.amount, commission.currency)}</TableCell>
                      <TableCell>{commission.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          commission.status === 'paid' ? 'success' :
                          commission.status === 'pending' ? 'default' :
                          'secondary'
                        }>
                          {commission.status}
                        </Badge>
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

export default PayablesTab