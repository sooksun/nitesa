'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerBE } from '@/components/ui/date-picker-be'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { IndicatorLevel, SupervisionStatus } from '@prisma/client'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { showToast, toastMessages } from '@/lib/toast'
import { MultiFileUpload, FileAttachment } from './multi-file-upload'

const supervisionFormSchema = z.object({
  type: z.string().min(1, 'กรุณาเลือกประเภทการนิเทศ'),
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  academicYear: z.string().optional(), // ปีการศึกษา
  ministerPolicyId: z.string().optional(), // นโยบายรัฐมนตรี
  obecPolicyId: z.string().optional(), // นโยบายสพฐ
  areaPolicyId: z.string().optional(), // นโยบายเขตพื้นที่การศึกษา
  summary: z.string().min(10, 'กรุณากรอกสรุปผลการนิเทศ (อย่างน้อย 10 ตัวอักษร)'),
  suggestions: z.string().min(10, 'กรุณากรอกข้อเสนอแนะ (อย่างน้อย 10 ตัวอักษร)'),
  status: z.nativeEnum(SupervisionStatus),
  indicators: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'กรุณากรอกชื่อตัวชี้วัด'),
        level: z.nativeEnum(IndicatorLevel),
        comment: z.string().optional(),
      })
    )
    .min(1, 'กรุณาเพิ่มตัวชี้วัดอย่างน้อย 1 รายการ'),
})

type SupervisionFormValues = z.infer<typeof supervisionFormSchema>

interface EditSupervisionFormProps {
  supervision: any
}

interface Policy {
  id: string
  code: string
  title: string
  type: string
  isActive: boolean
}

