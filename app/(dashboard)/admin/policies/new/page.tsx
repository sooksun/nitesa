import DashboardLayout from '@/components/layout/dashboard-layout'
import { CreatePolicyForm } from '@/components/forms/create-policy-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewPolicyPage() {
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
          <h1 className="text-3xl font-bold">เพิ่มนโยบายใหม่</h1>
          <p className="text-muted-foreground">สร้างนโยบายใหม่สำหรับระบบ</p>
        </div>
        <CreatePolicyForm />
      </div>
    </DashboardLayout>
  )
}

