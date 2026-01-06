'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Download, Settings } from 'lucide-react'
import Link from 'next/link'
import { Role } from '@prisma/client'

interface QuickActionsProps {
  role: Role
}

export function QuickActions({ role }: QuickActionsProps) {
  const actions = []

  if (role === Role.ADMIN || role === Role.SUPERVISOR) {
    actions.push({
      label: 'สร้างการนิเทศใหม่',
      href: '/supervisions/new',
      icon: Plus,
      variant: 'default' as const,
    })
  }

  if (role === Role.ADMIN) {
    actions.push(
      {
        label: 'เพิ่มโรงเรียน',
        href: '/admin/schools/new',
        icon: Plus,
        variant: 'outline' as const,
      },
      {
        label: 'เพิ่มผู้ใช้งาน',
        href: '/admin/users/new',
        icon: Plus,
        variant: 'outline' as const,
      },
      {
        label: 'ตั้งค่าระบบ',
        href: '/admin/settings',
        icon: Settings,
        variant: 'outline' as const,
      }
    )
  }

  if (role === Role.ADMIN || role === Role.EXECUTIVE) {
    actions.push({
      label: 'Export รายงาน',
      href: '/reports/district',
      icon: Download,
      variant: 'outline' as const,
    })
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การดำเนินการด่วน</CardTitle>
        <CardDescription>เข้าถึงฟีเจอร์หลักได้อย่างรวดเร็ว</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.href} variant={action.variant} asChild>
                <Link href={action.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

