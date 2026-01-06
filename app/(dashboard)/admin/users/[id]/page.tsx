import DashboardLayout from '@/components/layout/dashboard-layout'
import { EditUserForm } from '@/components/forms/edit-user-form'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditUserPage({
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
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      assignedSchools: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  })

  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบผู้ใช้งานที่ต้องการ</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  const allSchools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขผู้ใช้งาน</h1>
          <p className="text-muted-foreground">{user.name}</p>
        </div>
        <EditUserForm user={user} allSchools={allSchools} />
      </div>
    </DashboardLayout>
  )
}

