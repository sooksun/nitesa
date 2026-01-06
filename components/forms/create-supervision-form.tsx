'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { showToast, toastMessages } from '@/lib/toast'
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
import { getCurrentADDateString } from '@/lib/date-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { IndicatorLevel } from '@prisma/client'
import { Plus, X } from 'lucide-react'
import { MultiFileUpload, FileAttachment } from './multi-file-upload'

const supervisionFormSchema = z.object({
  schoolId: z.string().min(1, 'กรุณาเลือกโรงเรียน'),
  type: z.string().min(1, 'กรุณาเลือกประเภทการนิเทศ'),
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  academicYear: z.string().optional(), // ปีการศึกษา
  ministerPolicyId: z.string().optional(), // นโยบายรัฐมนตรี
  obecPolicyId: z.string().optional(), // นโยบายสพฐ
  areaPolicyId: z.string().optional(), // นโยบายเขตพื้นที่การศึกษา
  summary: z.string().min(10, 'กรุณากรอกสรุปผลการนิเทศ (อย่างน้อย 10 ตัวอักษร)'),
  suggestions: z.string().min(10, 'กรุณากรอกข้อเสนอแนะ (อย่างน้อย 10 ตัวอักษร)'),
  status: z.enum(['DRAFT', 'SUBMITTED']),
  indicators: z
    .array(
      z.object({
        name: z.string().min(1, 'กรุณากรอกชื่อตัวชี้วัด'),
        level: z.nativeEnum(IndicatorLevel),
        comment: z.string().optional(),
      })
    )
    .min(1, 'กรุณาเพิ่มตัวชี้วัดอย่างน้อย 1 รายการ'),
})

type SupervisionFormValues = z.infer<typeof supervisionFormSchema>

interface CreateSupervisionFormProps {
  userId: string
}

interface Policy {
  id: string
  code: string
  title: string
  type: string
  isActive: boolean
}

export function CreateSupervisionForm({ userId }: CreateSupervisionFormProps) {
  const [schools, setSchools] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])

  const form = useForm<SupervisionFormValues>({
    resolver: zodResolver(supervisionFormSchema),
    defaultValues: {
      schoolId: '',
      type: '',
      date: getCurrentADDateString(),
      academicYear: new Date().getFullYear() + 543 + '', // ปี พ.ศ. ปัจจุบัน
      ministerPolicyId: '',
      obecPolicyId: '',
      areaPolicyId: '',
      summary: '',
      suggestions: '',
      status: 'DRAFT',
      indicators: [{ name: '', level: IndicatorLevel.GOOD, comment: '' }],
    },
  })

  // Fetch schools and policies on mount
  useEffect(() => {
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((error) => console.error('Error fetching schools:', error))

    fetch('/api/policies')
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch((error) => console.error('Error fetching policies:', error))
  }, [])

  const onSubmit = async (data: SupervisionFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/supervisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId, attachments }),
      })

      if (response.ok) {
        const result = await response.json()
        showToast.success(toastMessages.create.success)
        setTimeout(() => {
          window.location.href = `/supervisions/${result.id}`
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.create.error)
      }
    } catch (error) {
      console.error('Error creating supervision:', error)
      showToast.error(toastMessages.create.error)
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
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>โรงเรียน</FormLabel>
                  <FormControl>
                    <Combobox
                      options={schools.map((school) => ({
                        value: school.id,
                        label: `${school.name} (${school.code})`,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="เลือกโรงเรียน"
                      searchPlaceholder="ค้นหาโรงเรียน..."
                      emptyText="ไม่พบโรงเรียน"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                    <Textarea
                      {...field}
                      placeholder="สรุปผลการนิเทศ..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    กรุณากรอกสรุปผลการนิเทศอย่างละเอียด
                  </FormDescription>
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
                  <FormDescription>
                    กรุณากรอกข้อเสนอแนะสำหรับการพัฒนาต่อไป
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ไฟล์แนบ</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiFileUpload
              folder="supervisions"
              id={form.watch('schoolId') || 'temp'}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">ร่าง</SelectItem>
                      <SelectItem value="SUBMITTED">ส่งแล้ว</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    เลือก "ร่าง" เพื่อบันทึกไว้แก้ไขภายหลัง หรือ "ส่งแล้ว" เพื่อส่งให้ผู้ดูแลระบบอนุมัติ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  )
}

