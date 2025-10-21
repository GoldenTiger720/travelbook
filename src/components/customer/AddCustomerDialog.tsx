import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { CustomerFormData, ValidationErrors, BackendErrors } from "./types"
import { getInitialCustomerForm, validateCustomerForm } from "./utils"

interface AddCustomerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (customer: CustomerFormData) => Promise<void>
  isPending: boolean
}

export const AddCustomerDialog = ({ isOpen, onOpenChange, onSubmit, isPending }: AddCustomerDialogProps) => {
  const [customer, setCustomer] = useState<CustomerFormData>(getInitialCustomerForm())
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [backendErrors, setBackendErrors] = useState<BackendErrors>({})

  const handleSubmit = async () => {
    // Clear backend errors
    setBackendErrors({})

    // Validate form
    const errors = validateCustomerForm(customer)
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      await onSubmit(customer)

      // Reset form on success
      setCustomer(getInitialCustomerForm())
      setValidationErrors({})
    } catch (error) {
      console.error('Customer creation error:', error)
    }
  }

  const handleFieldChange = (field: keyof CustomerFormData, value: string) => {
    setCustomer({ ...customer, [field]: value })
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (backendErrors[field]) {
      setBackendErrors(prev => ({ ...prev, [field]: [] }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="sm:inline">Add Customer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer with complete information including personal details, contact info, and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={customer.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                disabled={isPending}
                className={validationErrors.name || backendErrors.name ? 'border-destructive' : ''}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>
              )}
              {backendErrors.name && backendErrors.name.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
            <div>
              <Label htmlFor="id_number">ID/Passport</Label>
              <Input
                id="id_number"
                placeholder="Enter ID or passport number"
                value={customer.id_number}
                onChange={(e) => handleFieldChange('id_number', e.target.value)}
                disabled={isPending}
                className={validationErrors.id_number || backendErrors.id_number ? 'border-destructive' : ''}
              />
              {validationErrors.id_number && (
                <p className="text-xs text-destructive mt-1">{validationErrors.id_number}</p>
              )}
              {backendErrors.id_number && backendErrors.id_number.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={customer.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={isPending}
                className={validationErrors.email || backendErrors.email ? 'border-destructive' : ''}
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>
              )}
              {backendErrors.email && backendErrors.email.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={customer.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                disabled={isPending}
                className={validationErrors.phone || backendErrors.phone ? 'border-destructive' : ''}
              />
              {validationErrors.phone && (
                <p className="text-xs text-destructive mt-1">{validationErrors.phone}</p>
              )}
              {backendErrors.phone && backendErrors.phone.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={customer.language}
                onValueChange={(value) => handleFieldChange('language', value)}
                disabled={isPending}
              >
                <SelectTrigger className={validationErrors.language || backendErrors.language ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.language && (
                <p className="text-xs text-destructive mt-1">{validationErrors.language}</p>
              )}
              {backendErrors.language && backendErrors.language.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
            <div>
              <Label htmlFor="country">Country of origin</Label>
              <Input
                id="country"
                placeholder="Enter country of origin"
                value={customer.country}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                disabled={isPending}
                className={validationErrors.country || backendErrors.country ? 'border-destructive' : ''}
              />
              {validationErrors.country && (
                <p className="text-xs text-destructive mt-1">{validationErrors.country}</p>
              )}
              {backendErrors.country && backendErrors.country.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="Enter CPF (Brazilian tax ID)"
                value={customer.cpf}
                onChange={(e) => handleFieldChange('cpf', e.target.value)}
                disabled={isPending}
                className={validationErrors.cpf || backendErrors.cpf ? 'border-destructive' : ''}
              />
              {validationErrors.cpf && (
                <p className="text-xs text-destructive mt-1">{validationErrors.cpf}</p>
              )}
              {backendErrors.cpf && backendErrors.cpf.map((error, idx) => (
                <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter full address"
              value={customer.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              disabled={isPending}
              className={validationErrors.address || backendErrors.address ? 'border-destructive' : ''}
            />
            {validationErrors.address && (
              <p className="text-xs text-destructive mt-1">{validationErrors.address}</p>
            )}
            {backendErrors.address && backendErrors.address.map((error, idx) => (
              <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
            ))}
          </div>

          <div>
            <Label htmlFor="hotel">Default Hotel/Accommodation</Label>
            <Input
              id="hotel"
              placeholder="Enter hotel or accommodation name"
              value={customer.hotel}
              onChange={(e) => handleFieldChange('hotel', e.target.value)}
              disabled={isPending}
              className={validationErrors.hotel || backendErrors.hotel ? 'border-destructive' : ''}
            />
            {validationErrors.hotel && (
              <p className="text-xs text-destructive mt-1">{validationErrors.hotel}</p>
            )}
            {backendErrors.hotel && backendErrors.hotel.map((error, idx) => (
              <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
            ))}
          </div>

          <div>
            <Label htmlFor="room">Room/Unit Number</Label>
            <Input
              id="room"
              placeholder="Enter room or unit number"
              value={customer.room}
              onChange={(e) => handleFieldChange('room', e.target.value)}
              disabled={isPending}
              className={validationErrors.room || backendErrors.room ? 'border-destructive' : ''}
            />
            {validationErrors.room && (
              <p className="text-xs text-destructive mt-1">{validationErrors.room}</p>
            )}
            {backendErrors.room && backendErrors.room.map((error, idx) => (
              <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
            ))}
          </div>

          <div>
            <Label htmlFor="comments">Accommodation Comments</Label>
            <Textarea
              id="comments"
              placeholder="Enter accommodation comments or special requirements"
              value={customer.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              disabled={isPending}
              className={validationErrors.comments || backendErrors.comments ? 'border-destructive' : ''}
              rows={3}
            />
            {validationErrors.comments && (
              <p className="text-xs text-destructive mt-1">{validationErrors.comments}</p>
            )}
            {backendErrors.comments && backendErrors.comments.map((error, idx) => (
              <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Customer...
              </>
            ) : (
              "Add Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
