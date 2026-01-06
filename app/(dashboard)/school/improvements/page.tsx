import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

export default async function SchoolImprovementsPage() {
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

  const improvements = await prisma.improvement.findMany({
    where: { schoolId: school.id },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const statusLabels: Record<string, string> = {
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    completed: 'เสร็จสิ้น',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">แผนพัฒนา</h1>
            <p className="text-muted-foreground">แผนพัฒนาตามข้อเสนอแนะจากการนิเทศ</p>
          </div>
          <Button asChild>
            <Link href="/school/improvements/new">เพิ่มแผนพัฒนา</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {improvements.map((improvement) => (
            <Card key={improvement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{improvement.title}</CardTitle>
                  <Badge variant="outline">{statusLabels[improvement.status]}</Badge>
                </div>
                <CardDescription>
                  {formatDateToBEWithMonth(improvement.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap line-clamp-4">{improvement.description}</p>
                {improvement.fileUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={improvement.fileUrl} download target="_blank" rel="noopener noreferrer">
                      ดาวน์โหลดไฟล์
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/school/improvements/${improvement.id}`}>ดูรายละเอียด</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {improvements.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              ยังไม่มีแผนพัฒนา
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

