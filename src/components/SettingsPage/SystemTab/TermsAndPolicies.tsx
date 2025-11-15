import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Save, Plus, Trash2, Edit, Loader2, Download } from 'lucide-react'
import { apiCall, API_CONFIG } from '@/config/api'
import { TermsConfigItem, SortDirection } from './types'
import { getSortIcon, sortData, createSortHandler } from './utils'

interface TermsAndPoliciesProps {
  termsConfigs: TermsConfigItem[]
  onUpdate: (configs: TermsConfigItem[]) => void
}

export const TermsAndPolicies: React.FC<TermsAndPoliciesProps> = ({
  termsConfigs,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState<TermsConfigItem | null>(null)
  const [newConfig, setNewConfig] = useState({
    termsAndConditions: '',
    termsFileUrl: '',
    termsFileName: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Sort state
  const [sortField, setSortField] = useState<keyof TermsConfigItem | ''>('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sorted data
  const sortedConfigs = useMemo(
    () => sortData(termsConfigs, sortField, sortDirection),
    [termsConfigs, sortField, sortDirection]
  )

  // Sort handler
  const handleSort = createSortHandler(sortField, sortDirection, setSortField, setSortDirection)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const addTermsConfig = async () => {
    setIsAdding(true)
    try {
      setUploadingFile(true)
      const formData = new FormData()

      // Always include terms_and_conditions text
      formData.append('terms_and_conditions', newConfig.termsAndConditions)

      // Include file if a new file was selected
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const uploadResponse = await apiCall('/api/settings/upload-terms/', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to save terms configuration')
      }

      const result = await uploadResponse.json()
      onUpdate([...termsConfigs, {
        id: result.id,
        termsAndConditions: result.terms_and_conditions,
        termsFileUrl: result.terms_file_url,
        termsFileName: result.terms_file_name
      }])
      setNewConfig({ termsAndConditions: '', termsFileUrl: '', termsFileName: '' })
      setSelectedFile(null)
      setUploadingFile(false)
      toast.success('Terms and policies added successfully!')
    } catch (error) {
      console.error('Error saving terms configuration:', error)
      toast.error('Failed to save terms and policies')
      setUploadingFile(false)
    } finally {
      setIsAdding(false)
      setUploadingFile(false)
    }
  }

  const updateTermsConfig = async (id: string) => {
    if (!editingConfig) return

    setIsUpdating(true)
    try {
      const payload = {
        terms_and_conditions: editingConfig.termsAndConditions,
        terms_file_url: editingConfig.termsFileUrl,
        terms_file_name: editingConfig.termsFileName
      }

      const response = await apiCall(`/api/settings/system/terms/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to update terms configuration')

      const result = await response.json()
      onUpdate(termsConfigs.map(tc => tc.id === id ? {
        id: result.id,
        termsAndConditions: result.terms_and_conditions,
        termsFileUrl: result.terms_file_url,
        termsFileName: result.terms_file_name
      } : tc))
      setEditingConfig(null)
      toast.success('Terms configuration updated successfully!')
    } catch (error) {
      console.error('Error updating terms configuration:', error)
      toast.error('Failed to update terms configuration')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteTermsConfig = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await apiCall(`/api/settings/system/terms/${id}/`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete terms configuration')

      onUpdate(termsConfigs.filter(tc => tc.id !== id))
      toast.success('Terms configuration deleted successfully!')
    } catch (error) {
      console.error('Error deleting terms configuration:', error)
      toast.error('Failed to delete terms configuration')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-orange-600" />
          <span className="truncate">Terms and Policies Configuration</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Set terms and conditions with optional file upload
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Terms Config Form */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
            <Textarea
              id="termsAndConditions"
              value={newConfig.termsAndConditions}
              onChange={(e) => setNewConfig(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              placeholder="Enter your terms and conditions here..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsFile">Upload Terms Document (Optional)</Label>
            <Input
              id="termsFile"
              type="file"
              onChange={handleFileSelect}
              disabled={uploadingFile || isAdding}
              accept=".pdf,.doc,.docx"
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
            )}
            {uploadingFile && (
              <p className="text-sm text-muted-foreground">Uploading file...</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={addTermsConfig} disabled={isAdding} className="bg-blue-600 hover:bg-blue-700">
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isAdding ? 'Adding...' : 'Add Terms Config'}
            </Button>
          </div>
        </div>

        {/* Terms Config Table */}
        {termsConfigs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Terms Configurations</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('termsAndConditions')}
                    >
                      Terms and Conditions
                      {getSortIcon('termsAndConditions', sortField, sortDirection)}
                    </th>
                    <th
                      className="text-left p-3 text-sm font-medium cursor-pointer hover:bg-muted transition-colors select-none"
                      onClick={() => handleSort('termsFileName')}
                    >
                      File
                      {getSortIcon('termsFileName', sortField, sortDirection)}
                    </th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedConfigs.map((config) => (
                    <tr key={config.id} className="border-t">
                      {editingConfig?.id === config.id ? (
                        <>
                          <td className="p-3">
                            <Textarea
                              value={editingConfig.termsAndConditions}
                              onChange={(e) => setEditingConfig(prev => prev ? { ...prev, termsAndConditions: e.target.value } : null)}
                              rows={3}
                              className="resize-none"
                            />
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">{editingConfig.termsFileName || 'No file'}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateTermsConfig(config.id)}
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-700"
                              >
                                {isUpdating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingConfig(null)}
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
                          <td className="p-3 text-sm max-w-md truncate">{config.termsAndConditions || 'No terms set'}</td>
                          <td className="p-3">
                            {config.termsFileUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const fileUrl = config.termsFileUrl.startsWith('http')
                                    ? config.termsFileUrl
                                    : `${API_CONFIG.BASE_URL}${config.termsFileUrl}`
                                  window.open(fileUrl, '_blank')
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {config.termsFileName}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">No file</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingConfig(config)}
                                disabled={isDeleting === config.id}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTermsConfig(config.id)}
                                disabled={isDeleting === config.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                {isDeleting === config.id ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
