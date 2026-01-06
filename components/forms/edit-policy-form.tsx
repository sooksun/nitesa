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
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PolicyType } from '@prisma/client'

const policyFormSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อนโยบาย'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type PolicyFormValues = z.infer<typeof policyFormSchema>

interface EditPolicyFormProps {
  policy: {
    id: string
    type: PolicyType
    code: string
    title: string
    description: string | null
    isActive: boolean
  }
}

export function EditPolicyForm({ policy }: EditPolicyFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      title: policy.title,
      description: policy.description || '',
      isActive: policy.isActive,
    },
  })

  const onSubmit = async (data: PolicyFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        showToast.success(toastMessages.update.success)
        setTimeout(() => {
          router.push('/admin/policies')
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.update.error)
      }
    } catch (error) {
      console.error('Error updating policy:', error)
      showToast.error(toastMessages.update.error)
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

  const typeColors: Record<PolicyType, string> = {
    NAT_VALUES_LOYALTY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    CIVIC_HISTORY_GEO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    EDU_INNOV_TECH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    READING_CULTURE: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100',
    STUDENT_DEVELOPMENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    SPECIAL_NEEDS_EDU: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    PERSONAL_EXCELLENCE: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
    SCHOOL_SAFETY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    EDU_EQUITY_ACCESS: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
    TEACHER_UPSKILL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    PERSONALIZED_ASSESSMENT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    SMART_GOVERNANCE: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
    REDUCE_TEACHER_WORKLOAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    TEACHER_WELFARE: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100',
    MORAL_QUALITY_LEARNING: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลนโยบาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ประเภทนโยบาย</label>
                <div className="p-3 bg-muted rounded-md">
                  <Badge className={typeColors[policy.type]}>
                    {typeLabels[policy.type]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  ประเภทนโยบายไม่สามารถแก้ไขได้
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">รหัสนโยบาย</label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="font-mono text-sm">{policy.code}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  รหัสนโยบายไม่สามารถแก้ไขได้ (สร้างอัตโนมัติ)
                </p>
              </div>
            </div>

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

