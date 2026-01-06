import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function SchoolTimelinePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SCHOOL') {
    redirect('/unauthorized')
  }

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

  const supervisions = await prisma.supervision.findMany({
    where: { schoolId: school.id },
    include: {
      user: true,
      indicators: true,
      acknowledgement: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  const statusLabels: Record<string, string> = {
    DRAFT: 'ร่าง',
    SUBMITTED: 'ส่งแล้ว',
    APPROVED: 'อนุมัติแล้ว',
    PUBLISHED: 'เผยแพร่แล้ว',
    NEEDS_IMPROVEMENT: 'ต้องปรับปรุง',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ไทม์ไลน์การนิเทศ</h1>
          <p className="text-muted-foreground">{school.name}</p>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
          <div className="space-y-8">
            {supervisions.map((supervision, index) => (
              <div key={supervision.id} className="relative pl-12">
                <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-primary border-4 border-background"></div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{supervision.type}</CardTitle>
                        <CardDescription>
                          {formatDateToBEWithMonth(supervision.date)} -{' '}
                          {supervision.user.name}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{statusLabels[supervision.status]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-2">{supervision.summary}</p>
                    <div className="flex gap-2 flex-wrap">
                      {supervision.indicators.map((indicator) => (
                        <Badge key={indicator.id} variant="secondary">
                          {indicator.name}: {indicator.level}
                        </Badge>
                      ))}
                    </div>
                    {supervision.acknowledgement && (
                      <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✓ ตอบรับแล้วเมื่อ{' '}
                          {formatDateToBEWithMonth(supervision.acknowledgement.acknowledgedAt)}
                        </p>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/supervisions/${supervision.id}`}>ดูรายละเอียด</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {supervisions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              ยังไม่มีการนิเทศ
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

