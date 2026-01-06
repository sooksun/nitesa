import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function ExecutiveReportsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'EXECUTIVE' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const supervisions = await prisma.supervision.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      school: true,
      user: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 20,
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">รายงาน</h1>
            <p className="text-muted-foreground">รายงานสรุปผลการนิเทศการศึกษา</p>
          </div>
          <Button asChild>
            <Link href="/reports/district">รายงานภาพรวมเขต</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายงานการนิเทศที่อนุมัติแล้ว</CardTitle>
            <CardDescription>รายการล่าสุด {supervisions.length} รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supervisions.map((supervision) => (
                <div
                  key={supervision.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{supervision.school.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {supervision.type} - {supervision.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateToBEWithMonth(supervision.date)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/supervisions/${supervision.id}`}>ดูรายงาน</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