export function EditSupervisionForm({ supervision }: EditSupervisionFormProps) {
  const [loading, setLoading] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [attachments, setAttachments] = useState<FileAttachment[]>(
    supervision.attachments?.map((att: any) => ({
      id: `attachment-${att.id}`, // Prefix with 'attachment-' to identify existing files
      filename: att.filename,
      fileUrl: att.fileUrl,
      fileType: att.fileType,
      fileSize: att.fileSize,
    })) || []
  )
  const router = useRouter()

  const form = useForm<SupervisionFormValues>({
    resolver: zodResolver(supervisionFormSchema),
    defaultValues: {
      type: supervision.type,
      date: new Date(supervision.date).toISOString().split('T')[0],
      academicYear: supervision.academicYear || '',
      ministerPolicyId: supervision.ministerPolicyId || supervision.ministerPolicy?.id || '',
      obecPolicyId: supervision.obecPolicyId || supervision.obecPolicy?.id || '',
      areaPolicyId: supervision.areaPolicyId || supervision.areaPolicy?.id || '',
      summary: supervision.summary,
      suggestions: supervision.suggestions,
      status: supervision.status,
      indicators: supervision.indicators.map((ind: any) => ({
        id: ind.id,
        name: ind.name,
        level: ind.level,
        comment: ind.comment || '',
      })),
    },
  })

  // Fetch policies on mount
  useEffect(() => {
    fetch('/api/policies')
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((error) => console.error('Error fetching policies:', error))
  }, [])

  const onSubmit = async (data: SupervisionFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/supervisions/${supervision.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          attachments,
        }),
      })

      if (response.ok) {
        showToast.success(toastMessages.update.success)
        setTimeout(() => {
          router.push(`/supervisions/${supervision.id}`)
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.update.error)
      }
    } catch (error) {
      console.error('Error updating supervision:', error)
      showToast.error(toastMessages.update.error)
    } finally {
      setLoading(false)
    }
  }

  const addIndicator = () => {
    form.setValue('indicators', [
      ...form.getValues('indicators'),
      { name: '', level: IndicatorLevel.GOOD, comment: '' },
    ])
  }

  const removeIndicator = (index: number) => {
    const indicators = form.getValues('indicators')
    form.setValue('indicators', indicators.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทการนิเทศ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="นิเทศการสอน">นิเทศการสอน</SelectItem>
                      <SelectItem value="ติดตามโครงการ">ติดตามโครงการ</SelectItem>
                      <SelectItem value="นิเทศทั่วไป">นิเทศทั่วไป</SelectItem>
                      <SelectItem value="นิเทศเฉพาะเรื่อง">นิเทศเฉพาะเรื่อง</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่นิเทศ</FormLabel>
                  <FormControl>
                    <DatePickerBE
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>กรอกวันที่ในรูปแบบ dd/MM/yyyy (พ.ศ.)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ปีการศึกษา</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="เช่น 2567" />
                  </FormControl>
                  <FormDescription>ระบุปีการศึกษา (พ.ศ.)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>นโยบายที่เกี่ยวข้อง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="ministerPolicyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>นโยบายรัฐมนตรีว่าการกระทรวงศึกษาธิการ</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกนโยบายรัฐมนตรี" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {policies
                        .filter((p) => p.isActive)
                        .map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.code} - {policy.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="obecPolicyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>นโยบายสพฐ</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกนโยบายสพฐ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {policies
                        .filter((p) => p.isActive)
                        .map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.code} - {policy.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaPolicyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>นโยบายเขตพื้นที่การศึกษา</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกนโยบายเขตพื้นที่การศึกษา" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {policies
                        .filter((p) => p.isActive)
                        .map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.code} - {policy.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ตัวชี้วัด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.watch('indicators').map((indicator, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">ตัวชี้วัด #{index + 1}</h4>
                  {form.watch('indicators').length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIndicator(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`indicators.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อตัวชี้วัด</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="เช่น การจัดการเรียนการสอน" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`indicators.${index}.level`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ระดับ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={IndicatorLevel.EXCELLENT}>ดีเยี่ยม</SelectItem>
                          <SelectItem value={IndicatorLevel.GOOD}>ดี</SelectItem>
                          <SelectItem value={IndicatorLevel.FAIR}>พอใช้</SelectItem>
                          <SelectItem value={IndicatorLevel.NEEDS_WORK}>ต้องพัฒนา</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`indicators.${index}.comment`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ความคิดเห็น (ไม่บังคับ)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ความคิดเห็นเพิ่มเติม" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addIndicator}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มตัวชี้วัด
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สรุปผลการนิเทศ</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สรุปผลการนิเทศ</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="สรุปผลการนิเทศ..." className="min-h-[100px]" />
                  </FormControl>
                  <FormDescription>กรุณากรอกสรุปผลการนิเทศอย่างละเอียด</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ข้อเสนอแนะ</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="suggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ข้อเสนอแนะ</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="ข้อเสนอแนะสำหรับโรงเรียน..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>กรุณากรอกข้อเสนอแนะสำหรับการพัฒนาต่อไป</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ไฟล์แนบ</CardTitle>
            <CardDescription>อัปโหลดไฟล์แนบได้สูงสุด 10 ไฟล์ (100MB ต่อไฟล์)</CardDescription>
          </CardHeader>
          <CardContent>
            <MultiFileUpload
              folder="supervisions"
              id={supervision.id}
              onFilesChange={(files) => setAttachments(files)}
              currentFiles={attachments}
              maxFiles={10}
              maxSize={100}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะ</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as SupervisionStatus)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SupervisionStatus.DRAFT}>ร่าง</SelectItem>
                      <SelectItem value={SupervisionStatus.SUBMITTED}>ส่งแล้ว</SelectItem>
                      <SelectItem value={SupervisionStatus.APPROVED}>อนุมัติแล้ว</SelectItem>
                      <SelectItem value={SupervisionStatus.PUBLISHED}>เผยแพร่แล้ว</SelectItem>
                      <SelectItem value={SupervisionStatus.NEEDS_IMPROVEMENT}>ต้องปรับปรุง</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    เลือกสถานะของการนิเทศ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  )
}

