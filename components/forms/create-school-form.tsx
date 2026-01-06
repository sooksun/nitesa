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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const schoolFormSchema = z.object({
  code: z.string().min(1, 'กรุณากรอกรหัสโรงเรียน'),
  name: z.string().min(1, 'กรุณากรอกชื่อโรงเรียน'),
  province: z.string().optional(), // จังหวัด
  district: z.string().min(1, 'กรุณากรอกอำเภอ'),
  subDistrict: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  principalName: z.string().optional(),
  studentCount: z.number().int().min(0).nullish(),
  teacherCount: z.number().int().min(0).nullish(),
  networkGroupId: z.string().optional(), // กลุ่มเครือข่าย
})

type SchoolFormValues = z.infer<typeof schoolFormSchema>

interface NetworkGroup {
  id: string
  code: string
  name: string
}

export function CreateSchoolForm() {
  const [loading, setLoading] = useState(false)
  const [networkGroups, setNetworkGroups] = useState<NetworkGroup[]>([])
  const [codeLoading, setCodeLoading] = useState(true)
  const router = useRouter()

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      code: '',
      name: '',
      province: '',
      district: '',
      subDistrict: '',
      address: '',
      phone: '',
      email: '',
      principalName: '',
      studentCount: undefined,
      teacherCount: undefined,
      networkGroupId: '',
    },
  })

  // Fetch auto-generated school code and network groups on mount
  useEffect(() => {
    // Fetch auto-generated school code
    setCodeLoading(true)
    fetch('/api/schools/generate-code')
      .then((res) => res.json())
      .then((data) => {
        if (data.code) {
          form.setValue('code', data.code)
        }
        setCodeLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching school code:', error)
        setCodeLoading(false)
      })

    // Fetch network groups
    fetch('/api/network-groups')
      .then((res) => res.json())
      .then((data) => setNetworkGroups(data))
      .catch((error) => console.error('Error fetching network groups:', error))
  }, [form])

  const onSubmit = async (data: SchoolFormValues) => {
    setLoading(true)
    try {
      // Convert empty strings to null for optional fields
      const cleanedData = {
        ...data,
        province: data.province && data.province.trim() !== '' ? data.province : null,
        subDistrict: data.subDistrict && data.subDistrict.trim() !== '' ? data.subDistrict : null,
        address: data.address && data.address.trim() !== '' ? data.address : null,
        phone: data.phone && data.phone.trim() !== '' ? data.phone : null,
        email: data.email && data.email.trim() !== '' ? data.email : null,
        principalName: data.principalName && data.principalName.trim() !== '' ? data.principalName : null,
        networkGroupId: data.networkGroupId && data.networkGroupId.trim() !== '' ? data.networkGroupId : null,
      }
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      if (response.ok) {
        const result = await response.json()
        showToast.success(toastMessages.create.success)
        setTimeout(() => {
          router.push(`/schools/${result.id}`)
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.create.error)
      }
    } catch (error) {
      console.error('Error creating school:', error)
      showToast.error(toastMessages.create.error)
    } finally {
      setLoading(false)
    }
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสโรงเรียน *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="SCH001"
                      disabled={codeLoading}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    รหัสโรงเรียนจะถูกสร้างอัตโนมัติต่อจากรหัสโรงเรียนท้ายสุด
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อโรงเรียน *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="โรงเรียนบ้านหนองแสง" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จังหวัด</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="จังหวัดสกลนคร" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อำเภอ *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="อำเภอเมือง" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subDistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ตำบล</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ตำบลหนองแสง" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่อยู่</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="123 ถนนหนองแสง" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="02-123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="school@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="principalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ผู้อำนวยการ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="นายทดสอบ ระบบ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนนักเรียน</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="500" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนครู</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="25" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="networkGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>กลุ่มเครือข่าย</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value || undefined)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกกลุ่มเครือข่าย" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {networkGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.code} - {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>เลือกกลุ่มเครือข่ายของโรงเรียน</FormDescription>
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  )
}

