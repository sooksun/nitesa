import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function SupervisorSchoolsPage() {
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
      networkGroup: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      _count: {
        select: {
          supervisions: true,
        },
      },
      supervisions: {
        orderBy: {
          date: 'desc',
        },
        take: 1,
        include: {
          indicators: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">โรงเรียนที่รับผิดชอบ</h1>
          <p className="text-muted-foreground">ทั้งหมด {schools.length} โรงเรียน</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Card key={school.id}>
              <CardHeader>
                <CardTitle>{school.name}</CardTitle>
                <CardDescription>{school.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">อำเภอ</p>
                  <p className="font-medium">{school.district}</p>
                </div>
                {school.networkGroup && (
                  <div>
                    <p className="text-sm text-muted-foreground">กลุ่มเครือข่าย</p>
                    <p className="font-medium">
                      {school.networkGroup.code} - {school.networkGroup.name}
                    </p>
                  </div>
                )}
                {school.principalName && (
                  <div>
                    <p className="text-sm text-muted-foreground">ผู้อำนวยการ</p>
                    <p className="font-medium">{school.principalName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">การนิเทศ</p>
                  <p className="font-medium">{school._count.supervisions} ครั้ง</p>
                </div>
                {school.supervisions[0] && (
                  <div>
                    <p className="text-sm text-muted-foreground">การนิเทศล่าสุด</p>
                    <p className="text-sm">
                      {new Date(school.supervisions[0].date).toLocaleDateString('th-TH')}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {school.supervisions[0].indicators.map((ind) => (
                        <Badge key={ind.id} variant="secondary" className="text-xs">
                          {ind.level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/schools/${school.id}`}>ดูรายละเอียด</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href={`/supervisions/new?schoolId=${school.id}`}>สร้างการนิเทศ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schools.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              ยังไม่มีโรงเรียนที่รับผิดชอบ
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

