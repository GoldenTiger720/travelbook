import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Passenger {
  id: string
  pax_number: number
  name: string
  telephone: string
  age: string
  gender: string
  nationality: string
}

interface PassengerListTableProps {
  passengers: Passenger[]
  tourAssignment?: any
  onSave: (passengers: Passenger[], tourAssignment?: any) => void
}

const PassengerListTable: React.FC<PassengerListTableProps> = ({ passengers, tourAssignment, onSave }) => {
  const [editablePassengers, setEditablePassengers] = useState<Passenger[]>(passengers)

  const handleFieldChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...editablePassengers]
    updated[index] = { ...updated[index], [field]: value }
    setEditablePassengers(updated)
  }

  const handleSave = () => {
    onSave(editablePassengers, tourAssignment)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Passenger List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">#</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Telephone</TableHead>
                <TableHead className="min-w-[80px]">Age</TableHead>
                <TableHead className="min-w-[100px]">Gender</TableHead>
                <TableHead className="min-w-[150px]">Nationality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editablePassengers.map((passenger, index) => (
                <TableRow key={passenger.id}>
                  <TableCell className="font-medium">
                    PAX {passenger.pax_number}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={passenger.name}
                      onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={passenger.telephone}
                      onChange={(e) => handleFieldChange(index, 'telephone', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={passenger.age}
                      onChange={(e) => handleFieldChange(index, 'age', e.target.value)}
                      className="w-full"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={passenger.gender || '-'}
                      onValueChange={(value) => handleFieldChange(index, 'gender', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={passenger.nationality || 'Not Informed'}
                      onValueChange={(value) => handleFieldChange(index, 'nationality', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Not Informed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Informed">Not Informed</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Peru">Peru</SelectItem>
                        <SelectItem value="Uruguay">Uruguay</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PassengerListTable
