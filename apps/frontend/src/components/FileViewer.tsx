'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react'
import type { UploadedFile } from '@/services/uploadService'

interface FileViewerProps {
  file: UploadedFile | null
  fileUrl: string | null
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
}

export default function FileViewer({
  file,
  fileUrl,
  isOpen,
  onClose,
  onDownload,
}: FileViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100)

  if (!file || !fileUrl) return null

  const isImage = file.mimeType.startsWith('image/')
  const isPdf = file.mimeType === 'application/pdf'
  const isDocument =
    file.mimeType.includes('word') ||
    file.mimeType.includes('document') ||
    file.mimeType.includes('sheet') ||
    file.mimeType.includes('excel')

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 400))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  const handleBlobDownload = async () => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg truncate">
            {file.originalFileName}
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          {isImage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 min-w-12 text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="text-xs"
              >
                Reset
              </Button>
              <div className="flex-1" />
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBlobDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center p-4">
          {isImage ? (
            <div className="flex items-center justify-center">
              <img
                src={fileUrl}
                alt={file.originalFileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoomLevel / 100})`,
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="rounded-lg"
                onError={() => {
                  console.error('Failed to load image')
                }}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={file.originalFileName}
              className="w-full h-full rounded-lg border border-zinc-700"
              style={{ minHeight: '600px' }}
            />
          ) : isDocument ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-6xl">📄</div>
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Document Preview Not Available
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {file.originalFileName}
                </p>
              </div>
              <Button
                onClick={onDownload}
                className="flex items-center gap-2 mt-4"
              >
                <Download className="h-4 w-4" />
                Download to View
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-6xl">📎</div>
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Preview Not Available
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  File type: {file.mimeType}
                </p>
              </div>
              <Button
                onClick={onDownload}
                className="flex items-center gap-2 mt-4"
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
