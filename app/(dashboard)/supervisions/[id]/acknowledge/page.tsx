import DashboardLayout from '@/components/layout/dashboard-layout'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AcknowledgeForm } from '@/components/forms/acknowledge-form'

export default async function AcknowledgePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SCHOOL') {
    redirect('/unauthorized')
  }

  const { id } = await params
  const supervision = await prisma.supervision.findUnique({
    where: { id },
    include: {
      school: true,
      user: true,
    },
  })

  if (!supervision) {
    redirect('/supervisions')
  }

  // Check if school matches
  const school = await prisma.school.findFirst({
    where: { email: session.user.email },
  })

  if (!school || school.id !== supervision.schoolId) {
    redirect('/unauthorized')
  }

  if (supervision.status !== 'APPROVED') {
    redirect(`/supervisions/${id}`)
  }

  const existing = await prisma.acknowledgement.findUnique({
    where: { supervisionId: id },
  })

  if (existing) {
    redirect(`/supervisions/${id}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ตอบรับผลการนิเทศ</h1>
          <p className="text-muted-foreground">{supervision.school.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลการนิเทศ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-muted-foreground">วันที่:</span>{' '}
              {new Date(supervision.date).toLocaleDateString('th-TH')}
            </p>
            <p>
              <span className="text-muted-foreground">ประเภท:</span> {supervision.type}
            </p>
            <p>
              <span className="text-muted-foreground">ผู้นิเทศ:</span> {supervision.user.name}
            </p>
          </CardContent>
        </Card>

        <AcknowledgeForm supervisionId={id} />
      </div>
    </DashboardLayout>
  )
}

