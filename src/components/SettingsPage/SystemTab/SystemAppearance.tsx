import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Image, Upload, Edit, Trash2, Loader2 } from 'lucide-react'
import { apiCall } from '@/config/api'
import { useLogo } from '@/contexts/LogoContext'
import { SystemAppearance as SystemAppearanceType } from './types'

interface SystemAppearanceProps {
  appearances: SystemAppearanceType[]
  onUpdate: (appearances: SystemAppearanceType[]) => void
}

export const SystemAppearance: React.FC<SystemAppearanceProps> = ({
  appearances,
  onUpdate
}) => {
  const { updateLogo } = useLogo()
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingAppearance, setEditingAppearance] = useState<SystemAppearanceType | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      if (editingAppearance) {
        setTimeout(() => updateAppearanceWithFile(editingAppearance.id, file), 100)
      }
    }
  }

  const updateAppearanceWithFile = async (id: string, file: File) => {
    setIsUpdating(true)
    try {
      const base64Logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await apiCall(`/api/settings/system/appearance/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ company_logo_base64: base64Logo })
      })

      if (!response.ok) throw new Error('Failed to update appearance')

      const result = await response.json()
      const updatedAppearances = appearances.map(app =>
        app.id === id ? { id: result.id, company_logo: result.company_logo } : app
      )
      onUpdate(updatedAppearances)
      updateLogo(result.company_logo)
      setEditingAppearance(null)
      setLogoFile(null)
      setLogoPreview('')
      toast.success('Logo updated successfully!')
    } catch (error) {
      console.error('Error updating appearance:', error)
      toast.error('Failed to update logo')
    } finally {
      setIsUpdating(false)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo file')
      return
    }

    setIsAdding(true)
    try {
      const base64Logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(logoFile)
      })

      const response = await apiCall('/api/settings/system/appearance/', {
        method: 'POST',
        body: JSON.stringify({ company_logo_base64: base64Logo })
      })

      if (!response.ok) throw new Error('Failed to upload logo')

      const result = await response.json()
      onUpdate([...appearances, { id: result.id, company_logo: result.company_logo }])
      updateLogo(result.company_logo)
      setLogoFile(null)
      setLogoPreview('')
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsAdding(false)
    }
  }

  const deleteAppearance = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/appearance/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete appearance')

      onUpdate(appearances.filter(app => app.id !== id))
      toast.success('Appearance deleted successfully!')
    } catch (error) {
      console.error('Error deleting appearance:', error)
      toast.error('Failed to delete appearance')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="w-5 h-5 text-blue-600" />
          <span className="truncate">System Appearance</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Upload your company logo for use in the menu, quotes, and vouchers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Logo Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Company Logo</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              {logoPreview && (
                <div className="mt-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="invisible">Upload</Label>
            <Button onClick={uploadLogo} disabled={isAdding || !logoFile} className="w-full">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </div>
        </div>

        {/* Current Logos */}
        {appearances.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Company Logos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {appearances.map((appearance) => (
                <div key={appearance.id} className="border rounded-lg p-4 space-y-3 bg-card">
                  {appearance.company_logo && (
                    <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
                      <img
                        src={appearance.company_logo}
                        alt="Company logo"
                        className="max-h-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAppearance(appearance)
                        document.getElementById('logo-upload')?.click()
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAppearance(appearance.id)}
                      disabled={isDeleting === appearance.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isDeleting === appearance.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
