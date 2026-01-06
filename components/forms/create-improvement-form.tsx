'use client'

import { useForm } from 'react-hook-form'
import { showToast, toastMessages } from '@/lib/toast'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const improvementFormSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อแผนพัฒนา'),
  description: z.string().min(10, 'กรุณากรอกรายละเอียด (อย่างน้อย 10 ตัวอักษร)'),
  fileUrl: z.string().optional(),
})

type ImprovementFormValues = z.infer<typeof improvementFormSchema>

interface CreateImprovementFormProps {
  schoolId: string
  userId: string
}

export function CreateImprovementForm({ schoolId, userId }: CreateImprovementFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ImprovementFormValues>({
    resolver: zodResolver(improvementFormSchema),
    defaultValues: {
      title: '',
      description: '',
      fileUrl: '',
    },
  })

  const onSubmit = async (data: ImprovementFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/improvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          schoolId,
          userId,
        }),
      })

      if (response.ok) {
        showToast.success(toastMessages.create.success)
        setTimeout(() => {
          router.push('/school/improvements')
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.create.error)
      }
    } catch (error) {
      console.error('Error creating improvement:', error)
      showToast.error(toastMessages.create.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลแผนพัฒนา</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อแผนพัฒนา *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="เช่น แผนพัฒนาการจัดการเรียนการสอน" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="รายละเอียดแผนพัฒนา..."
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormDescription>
                    กรุณากรอกรายละเอียดแผนพัฒนาตามข้อเสนอแนะจากการนิเทศ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </CardContent>
    </Card>
  )
}

