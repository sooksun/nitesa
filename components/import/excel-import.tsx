'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { showToast } from '@/lib/toast'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

export function ExcelImport() {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<'schools' | 'networkGroups' | 'policies'>('schools')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (!['xls', 'xlsx'].includes(extension || '')) {
        showToast.error('กรุณาเลือกไฟล์ Excel (.xls หรือ .xlsx)')
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      showToast.error('กรุณาเลือกไฟล์ Excel')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        showToast.error(data.error || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล')
        setLoading(false)
        return
      }

      setResult(data.result)
      
      if (data.result.success > 0) {
        showToast.success(
          `นำเข้าข้อมูลสำเร็จ ${data.result.success} รายการ${data.result.failed > 0 ? ` (ล้มเหลว ${data.result.failed} รายการ)` : ''}`
        )
      } else {
        showToast.error(`ไม่สามารถนำเข้าข้อมูลได้ (ล้มเหลว ${data.result.failed} รายการ)`)
      }
    } catch (error) {
      console.error('Error importing:', error)
      showToast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getTemplateUrl = () => {
    switch (type) {
      case 'schools':
        return '/templates/school-import-template.xlsx'
      case 'networkGroups':
        return '/templates/network-group-import-template.xlsx'
      case 'policies':
        return '/templates/policy-import-template.xlsx'
      default:
        return ''
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'schools':
        return 'โรงเรียน'
      case 'networkGroups':
        return 'กลุ่มเครือข่าย'
      case 'policies':
        return 'นโยบาย'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>นำเข้าข้อมูลจาก Excel</CardTitle>
          <CardDescription>
            เลือกประเภทข้อมูลและอัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">ประเภทข้อมูล *</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="เลือกประเภทข้อมูล" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schools">โรงเรียน</SelectItem>
                <SelectItem value="networkGroups">กลุ่มเครือข่าย</SelectItem>
                <SelectItem value="policies">นโยบาย</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Download */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">ดาวน์โหลดไฟล์ Template</p>
              <p className="text-xs text-muted-foreground">
                ดาวน์โหลดไฟล์ตัวอย่างสำหรับการนำเข้าข้อมูล{getTypeLabel()}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={getTemplateUrl()} download>
                <Download className="h-4 w-4 mr-2" />
                ดาวน์โหลด Template
              </Link>
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">ไฟล์ Excel *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                disabled={loading}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              รองรับไฟล์ Excel (.xls, .xlsx) เท่านั้น
            </p>
          </div>

          {/* Import Button */}
          <Button onClick={handleImport} disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                กำลังนำเข้าข้อมูล...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                นำเข้าข้อมูล
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
                <div className="flex items-start gap-3">
                  {result.failed === 0 ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertTitle>
                      {result.failed === 0 ? 'นำเข้าข้อมูลสำเร็จ' : 'นำเข้าข้อมูลบางส่วน'}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2 mt-2">
                        <p>
                          ✅ สำเร็จ: <strong>{result.success}</strong> รายการ
                        </p>
                        {result.failed > 0 && (
                          <p>
                            ❌ ล้มเหลว: <strong>{result.failed}</strong> รายการ
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              {/* Error Details */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">รายละเอียดข้อผิดพลาด:</p>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20"
                      >
                        <span className="font-medium">แถว {error.row}:</span> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>คำแนะนำการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-2">ขั้นตอนการนำเข้าข้อมูล:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>เลือกประเภทข้อมูลที่ต้องการนำเข้า</li>
              <li>ดาวน์โหลดไฟล์ Template เพื่อดูรูปแบบข้อมูล</li>
              <li>กรอกข้อมูลในไฟล์ Excel ตาม Template</li>
              <li>อัปโหลดไฟล์ Excel ที่กรอกข้อมูลแล้ว</li>
              <li>คลิกปุ่ม "นำเข้าข้อมูล" เพื่อเริ่มกระบวนการ</li>
            </ol>
          </div>

          <div>
            <p className="font-medium mb-2">หมายเหตุ:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>ไฟล์ Excel ต้องมี header row (แถวแรกเป็นชื่อคอลัมน์)</li>
              <li>ข้อมูลที่ซ้ำกันจะถูกข้าม (เช่น รหัสโรงเรียนที่ซ้ำ)</li>
              <li>สำหรับการนำเข้าโรงเรียน ต้องมีกลุ่มเครือข่ายในระบบก่อน</li>
              <li>สำหรับการนำเข้านโยบาย ประเภทนโยบายต้องเป็นค่า enum ที่ถูกต้อง (เช่น NAT_VALUES_LOYALTY, CIVIC_HISTORY_GEO, ฯลฯ)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

