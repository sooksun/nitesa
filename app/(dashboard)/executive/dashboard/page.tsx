import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'

export default async function ExecutiveDashboard() {
  const [
    totalSchools,
    totalSupervisions,
    approvedSupervisions,
    districtStats,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.supervision.count(),
    prisma.supervision.count({ where: { status: 'APPROVED' } }),
    prisma.school.groupBy({
      by: ['district'],
      _count: { id: true },
    }),
  ])

  const approvalRate =
    totalSupervisions > 0 ? Math.round((approvedSupervisions / totalSupervisions) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ดผู้บริหารระดับสูง</h1>
          <p className="text-muted-foreground">ภาพรวมระบบนิเทศการศึกษาทั้งเขต</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โรงเรียนทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSchools}</div>
              <p className="text-xs text-muted-foreground">โรงเรียนในเขตพื้นที่</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การนิเทศทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSupervisions}</div>
              <p className="text-xs text-muted-foreground">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การนิเทศที่อนุมัติ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedSupervisions}</div>
              <p className="text-xs text-muted-foreground">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการอนุมัติ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">เปอร์เซ็นต์</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>สถิติตามอำเภอ</CardTitle>
            <CardDescription>จำนวนโรงเรียนในแต่ละอำเภอ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {districtStats.map((stat) => (
                <div
                  key={stat.district}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <p className="font-medium">{stat.district}</p>
                  <p className="text-sm text-muted-foreground">{stat._count.id} โรงเรียน</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

