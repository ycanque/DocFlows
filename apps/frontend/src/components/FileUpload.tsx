/**
 * File Upload Component
 * 
 * A reusable component for uploading files via backend API
 */

'use client'

import { useState, useRef } from 'react'
import { uploadFile, type UploadedFile } from '@/services/uploadService'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  bucket?: string
  folder?: string
  workflowStep?: string
  requisitionId?: string
  paymentId?: string
  onUploadComplete?: (file: UploadedFile) => void
  onUploadError?: (error: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
}

export default function FileUpload({
  bucket = 'documents',
  folder,
  workflowStep,
  requisitionId,
  paymentId,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxFileSizeMB = 50,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const error = `File size exceeds ${maxFileSizeMB}MB limit`
      onUploadError?.(error)
      alert(error)
      return false
    }
    return true
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadFile(selectedFile, bucket, folder, workflowStep, requisitionId, paymentId)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success && result.file) {
        onUploadComplete?.(result.file)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = result.error || 'Upload failed'
        onUploadError?.(error)
        alert(error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onUploadError?.(errorMessage)
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <Upload className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-500 mb-2" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Drag and drop your file here
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          or click to browse
        </p>

        {selectedFile && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
            <p className="text-sm font-medium text-green-900 dark:text-green-50">
              ✓ {selectedFile.name}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 text-center">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors font-medium text-sm"
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload File'}
      </button>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center space-y-0.5">
        <span className="block">Supported: {acceptedFileTypes.replace(/\./g, '').toUpperCase()}</span>
        <span className="block">Max size: {maxFileSizeMB}MB</span>
      </p>
    </div>
  )
}
