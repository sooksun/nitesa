import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/forms/settings-form'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const supervisionTypes = await prisma.systemSetting.findUnique({
    where: { key: 'supervision_types' },
  })

  const indicatorCriteria = await prisma.systemSetting.findUnique({
    where: { key: 'indicator_criteria' },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
          <p className="text-muted-foreground">จัดการการตั้งค่าระบบนิเทศการศึกษา</p>
        </div>

        <SettingsForm
          supervisionTypes={
            supervisionTypes?.value as string[] || [
              'นิเทศการสอน',
              'ติดตามโครงการ',
              'นิเทศทั่วไป',
              'นิเทศเฉพาะเรื่อง',
            ]
          }
          indicatorCriteria={
            indicatorCriteria?.value as any || {
              EXCELLENT: { min: 90, label: 'ดีเยี่ยม' },
              GOOD: { min: 75, max: 89, label: 'ดี' },
              FAIR: { min: 60, max: 74, label: 'พอใช้' },
              NEEDS_WORK: { max: 59, label: 'ต้องพัฒนา' },
            }
          }
        />
      </div>
    </DashboardLayout>
  )
}

