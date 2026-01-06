import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDateToBE, formatDateToBEWithMonth } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function SchoolDashboard() {
  const session = await auth()
  if (!session?.user) return null

  // In a real app, we'd get the school from the user's schoolId
  // For now, we'll get the first school (this should be linked properly)
  const school = await prisma.school.findFirst({
    where: {
      email: session.user.email,
    },
  })

  if (!school) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูลโรงเรียน</CardTitle>
            <CardDescription>
              กรุณาติดต่อผู้ดูแลระบบเพื่อเชื่อมโยงบัญชีของคุณกับโรงเรียน
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  const [supervisions, latestSupervision, improvements] = await Promise.all([
    prisma.supervision.findMany({
      where: { schoolId: school.id },
      orderBy: { date: 'desc' },
      include: {
        user: true,
        indicators: true,
        acknowledgement: true,
      },
    }),
    prisma.supervision.findFirst({
      where: { schoolId: school.id },
      orderBy: { date: 'desc' },
      include: {
        user: true,
        indicators: true,
        acknowledgement: true,
      },
    }),
    prisma.improvement.findMany({
      where: { schoolId: school.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แดชบอร์ดโรงเรียน</h1>
          <p className="text-muted-foreground">ข้อมูลโรงเรียน: {school.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การนิเทศทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supervisions.length}</div>
              <p className="text-xs text-muted-foreground">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนนักเรียน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{school.studentCount || 0}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนครู</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{school.teacherCount || 0}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
        </div>

        {latestSupervision && (
          <Card>
            <CardHeader>
              <CardTitle>ผลการนิเทศล่าสุด</CardTitle>
              <CardDescription>
                การนิเทศเมื่อ {formatDateToBEWithMonth(latestSupervision.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">ผู้นิเทศ</p>
                <p className="font-medium">{latestSupervision.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ประเภท</p>
                <p className="font-medium">{latestSupervision.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">สถานะ</p>
                <Badge variant="outline">{latestSupervision.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">ตัวชี้วัด</p>
                <div className="space-y-2">
                  {latestSupervision.indicators.map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between">
                      <span className="text-sm">{indicator.name}</span>
                      <Badge variant="secondary">{indicator.level}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              {latestSupervision.acknowledgement ? (
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✓ ตอบรับแล้วเมื่อ{' '}
                    {formatDateToBEWithMonth(latestSupervision.acknowledgement.acknowledgedAt)}
                  </p>
                </div>
              ) : (
                <Button asChild>
                  <Link href={`/supervisions/${latestSupervision.id}`}>ดูรายละเอียด</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการนิเทศ</CardTitle>
              <CardDescription>รายการการนิเทศทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supervisions.slice(0, 5).map((supervision) => (
                  <div
                    key={supervision.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{supervision.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateToBE(supervision.date)} -{' '}
                        {supervision.user.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/supervisions/${supervision.id}`}>ดู</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>แผนพัฒนา</CardTitle>
              <CardDescription>แผนพัฒนาตามข้อเสนอแนะ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.map((improvement) => (
                    <div
                      key={improvement.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{improvement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateToBEWithMonth(improvement.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{improvement.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">ยังไม่มีแผนพัฒนา</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

