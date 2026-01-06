import DashboardLayout from '@/components/layout/dashboard-layout'
import { EditPolicyForm } from '@/components/forms/edit-policy-form'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditPolicyPage({
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
  const policy = await prisma.policy.findUnique({
    where: { id },
  })

  if (!policy) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบนโยบายที่ต้องการ</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขนโยบาย</h1>
          <p className="text-muted-foreground">{policy.title}</p>
        </div>
        <EditPolicyForm policy={policy} />
      </div>
    </DashboardLayout>
  )
}

