'use client'

import { useForm } from 'react-hook-form'
import { showToast } from '@/lib/toast'
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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const acknowledgeFormSchema = z.object({
  comment: z.string().optional(),
})

type AcknowledgeFormValues = z.infer<typeof acknowledgeFormSchema>

interface AcknowledgeFormProps {
  supervisionId: string
}

export function AcknowledgeForm({ supervisionId }: AcknowledgeFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<AcknowledgeFormValues>({
    resolver: zodResolver(acknowledgeFormSchema),
    defaultValues: {
      comment: '',
    },
  })

  const onSubmit = async (data: AcknowledgeFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/supervisions/${supervisionId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        showToast.success('ตอบรับผลการนิเทศสำเร็จ')
        setTimeout(() => {
          router.push(`/supervisions/${supervisionId}`)
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || 'เกิดข้อผิดพลาดในการตอบรับ')
      }
    } catch (error) {
      console.error('Error acknowledging supervision:', error)
      showToast.error('เกิดข้อผิดพลาดในการตอบรับ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตอบรับผลการนิเทศ</CardTitle>
        <CardDescription>
          กรุณายืนยันว่าคุณได้รับทราบผลการนิเทศและจะดำเนินการตามข้อเสนอแนะ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ความคิดเห็น (ไม่บังคับ)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="ความคิดเห็นเพิ่มเติม..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    คุณสามารถเพิ่มความคิดเห็นหรือข้อเสนอแนะเพิ่มเติมได้
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'ตอบรับ'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

