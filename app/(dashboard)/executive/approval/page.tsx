import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function ExecutiveApprovalPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'EXECUTIVE' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const pendingReports = await prisma.supervision.findMany({
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
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">อนุมัติรายงาน</h1>
          <p className="text-muted-foreground">รายงานที่รอการอนุมัติเผยแพร่</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายงานรอการอนุมัติ</CardTitle>
            <CardDescription>ทั้งหมด {pendingReports.length} รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReports.map((supervision) => (
                <div
                  key={supervision.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{supervision.school.name}</h3>
                      <Badge variant="outline">อนุมัติแล้ว</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supervision.type} - {supervision.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateToBEWithMonth(supervision.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/supervisions/${supervision.id}`}>ดูรายละเอียด</Link>
                    </Button>
                    <Button size="sm">อนุมัติเผยแพร่</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

