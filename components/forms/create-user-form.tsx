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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import { Checkbox } from '@/components/ui/checkbox'

const userFormSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  role: z.nativeEnum(Role),
  assignedSchoolIds: z.array(z.string()).optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function CreateUserForm() {
  const [loading, setLoading] = useState(false)
  const [schools, setSchools] = useState<Array<{ id: string; name: string; code: string }>>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/schools')
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((error) => console.error('Error fetching schools:', error))
  }, [])

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: Role.SCHOOL,
      assignedSchoolIds: [],
    },
  })

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        showToast.success(toastMessages.create.success)
        setTimeout(() => {
          router.push('/admin/users')
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.create.error)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      showToast.error(toastMessages.create.error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSchool = (schoolId: string) => {
    const current = form.getValues('assignedSchoolIds') || []
    if (current.includes(schoolId)) {
      form.setValue(
        'assignedSchoolIds',
        current.filter((id) => id !== schoolId)
      )
    } else {
      form.setValue('assignedSchoolIds', [...current, schoolId])
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลผู้ใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="user@example.com" />
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
                  <FormLabel>ชื่อ *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ชื่อผู้ใช้งาน" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="••••••••" />
                  </FormControl>
                  <FormDescription>รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บทบาท *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as Role)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN}>ผู้ดูแลระบบ</SelectItem>
                      <SelectItem value={Role.SUPERVISOR}>ศึกษานิเทศก์</SelectItem>
                      <SelectItem value={Role.SCHOOL}>โรงเรียน</SelectItem>
                      <SelectItem value={Role.EXECUTIVE}>ผู้บริหารระดับสูง</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {form.watch('role') === Role.SUPERVISOR && (
          <Card>
            <CardHeader>
              <CardTitle>โรงเรียนที่รับผิดชอบ</CardTitle>
              <CardDescription>เลือกโรงเรียนที่ศึกษานิเทศก์คนนี้รับผิดชอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={school.id}
                      checked={form.watch('assignedSchoolIds')?.includes(school.id) || false}
                      onCheckedChange={() => toggleSchool(school.id)}
                    />
                    <label
                      htmlFor={school.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {school.name} ({school.code})
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

