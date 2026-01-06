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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PolicyType } from '@prisma/client'

const policyFormSchema = z.object({
  type: z.nativeEnum(PolicyType),
  code: z.string().min(1, 'กรุณากรอกรหัสนโยบาย'),
  title: z.string().min(1, 'กรุณากรอกชื่อนโยบาย'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type PolicyFormValues = z.infer<typeof policyFormSchema>

export function CreatePolicyForm() {
  const [loading, setLoading] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const router = useRouter()

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      type: PolicyType.NAT_VALUES_LOYALTY,
      code: '',
      title: '',
      description: '',
      isActive: true,
    },
  })

  const selectedType = form.watch('type')

  // Auto-generate code when type is selected
  useEffect(() => {
    if (selectedType) {
      const generateCode = async () => {
        setGeneratingCode(true)
        try {
          const response = await fetch(`/api/policies/generate-code?type=${selectedType}`)
          if (response.ok) {
            const data = await response.json()
            form.setValue('code', data.code)
          }
        } catch (error) {
          console.error('Error generating code:', error)
        } finally {
          setGeneratingCode(false)
        }
      }
      generateCode()
    }
  }, [selectedType, form])

  const onSubmit = async (data: PolicyFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        showToast.success(toastMessages.create.success)
        setTimeout(() => {
          router.push('/admin/policies')
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.create.error)
      }
    } catch (error) {
      console.error('Error creating policy:', error)
      showToast.error(toastMessages.create.error)
    } finally {
      setLoading(false)
    }
  }

  const typeLabels: Record<PolicyType, string> = {
    NAT_VALUES_LOYALTY: 'คุณธรรม จริยธรรม ความเป็นไทย และความภาคภูมิใจในความเป็นไทย',
    CIVIC_HISTORY_GEO: 'หน้าที่พลเมือง ประวัติศาสตร์ และภูมิศาสตร์',
    EDU_INNOV_TECH: 'การศึกษาเพื่อการพัฒนาทักษะในศตวรรษที่ 21 และนวัตกรรมเทคโนโลยี',
    READING_CULTURE: 'การส่งเสริมการอ่านและวัฒนธรรมการอ่าน',
    STUDENT_DEVELOPMENT: 'การพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา',
    SPECIAL_NEEDS_EDU: 'การจัดการศึกษาสำหรับผู้เรียนที่มีความต้องการพิเศษ',
    PERSONAL_EXCELLENCE: 'การส่งเสริมความเป็นเลิศของผู้เรียน',
    SCHOOL_SAFETY: 'ความปลอดภัยในสถานศึกษา',
    EDU_EQUITY_ACCESS: 'ความเสมอภาคทางการศึกษาและการเข้าถึงการศึกษา',
    TEACHER_UPSKILL: 'การพัฒนาครูและบุคลากรทางการศึกษา',
    PERSONALIZED_ASSESSMENT: 'การประเมินผลการเรียนรู้ที่หลากหลายและเหมาะสมกับผู้เรียน',
    SMART_GOVERNANCE: 'การบริหารจัดการสถานศึกษาอย่างมีประสิทธิภาพ',
    REDUCE_TEACHER_WORKLOAD: 'การลดภาระงานครู',
    TEACHER_WELFARE: 'สวัสดิการครูและบุคลากรทางการศึกษา',
    MORAL_QUALITY_LEARNING: 'คุณภาพการเรียนรู้ที่เน้นคุณธรรม',
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลนโยบาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทนโยบาย *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as PolicyType)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทนโยบาย" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PolicyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>เลือกประเภทนโยบายที่ต้องการสร้าง</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสนโยบาย *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        placeholder="เช่น POL-MIN-001"
                        readOnly
                        className="bg-muted"
                      />
                      {generatingCode && (
                        <span className="text-sm text-muted-foreground flex items-center">
                          กำลังสร้าง...
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    รหัสจะถูกสร้างอัตโนมัติตามประเภทนโยบาย (รูปแบบ: POL-{'{TYPE}'}-{'{NUMBER}'})
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อนโยบาย *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="เช่น นโยบายการพัฒนาคุณภาพการศึกษา" />
                  </FormControl>
                  <FormDescription>ชื่อหรือหัวข้อของนโยบาย</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="อธิบายรายละเอียดของนโยบาย..."
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>รายละเอียดเพิ่มเติมเกี่ยวกับนโยบาย</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>สถานะการใช้งาน</FormLabel>
                    <FormDescription>
                      เปิดใช้งานนโยบายนี้ (ถ้าไม่เลือก นโยบายจะไม่แสดงใน dropdown)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  )
}

