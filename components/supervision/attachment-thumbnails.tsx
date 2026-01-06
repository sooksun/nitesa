'use client'

import { useState, useEffect, useRef } from 'react'
import { Attachment } from '@prisma/client'
import { ImageGallery } from '@/components/ui/image-gallery'
import { Download, FileText, File } from 'lucide-react'
import Image from 'next/image'

interface AttachmentThumbnailsProps {
  attachments: Attachment[]
}

export function AttachmentThumbnails({ attachments }: AttachmentThumbnailsProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // แยกไฟล์เป็น images และ PDFs
  const imageAttachments = attachments.filter((att) => {
    const url = att.fileUrl.toLowerCase()
    return (
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif') ||
      url.endsWith('.webp') ||
      url.endsWith('.bmp')
    )
  })

  const pdfAttachments = attachments.filter((att) => {
    const url = att.fileUrl.toLowerCase()
    return url.endsWith('.pdf')
  })

  const otherAttachments = attachments.filter((att) => {
    const url = att.fileUrl.toLowerCase()
    const isImage =
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif') ||
      url.endsWith('.webp') ||
      url.endsWith('.bmp')
    const isPdf = url.endsWith('.pdf')
    return !isImage && !isPdf
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Auto-open gallery when galleryOpen becomes true
  const triggerRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    if (galleryOpen && imageAttachments.length > 0 && triggerRef.current) {
      // Auto-click trigger to open gallery
      setTimeout(() => {
        triggerRef.current?.click()
      }, 50)
    }
  }, [galleryOpen, imageAttachments.length])

  return (
    <div className="space-y-6">
      {/* Image Thumbnails */}
      {imageAttachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            รูปภาพ ({imageAttachments.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {imageAttachments.map((attachment, index) => (
              <div
                key={attachment.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary transition-all"
                onClick={() => {
                  setSelectedImageIndex(index)
                  setGalleryOpen(true)
                }}
              >
                <Image
                  src={attachment.fileUrl}
                  alt={attachment.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{attachment.filename}</p>
                  <p className="text-xs text-white/80">{formatFileSize(attachment.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Thumbnails */}
      {pdfAttachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            เอกสาร PDF ({pdfAttachments.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pdfAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-all flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 mb-2 flex items-center justify-center text-red-500">
                    <File className="w-16 h-16" />
                  </div>
                  <p className="text-xs text-center text-foreground truncate w-full px-2">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4 text-primary" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Other Files */}
      {otherAttachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            ไฟล์อื่นๆ ({otherAttachments.length})
          </h3>
          <div className="space-y-2">
            {otherAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{attachment.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                </div>
                <a
                  href={attachment.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Gallery - Controlled by galleryOpen state */}
      {imageAttachments.length > 0 && (
        <ImageGallery
          images={imageAttachments.map((att) => ({
            id: att.id,
            url: att.fileUrl,
            filename: att.filename,
          }))}
          initialIndex={selectedImageIndex}
          onOpenChange={(open) => {
            setGalleryOpen(open)
          }}
          trigger={
            <button
              ref={triggerRef}
              type="button"
              style={{ display: 'none' }}
              aria-hidden="true"
            />
          }
        />
      )}
    </div>
  )
}
