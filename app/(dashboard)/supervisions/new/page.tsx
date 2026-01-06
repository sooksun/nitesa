import DashboardLayout from '@/components/layout/dashboard-layout'
import { CreateSupervisionForm } from '@/components/forms/create-supervision-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewSupervisionPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Only SUPERVISOR and ADMIN can create supervisions
  if (session.user.role !== 'SUPERVISOR' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">สร้างการนิเทศใหม่</h1>
          <p className="text-muted-foreground">กรอกข้อมูลการนิเทศโรงเรียน</p>
        </div>
        <CreateSupervisionForm userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}

