import DashboardLayout from '@/components/layout/dashboard-layout'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SupervisionView } from '@/components/supervision/supervision-view'

export default async function SupervisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params
  const supervision = await prisma.supervision.findUnique({
    where: { id },
    include: {
      school: true,
      user: true,
      indicators: true,
      attachments: true,
      acknowledgement: true,
    },
  })

  if (!supervision) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบการนิเทศที่ต้องการ</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  // Check access permission
  if (session.user.role === 'SUPERVISOR' && supervision.userId !== session.user.id) {
    redirect('/unauthorized')
  }

  if (session.user.role === 'SCHOOL') {
    const school = await prisma.school.findFirst({
      where: { email: session.user.email },
    })
    if (!school || supervision.schoolId !== school.id) {
      redirect('/unauthorized')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">รายละเอียดการนิเทศ</h1>
            <p className="text-muted-foreground">{supervision.school.name}</p>
          </div>
          <div className="flex gap-2">
            {(session.user.role === 'ADMIN' ||
              (session.user.role === 'SUPERVISOR' && supervision.userId === session.user.id)) && (
              <Button variant="outline" asChild>
                <Link href={`/supervisions/${id}/edit`}>แก้ไข</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/supervisions">กลับ</Link>
            </Button>
          </div>
        </div>

        <SupervisionView supervision={supervision} userRole={session.user.role} />
      </div>
    </DashboardLayout>
  )
}

