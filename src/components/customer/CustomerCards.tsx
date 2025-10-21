import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, Phone, MapPin, MoreHorizontal } from "lucide-react"
import { getStatusColor } from "./utils"
import { TransformedCustomer } from "./types"

interface CustomerCardsProps {
  customers: TransformedCustomer[]
  onViewDetails: (customer: any) => void
  onEditCustomer: (customer: any) => void
  onDeleteCustomer: (customer: any) => void
}

export const CustomerCards = ({ customers, onViewDetails, onEditCustomer, onDeleteCustomer }: CustomerCardsProps) => {
  return (
    <div className="lg:hidden space-y-4">
      <div className="flex items-center justify-end">
        <span className="text-sm text-muted-foreground">
          {customers.length} customers
        </span>
      </div>
      <div className="space-y-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-sm">
                  <AvatarImage src={customer.avatar} alt={customer.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{customer.name}</h3>
                    <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{customer.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewDetails(customer)}>
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                    Edit customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => onDeleteCustomer(customer)}>
                    Delete customer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
