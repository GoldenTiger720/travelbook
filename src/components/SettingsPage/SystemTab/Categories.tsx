import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Save, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { Category, SortDirection } from './types'
import { getSortIcon, sortData } from './utils'

interface CategoriesProps {
  categories: Category[]
  onUpdate: (categories: Category[]) => void
}

export const Categories: React.FC<CategoriesProps> = ({
  categories,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: ''
  })

  // Sort state
  const [sortField, setSortField] = useState<keyof Category | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedCategories = useMemo(
    () => sortData(categories, sortField, sortDirection),
    [categories, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setIsAdding(true)
    try {
      const payload = {
        name: newCategory.name
      }

      const response = await apiCall('/api/settings/system/categories/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add category')

      const result = await response.json()
      onUpdate([...categories, {
        id: result.id,
        name: result.name
      }])
      setNewCategory({ name: '' })
      toast.success('Category added successfully!')
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category')
    } finally {
      setIsAdding(false)
    }
  }

  const updateCategory = async (id: string) => {
    if (!editingCategory) return

    setIsUpdating(true)
    try {
      const payload = {
        name: editingCategory.name
      }

      const response = await apiCall(`/api/settings/system/categories/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update category')

      const result = await response.json()
      onUpdate(categories.map(cat => cat.id === id ? {
        id: result.id,
        name: result.name
      } : cat))
      setEditingCategory(null)
      toast.success('Category updated successfully!')
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/categories/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete category')

      onUpdate(categories.filter(cat => cat.id !== id))
      toast.success('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5 text-indigo-600" />
          <span className="truncate">Categories</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Manage categories for organizing your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Category Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Tours, Hotels, Transportation"
            />
          </div>
          <div className="space-y-2">
            <Label className="invisible">Add</Label>
            <Button onClick={addCategory} disabled={isAdding} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Registered Categories</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    Category Name
                    {getSortIcon('name', sortField, sortDirection)}
                  </th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-sm text-muted-foreground">
                      No categories registered yet. Add your first category above.
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map((category) => (
                    <tr key={category.id} className="border-t">
                      {editingCategory?.id === category.id ? (
                        <>
                          <td className="p-3">
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                              className="h-8"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCategory(category.id)}
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-700"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCategory(null)}
                                disabled={isUpdating}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-sm font-medium">{category.name}</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCategory(category)}
                                disabled={isDeleting === category.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                                disabled={isDeleting === category.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === category.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
