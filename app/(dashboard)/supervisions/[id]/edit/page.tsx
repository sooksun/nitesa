import DashboardLayout from '@/components/layout/dashboard-layout'
import { EditSupervisionForm } from '@/components/forms/edit-supervision-form'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function EditSupervisionPage({
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
      indicators: true,
      attachments: true,
    },
  })

  if (!supervision) {
    redirect('/supervisions')
  }

  // Check permission
  if (
    session.user.role !== 'ADMIN' &&
    (session.user.role !== 'SUPERVISOR' || supervision.userId !== session.user.id)
  ) {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">แก้ไขการนิเทศ</h1>
          <p className="text-muted-foreground">{supervision.school.name}</p>
        </div>
        <EditSupervisionForm supervision={supervision} />
      </div>
    </DashboardLayout>
  )
}

