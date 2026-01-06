import DashboardLayout from '@/components/layout/dashboard-layout'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ExcelImport } from '@/components/import/excel-import'

export default async function ImportPage() {
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
          <h1 className="text-3xl font-bold">นำเข้าข้อมูลจาก Excel</h1>
          <p className="text-muted-foreground">
            นำเข้าข้อมูลโรงเรียน, กลุ่มเครือข่าย, และนโยบายจากไฟล์ Excel
          </p>
        </div>

        <ExcelImport />
      </div>
    </DashboardLayout>
  )
}

