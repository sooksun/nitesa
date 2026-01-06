import DashboardLayout from '@/components/layout/dashboard-layout'
import { CreateImprovementForm } from '@/components/forms/create-improvement-form'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewImprovementPage() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">เพิ่มแผนพัฒนา</h1>
          <p className="text-muted-foreground">{school.name}</p>
        </div>
        <CreateImprovementForm schoolId={school.id} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}

