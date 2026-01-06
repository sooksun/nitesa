'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ImageGalleryProps {
  images: Array<{
    id: string
    url: string
    filename: string
  }>
  trigger?: React.ReactNode
  initialIndex?: number
  onOpenChange?: (open: boolean) => void
}

export function ImageGallery({ images, trigger, initialIndex = 0, onOpenChange }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (initialIndex !== undefined) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex])

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [isOpen, onOpenChange])

  // Auto-open when trigger is provided and clicked programmatically
  useEffect(() => {
    if (trigger && onOpenChange) {
      // Check if parent wants to open (when onOpenChange(true) is called externally)
      // This is handled by the trigger click
    }
  }, [trigger, onOpenChange])

  // Auto-open when onOpenChange is called with true
  useEffect(() => {
    if (onOpenChange && trigger) {
      // Check if parent wants to open
      const checkOpen = () => {
        // This will be handled by parent setting state
      }
    }
  }, [onOpenChange, trigger])

  // Filter only image files
  const imageFiles = images.filter((img) => {
    const url = img.url.toLowerCase()
    return (
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.png') ||
      url.endsWith('.gif') ||
      url.endsWith('.webp') ||
      url.endsWith('.bmp')
    )
  })

  if (imageFiles.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentIndex])

  return (
    <>
      {trigger ? (
        <div 
          onClick={() => {
            setIsOpen(true)
            if (onOpenChange) {
              onOpenChange(true)
            }
          }} 
          className="cursor-pointer"
        >
          {trigger}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsOpen(true)
            if (onOpenChange) {
              onOpenChange(true)
            }
          }}
        >
          ดูรูปภาพ ({imageFiles.length})
        </Button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setIsOpen(false)
            if (onOpenChange) {
              onOpenChange(false)
            }
          }}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => {
                setIsOpen(false)
                if (onOpenChange) {
                  onOpenChange(false)
                }
              }}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {imageFiles.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={imageFiles[currentIndex].url}
                alt={imageFiles[currentIndex].filename}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>

            {/* Image Counter */}
            {imageFiles.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {imageFiles.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {imageFiles.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                {imageFiles.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

