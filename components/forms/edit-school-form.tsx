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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { showToast, toastMessages } from '@/lib/toast'

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
  supervisorIds: z.array(z.string()).optional(),
})

type SchoolFormValues = z.infer<typeof schoolFormSchema>

interface NetworkGroup {
  id: string
  code: string
  name: string
}

interface EditSchoolFormProps {
  school: any
  allSupervisors: Array<{ id: string; name: string; email: string }>
}

export function EditSchoolForm({ school, allSupervisors }: EditSchoolFormProps) {
  const [loading, setLoading] = useState(false)
  const [networkGroups, setNetworkGroups] = useState<NetworkGroup[]>([])
  const router = useRouter()

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      code: school.code,
      name: school.name,
      province: school.province || '',
      district: school.district,
      subDistrict: school.subDistrict || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      principalName: school.principalName || '',
      studentCount: school.studentCount || undefined,
      teacherCount: school.teacherCount || undefined,
      networkGroupId: school.networkGroupId || school.networkGroup?.id || '',
      supervisorIds: school.supervisors?.map((s: any) => s.id) || [],
    },
  })

  // Fetch network groups on mount
  useEffect(() => {
    fetch('/api/network-groups')
      .then((res) => res.json())
      .then((data) => setNetworkGroups(data))
      .catch((error) => console.error('Error fetching network groups:', error))
  }, [])

  const onSubmit = async (data: SchoolFormValues) => {
    setLoading(true)
    try {
      const { supervisorIds, ...schoolData } = data
      // Convert empty strings to null for optional fields
      const cleanedData = {
        ...schoolData,
        province: schoolData.province && schoolData.province.trim() !== '' ? schoolData.province : null,
        subDistrict: schoolData.subDistrict && schoolData.subDistrict.trim() !== '' ? schoolData.subDistrict : null,
        address: schoolData.address && schoolData.address.trim() !== '' ? schoolData.address : null,
        phone: schoolData.phone && schoolData.phone.trim() !== '' ? schoolData.phone : null,
        email: schoolData.email && schoolData.email.trim() !== '' ? schoolData.email : null,
        principalName: schoolData.principalName && schoolData.principalName.trim() !== '' ? schoolData.principalName : null,
        networkGroupId: schoolData.networkGroupId && schoolData.networkGroupId.trim() !== '' ? schoolData.networkGroupId : null,
        supervisorIds,
      }
      const response = await fetch(`/api/schools/${school.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      if (response.ok) {
        showToast.success(toastMessages.update.success)
        setTimeout(() => {
          router.push(`/schools/${school.id}`)
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.update.error)
      }
    } catch (error) {
      console.error('Error updating school:', error)
      showToast.error(toastMessages.update.error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSupervisor = (supervisorId: string) => {
    const current = form.getValues('supervisorIds') || []
    if (current.includes(supervisorId)) {
      form.setValue(
        'supervisorIds',
        current.filter((id) => id !== supervisorId)
      )
    } else {
      form.setValue('supervisorIds', [...current, supervisorId])
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
                    <Input {...field} />
                  </FormControl>
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
                    <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <Textarea {...field} />
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
                      <Input {...field} />
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
                      <Input type="email" {...field} />
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
                    <Input {...field} />
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

        <Card>
          <CardHeader>
            <CardTitle>ศึกษานิเทศก์ที่รับผิดชอบ</CardTitle>
            <CardDescription>เลือกศึกษานิเทศก์ที่รับผิดชอบโรงเรียนนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allSupervisors.map((supervisor) => (
                <div key={supervisor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={supervisor.id}
                    checked={form.watch('supervisorIds')?.includes(supervisor.id) || false}
                    onCheckedChange={() => toggleSupervisor(supervisor.id)}
                  />
                  <label
                    htmlFor={supervisor.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {supervisor.name} ({supervisor.email})
                  </label>
                </div>
              ))}
            </div>
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

