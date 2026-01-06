import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SupervisionTrendChart } from '@/components/charts/supervision-trend-chart'
import { IndicatorHeatmap } from '@/components/charts/indicator-heatmap'

export default async function ExecutiveAnalyticsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'EXECUTIVE' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // Get analytics data
  const now = new Date()
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const supervisions = await prisma.supervision.findMany({
    where: {
      date: {
        gte: twelveMonthsAgo,
      },
    },
    include: {
      indicators: true,
    },
  })

  // Group by month
  const monthlyData: Record<string, { count: number; approved: number }> = {}
  supervisions.forEach((supervision) => {
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

  // Get indicator statistics
  const indicators = await prisma.indicator.findMany({
    include: {
      supervision: true,
    },
  })

  type IndicatorStats = {
    EXCELLENT: number
    GOOD: number
    FAIR: number
    NEEDS_WORK: number
  }

  const indicatorStats: Record<string, IndicatorStats> = {}
  indicators.forEach((indicator) => {
    if (!indicatorStats[indicator.name]) {
      indicatorStats[indicator.name] = {
        EXCELLENT: 0,
        GOOD: 0,
        FAIR: 0,
        NEEDS_WORK: 0,
      }
    }
    const level = indicator.level as keyof IndicatorStats
    if (level in indicatorStats[indicator.name]) {
      indicatorStats[indicator.name][level]++
    }
  })

  const heatmapData: Array<{
    name: string
    EXCELLENT: number
    GOOD: number
    FAIR: number
    NEEDS_WORK: number
  }> = Object.entries(indicatorStats).map(([name, stats]) => ({
    name,
    EXCELLENT: stats.EXCELLENT,
    GOOD: stats.GOOD,
    FAIR: stats.FAIR,
    NEEDS_WORK: stats.NEEDS_WORK,
  }))

  // Get district statistics
  const districtStats = await prisma.school.groupBy({
    by: ['district'],
    _count: { id: true },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">การวิเคราะห์ข้อมูล</h1>
          <p className="text-muted-foreground">การวิเคราะห์และสถิติการนิเทศการศึกษา</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>การนิเทศทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{supervisions.length}</div>
              <p className="text-sm text-muted-foreground">ใน 12 เดือนล่าสุด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>อัตราการอนุมัติ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {supervisions.length > 0
                  ? Math.round(
                      (supervisions.filter((s) => s.status === 'APPROVED').length /
                        supervisions.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-muted-foreground">การนิเทศที่อนุมัติแล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>จำนวนอำเภอ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{districtStats.length}</div>
              <p className="text-sm text-muted-foreground">อำเภอในเขตพื้นที่</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มการนิเทศ</CardTitle>
            <CardDescription>จำนวนการนิเทศรายเดือน (12 เดือนล่าสุด)</CardDescription>
          </CardHeader>
          <CardContent>
            <SupervisionTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ตัวชี้วัด</CardTitle>
            <CardDescription>สรุปผลตัวชี้วัดทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <IndicatorHeatmap data={heatmapData} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

