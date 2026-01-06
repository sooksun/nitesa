import DashboardLayout from '@/components/layout/dashboard-layout'
import { CreateUserForm } from '@/components/forms/create-user-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewUserPage() {
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
          <h1 className="text-3xl font-bold">เพิ่มผู้ใช้งาน</h1>
          <p className="text-muted-foreground">กรอกข้อมูลผู้ใช้งานใหม่</p>
        </div>
        <CreateUserForm />
      </div>
    </DashboardLayout>
  )
}

