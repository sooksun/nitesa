import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { formatDateToBE } from '@/lib/date-utils'
import { School, FileText, Users, BarChart3 } from 'lucide-react'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [totalSchools, totalSupervisions, totalUsers, recentSupervisions] = await Promise.all([
    prisma.school.count(),
    prisma.supervision.count(),
    prisma.user.count(),
    prisma.supervision.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        school: true,
        user: true,
      },
    }),
  ])

  const approvedCount = await prisma.supervision.count({
    where: { status: 'APPROVED' },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-muted-foreground">ภาพรวมระบบนิเทศการศึกษาทั้งเขต</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-green-800 dark:text-green-200">
                โรงเรียนทั้งหมด
              </CardTitle>
              <School className="h-10 w-10 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-700 dark:text-green-300">
                {totalSchools}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">โรงเรียนในเขตพื้นที่</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-yellow-800 dark:text-yellow-200">
                การนิเทศทั้งหมด
              </CardTitle>
              <FileText className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">
                {totalSupervisions}
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {approvedCount} รายการที่อนุมัติแล้ว
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-pink-800 dark:text-pink-200">
                ผู้ใช้งาน
              </CardTitle>
              <Users className="h-10 w-10 text-pink-600 dark:text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-pink-700 dark:text-pink-300">
                {totalUsers}
              </div>
              <p className="text-sm text-pink-600 dark:text-pink-400">ผู้ใช้งานในระบบ</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-purple-800 dark:text-purple-200">
                อัตราการอนุมัติ
              </CardTitle>
              <BarChart3 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {totalSupervisions > 0
                  ? Math.round((approvedCount / totalSupervisions) * 100)
                  : 0}
                %
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">การนิเทศที่อนุมัติแล้ว</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Section */}
        <AnalyticsCharts />

        <Card>
          <CardHeader>
            <CardTitle>การนิเทศล่าสุด</CardTitle>
            <CardDescription>รายการการนิเทศที่เพิ่งสร้างล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSupervisions.map((supervision) => (
                <div
                  key={supervision.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{supervision.school.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {supervision.type} - {supervision.user.name}
                    </p>
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
    </DashboardLayout>
  )
}

