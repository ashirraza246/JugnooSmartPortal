'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download, ZoomIn, ZoomOut, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface DocumentPreviewProps {
  url: string | null
  filename?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreview({ url, filename, open, onOpenChange }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)

  if (!url) return null

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
  const isPdf = /\.pdf$/i.test(url)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'document'
    link.target = '_blank'
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1A3C5E] to-[#003E6B]">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-5 h-5 text-[#F5A623]" />
            ) : (
              <ImageIcon className="w-5 h-5 text-[#F5A623]" />
            )}
            <DialogTitle className="text-white text-sm font-medium">
              {filename || 'Document Preview'}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-white/70 min-w-[40px] text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview content */}
        <div className="overflow-auto max-h-[75vh] bg-gray-100 flex items-center justify-center p-4">
          {isImage ? (
            <img
              src={url}
              alt={filename || 'Document preview'}
              style={{ zoom: zoom / 100 }}
              className="max-w-full rounded-lg shadow-lg"
            />
          ) : isPdf ? (
            <iframe
              src={url}
              className="w-full h-[70vh] rounded-lg border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-sm">Preview not available for this file type</p>
              <Button
                variant="outline"
                className="mt-3 gap-2"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Open File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Thumbnail component for list views
interface DocumentThumbnailProps {
  url: string | null
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function DocumentThumbnail({ url, onClick, size = 'sm' }: DocumentThumbnailProps) {
  if (!url) {
    return (
      <div
        className={`${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg bg-gray-100 flex items-center justify-center`}
      >
        <FileText className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-300`} />
      </div>
    )
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)

  if (isImage) {
    return (
      <button
        onClick={onClick}
        className={`${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg overflow-hidden border border-gray-200 hover:border-[#F5A623] transition-colors cursor-pointer`}
      >
        <img src={url} alt="Document" className="w-full h-full object-cover" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg bg-[#E8F0FE] flex items-center justify-center hover:bg-[#1A3C5E] group transition-colors cursor-pointer`}
    >
      <FileText className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-[#1A3C5E] group-hover:text-white`} />
    </button>
  )
}
