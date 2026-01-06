'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface FileUploadProps {
  folder?: string
  id?: string
  onUploadComplete?: (fileUrl: string, filename: string) => void
  onRemove?: () => void
  currentFileUrl?: string
  currentFileName?: string
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({
  folder = 'general',
  id = 'temp',
  onUploadComplete,
  onRemove,
  currentFileUrl,
  currentFileName,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ไฟล์ใหญ่เกินไป (สูงสุด ${maxSize}MB)`)
      return
    }

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      formData.append('id', id)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'เกิดข้อผิดพลาดในการอัปโหลด')
      }

      const data = await response.json()
      onUploadComplete?.(data.fileUrl, data.filename)
      setProgress(0)
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลด')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError('')
  }

  return (
    <div className="space-y-2">
      {currentFileUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentFileName || 'ไฟล์แนบ'}</p>
                  <a
                    href={currentFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    ดูไฟล์
                  </a>
                </div>
              </div>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${id}`}
          />
          <label
            htmlFor={`file-upload-${id}`}
            className="cursor-pointer"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังอัปโหลด...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    อัปโหลดไฟล์
                  </>
                )}
              </span>
            </Button>
          </label>
          {uploading && progress > 0 && (
            <Progress value={progress} className="h-2" />
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        รองรับไฟล์: PDF, Word, รูปภาพ (สูงสุด {maxSize}MB)
      </p>
    </div>
  )
}

