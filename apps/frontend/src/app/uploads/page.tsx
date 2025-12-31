/**
 * File Uploads Test Page
 * 
 * This page demonstrates file upload functionality using Supabase Storage
 * Use this to test uploads, view files, and delete files from the 'documents' bucket
 */

'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import {
  listFiles,
  deleteFile,
  type UploadedFile,
} from '@/services/uploadService'

export default function UploadsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBucket, setSelectedBucket] = useState('documents')
  const [refreshKey, setRefreshKey] = useState(0)

  // Load files on mount and when refreshKey changes
  useEffect(() => {
    loadFiles()
  }, [refreshKey, selectedBucket])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const fileList = await listFiles(selectedBucket)
      setFiles(fileList)
    } catch (error) {
      console.error('Error loading files:', error)
      alert('Failed to load files. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (file: UploadedFile) => {
    console.log('File uploaded:', file)
    alert(`File uploaded successfully: ${file.originalFileName}`)
    setRefreshKey((prev) => prev + 1) // Refresh file list
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  const handleDeleteFile = async (file: UploadedFile) => {
    if (!confirm(`Are you sure you want to delete ${file.originalFileName}?`)) {
      return
    }

    try {
      const success = await deleteFile(file.id)
      if (success) {
        alert('File deleted successfully')
        setRefreshKey((prev) => prev + 1) // Refresh file list
      } else {
        alert('Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    }
  }

  const handleViewFile = (file: UploadedFile) => {
    if (file.url) {
      window.open(file.url, '_blank')
    } else {
      alert('File URL not available')
    }
  }

  const handleCreateBucket = async () => {
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            File Upload Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test file uploads via backend API with Supabase Storage
          </p>
        </div>

        {/* Bucket Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Bucket:
          </label>
          <input
            type="text"
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter bucket name (optional)"
          />
          <button
            onClick={handleCreateBucket}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Clear Filter
          </button>
          <button
            onClick={loadFiles}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload File
          </h2>
          <FileUpload
            bucket={selectedBucket}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Files List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Uploaded Files ({files.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No files uploaded yet. Upload a file to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      File Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Uploaded At
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {file.originalFileName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewFile(file)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Information
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Backend API: {process.env.NEXT_PUBLIC_API_BASE_URL}</li>
            <li>• Files uploaded via: POST /uploads</li>
            <li>• Max file size: 50MB</li>
            <li>• Supported formats: PDF, JPG, PNG, DOC, DOCX</li>
            <li>• Files stored in Supabase Storage (local development)</li>
            <li>• File metadata tracked in PostgreSQL database</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
