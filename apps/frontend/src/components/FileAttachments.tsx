/**
 * File Attachments Component
 * 
 * Manages file uploads and displays attached files
 * Used in requisitions, payments, and other document workflows
 */

'use client'

import { useState, useEffect } from 'react'
import { uploadFile, listFiles, listRequisitionFiles, deleteFile, getSignedUrl, type UploadedFile } from '@/services/uploadService'
import FileUpload from '@/components/FileUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Download, Trash2, Eye, Upload } from 'lucide-react'

interface FileAttachmentsProps {
  files?: UploadedFile[]
  bucket?: string
  folder?: string
  requisitionId?: string // For fetching files linked to a specific requisition
  workflowStep?: string // Optional workflow step to tag uploads
  onFilesChange?: (files: UploadedFile[]) => void
  mode?: 'draft' | 'existing' // draft = creating new record, existing = viewing/editing existing record
}

export default function FileAttachments({
  files: externalFiles,
  bucket = 'documents',
  folder,
  requisitionId,
  workflowStep,
  onFilesChange,
  mode = 'existing',
}: FileAttachmentsProps) {
  const [files, setFiles] = useState<UploadedFile[]>(externalFiles || [])
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const loadFiles = async () => {
    setLoading(true)
    try {
      // If requisitionId is provided, fetch files for that specific requisition
      const fileList = requisitionId 
        ? await listRequisitionFiles(requisitionId)
        : await listFiles(bucket)
      setFiles(fileList)
      onFilesChange?.(fileList)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Only fetch files from server in 'existing' mode
  useEffect(() => {
    if (mode === 'existing' && requisitionId) {
      loadFiles()
    } else if (mode === 'draft' && externalFiles) {
      // In draft mode, sync with external files prop
      setFiles(externalFiles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, requisitionId, mode])

  // Separate effect to sync external files in draft mode
  useEffect(() => {
    if (mode === 'draft' && externalFiles) {
      setFiles(externalFiles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFiles])

  const handleUploadComplete = (file: UploadedFile) => {
    console.log('File uploaded:', file)
    
    if (mode === 'draft') {
      // In draft mode, add to local state
      const updatedFiles = [...files, file]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    } else {
      // In existing mode, refresh from server
      setRefreshKey((prev) => prev + 1)
    }
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  const handleDeleteFile = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete ${file.originalFileName}?`)) {
      return
    }

    try {
      if (mode === 'draft') {
        // In draft mode, remove from local state only
        const updatedFiles = files.filter(f => f.id !== file.id)
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
        
        // Still delete from storage to avoid orphaned files
        await deleteFile(file.id)
      } else {
        // In existing mode, delete and refresh from server
        const success = await deleteFile(file.id)
        if (success) {
          setRefreshKey((prev) => prev + 1)
        } else {
          alert('Failed to delete file')
        }
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    }
  }

  const handleViewFile = async (file: UploadedFile) => {
    try {
      const url = await getSignedUrl(file.id)
      if (url) {
        window.open(url, '_blank')
      } else {
        alert('Failed to generate download link. Please try again.')
      }
    } catch (error) {
      console.error('Error getting file URL:', error)
      alert('Failed to open file. Please try again.')
    }
  }

  // Check if a file can be deleted (only allow deletion of files from current workflow step)
  const canDeleteFile = (file: UploadedFile): boolean => {
    if (mode === 'draft') {
      // In draft mode, all files can be deleted
      return true
    }
    // In existing mode, only allow deletion of files from the current workflow step
    return file.workflowStep === workflowStep
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️'
    } else if (mimeType === 'application/pdf') {
      return '📄'
    } else if (
      mimeType.includes('word') ||
      mimeType.includes('document')
    ) {
      return '📝'
    } else if (
      mimeType.includes('sheet') ||
      mimeType.includes('excel')
    ) {
      return '📊'
    }
    return '📎'
  }

  return (
    <div className="space-y-6">
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Select files to attach to this record. Supported formats: PDF, JPG, PNG, DOC, DOCX. Max 50MB per file.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            bucket={bucket}
            folder={folder}
            workflowStep={workflowStep}
            requisitionId={requisitionId}
            onUploadComplete={(file) => {
              handleUploadComplete(file)
            }}
            onUploadError={handleUploadError}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>

      {/* Attached Files */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attached Documents ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No documents attached yet
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Upload documents using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group files by workflow step */}
              {Object.entries(
                files.reduce((acc, file) => {
                  const step = file.workflowStep || 'General';
                  if (!acc[step]) acc[step] = [];
                  acc[step].push(file);
                  return acc;
                }, {} as Record<string, UploadedFile[]>)
              ).map(([workflowStep, stepFiles]) => (
                <div key={workflowStep} className="space-y-3">
                  {/* Workflow Step Header */}
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3">
                      {workflowStep}
                    </span>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  </div>

                  {/* Files in this step */}
                  {stepFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                            {file.originalFileName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatFileSize(file.fileSize)}
                            </span>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {formatDate(file.uploadedAt)}
                            </span>
                            {file.uploadedBy && (
                              <>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFile(file)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFile(file)}
                          disabled={!canDeleteFile(file)}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={canDeleteFile(file) ? 'Delete file' : 'Cannot delete files from previous workflow steps'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p>💡 <strong>Tip:</strong> Attach relevant documents such as quotes, specifications, or supporting documentation.</p>
        <p>📎 Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
        <p>📏 Maximum file size: 50MB</p>
      </div>
    </div>
  )
}
