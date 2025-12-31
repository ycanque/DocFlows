/**
 * File Upload Component
 * 
 * A reusable component for uploading files via backend API
 */

'use client'

import { useState, useRef } from 'react'
import { uploadFile, type UploadedFile } from '@/services/uploadService'

interface FileUploadProps {
  bucket?: string
  folder?: string
  onUploadComplete?: (file: UploadedFile) => void
  onUploadError?: (error: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
}

export default function FileUpload({
  bucket = 'documents',
  folder,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxFileSizeMB = 50,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const error = `File size exceeds ${maxFileSizeMB}MB limit`
      onUploadError?.(error)
      alert(error)
      return
    }

    setSelectedFile(file)
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

      const result = await uploadFile(selectedFile, bucket, folder)

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
    <div className="w-full max-w-md">
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select File
        </label>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </p>
        )}
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Uploading... {progress}%
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Accepted files: {acceptedFileTypes.replace(/\./g, '').toUpperCase()}
        <br />
        Max size: {maxFileSizeMB}MB
      </p>
    </div>
  )
}
