'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { showToast, toastMessages } from '@/lib/toast'

export interface FileAttachment {
  id: string
  filename: string
  fileUrl: string
  fileType: string
  fileSize: number
}

interface MultiFileUploadProps {
  folder?: string
  id?: string
  onFilesChange?: (files: FileAttachment[]) => void
  currentFiles?: FileAttachment[]
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
}

export function MultiFileUpload({
  folder = 'general',
  id = 'temp',
  onFilesChange,
  currentFiles = [],
  accept = '*', // รองรับทุกประเภทไฟล์
  maxSize = 100, // 100MB per file
  maxFiles = 10,
}: MultiFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<FileAttachment[]>(currentFiles)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // ตรวจสอบจำนวนไฟล์
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`)
      return
    }

    // ตรวจสอบขนาดไฟล์ทั้งหมดก่อนอัปโหลด
    for (const file of selectedFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`ไฟล์ "${file.name}" ใหญ่เกินไป (สูงสุด ${maxSize}MB)`)
        return
      }
    }

    setError('')

    // อัปโหลดทีละไฟล์
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      await uploadFile(file, files.length + i)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File, index: number) => {
    // Validate file size (ตรวจสอบซ้ำเพื่อความปลอดภัย)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ไฟล์ "${file.name}" ใหญ่เกินไป (สูงสุด ${maxSize}MB)`)
      return
    }

    setUploading(true)
    setUploadingIndex(index)
    setProgress(0)
    setError('') // Clear previous errors

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
      
      // สร้าง file attachment object
      const fileAttachment: FileAttachment = {
        id: `file-${Date.now()}-${index}`,
        filename: data.filename || file.name,
        fileUrl: data.fileUrl,
        fileType: file.type || getFileTypeFromExtension(file.name),
        fileSize: file.size,
      }

      // อัปเดต state โดยใช้ functional update เพื่อให้แน่ใจว่าได้ state ล่าสุด
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles, fileAttachment]
        onFilesChange?.(newFiles)
        return newFiles
      })
      setProgress(0)
      showToast.success(`${file.name} ${toastMessages.upload.success}`)
    } catch (error: any) {
      const errorMsg = error.message || toastMessages.upload.error
      setError(errorMsg)
      showToast.error(`${file.name}: ${errorMsg}`)
    } finally {
      setUploading(false)
      setUploadingIndex(null)
    }
  }

  const getFileTypeFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
    }
    return typeMap[ext] || 'application/octet-stream'
  }

  const handleRemove = (fileId: string) => {
    const newFiles = files.filter((f) => f.id !== fileId)
    setFiles(newFiles)
    onFilesChange?.(newFiles)
    setError('')
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️'
    } else if (fileType.includes('pdf')) {
      return '📄'
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝'
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊'
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return '📽️'
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return '📦'
    }
    return '📎'
  }

  return (
    <div className="space-y-4">
      {/* รายการไฟล์ที่อัปโหลดแล้ว */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span className="capitalize">{file.fileType.split('/')[1] || 'ไฟล์'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      ดูไฟล์
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(file.id)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ปุ่มอัปโหลด */}
      {files.length < maxFiles && (
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            multiple
            className="hidden"
            id={`multi-file-upload-${id}`}
          />
          <label
            htmlFor={`multi-file-upload-${id}`}
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
                    กำลังอัปโหลด... ({uploadingIndex !== null ? uploadingIndex + 1 : ''})
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    อัปโหลดไฟล์ (สามารถเลือกหลายไฟล์ได้)
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
        รองรับทุกประเภทไฟล์ (สูงสุด {maxSize}MB ต่อไฟล์, สูงสุด {maxFiles} ไฟล์)
        {files.length > 0 && ` (อัปโหลดแล้ว ${files.length}/${maxFiles} ไฟล์)`}
      </p>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

