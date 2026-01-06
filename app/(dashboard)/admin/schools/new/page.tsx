import DashboardLayout from '@/components/layout/dashboard-layout'
import { CreateSchoolForm } from '@/components/forms/create-school-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewSchoolPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">เพิ่มโรงเรียน</h1>
          <p className="text-muted-foreground">กรอกข้อมูลโรงเรียนใหม่</p>
        </div>
        <CreateSchoolForm />
      </div>
    </DashboardLayout>
  )
}

