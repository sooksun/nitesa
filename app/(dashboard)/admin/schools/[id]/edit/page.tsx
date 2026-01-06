import DashboardLayout from '@/components/layout/dashboard-layout'
import { EditSchoolForm } from '@/components/forms/edit-school-form'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const { id } = await params
  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      supervisors: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      networkGroup: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  })

  if (!school) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบโรงเรียนที่ต้องการ</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  const allSupervisors = await prisma.user.findMany({
    where: { role: 'SUPERVISOR' },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขโรงเรียน</h1>
          <p className="text-muted-foreground">{school.name}</p>
        </div>
        <EditSchoolForm school={school} allSupervisors={allSupervisors} />
      </div>
    </DashboardLayout>
  )
}

