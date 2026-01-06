import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SupervisionTrendChart } from '@/components/charts/supervision-trend-chart'

export default async function MySchoolsReportPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SUPERVISOR' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const schools = await prisma.school.findMany({
    where: {
      supervisors: {
        some: { id: session.user.id },
      },
    },
    include: {
      supervisions: {
        where: {
          userId: session.user.id,
        },
        include: {
          indicators: true,
        },
      },
    },
  })

  // Get trend data
  const now = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const allSupervisions = schools.flatMap((s) => s.supervisions)
  const recentSupervisions = allSupervisions.filter(
    (s) => new Date(s.date) >= sixMonthsAgo
  )

  const monthlyData: Record<string, { count: number; approved: number }> = {}
  recentSupervisions.forEach((supervision) => {
    const month = new Date(supervision.date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
    })
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, approved: 0 }
    }
    monthlyData[month].count++
    if (supervision.status === 'APPROVED') {
      monthlyData[month].approved++
    }
  })

  const trendData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    count: data.count,
    approved: data.approved,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">รายงานโรงเรียนที่รับผิดชอบ</h1>
          <p className="text-muted-foreground">สรุปผลการนิเทศของโรงเรียนที่คุณรับผิดชอบ</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>โรงเรียนที่รับผิดชอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{schools.length}</div>
              <p className="text-sm text-muted-foreground">โรงเรียน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การนิเทศทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allSupervisions.length}</div>
              <p className="text-sm text-muted-foreground">ครั้ง</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>อัตราการอนุมัติ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {allSupervisions.length > 0
                  ? Math.round(
                      (allSupervisions.filter((s) => s.status === 'APPROVED').length /
                        allSupervisions.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-muted-foreground">การนิเทศที่อนุมัติแล้ว</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มการนิเทศ</CardTitle>
            <CardDescription>จำนวนการนิเทศรายเดือน (6 เดือนล่าสุด)</CardDescription>
          </CardHeader>
          <CardContent>
            <SupervisionTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สรุปผลตามโรงเรียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-semibold">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {school.supervisions.length} ครั้ง
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/schools/${school.id}`}>ดูรายละเอียด</Link>
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

