import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDateToBE } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function SupervisorDashboard() {
  const session = await auth()
  if (!session?.user) return null

  const [assignedSchools, mySupervisions, pendingAcknowledgements] = await Promise.all([
    prisma.school.findMany({
      where: {
        supervisors: {
          some: { id: session.user.id },
        },
      },
    }),
    prisma.supervision.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        school: true,
        acknowledgement: true,
      },
    }),
    prisma.supervision.findMany({
      where: {
        userId: session.user.id,
        status: 'APPROVED',
        acknowledgement: null,
      },
      include: {
        school: true,
      },
    }),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ดศึกษานิเทศก์</h1>
          <p className="text-muted-foreground">ภาพรวมโรงเรียนที่รับผิดชอบ</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โรงเรียนที่รับผิดชอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedSchools.length}</div>
              <p className="text-xs text-muted-foreground">โรงเรียน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การนิเทศของฉัน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySupervisions.length}</div>
              <p className="text-xs text-muted-foreground">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอการตอบรับ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAcknowledgements.length}</div>
              <p className="text-xs text-muted-foreground">รายการ</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>โรงเรียนที่รับผิดชอบ</CardTitle>
              <CardDescription>รายการโรงเรียนที่คุณรับผิดชอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignedSchools.map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.code}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/schools/${school.id}`}>ดูรายละเอียด</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การนิเทศล่าสุด</CardTitle>
              <CardDescription>รายการการนิเทศที่คุณสร้างล่าสุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mySupervisions.map((supervision) => (
                  <div
                    key={supervision.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{supervision.school.name}</p>
                      <p className="text-sm text-muted-foreground">{supervision.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateToBE(supervision.date)}
                      </p>
                    </div>
                    <Badge variant="outline">{supervision.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingAcknowledgements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>รอการตอบรับจากโรงเรียน</CardTitle>
              <CardDescription>
                การนิเทศที่อนุมัติแล้วแต่ยังไม่ได้รับการตอบรับ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingAcknowledgements.map((supervision) => (
                  <div
                    key={supervision.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{supervision.school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(supervision.date).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/supervisions/${supervision.id}`}>ดูรายละเอียด</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>การดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/supervisions/new">สร้างการนิเทศใหม่</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

