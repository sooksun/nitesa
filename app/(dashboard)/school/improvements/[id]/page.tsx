import DashboardLayout from '@/components/layout/dashboard-layout'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

export default async function ImprovementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params
  const improvement = await prisma.improvement.findUnique({
    where: { id },
    include: {
      school: true,
      user: true,
    },
  })

  if (!improvement) {
    redirect('/school/improvements')
  }

  // Check permission
  if (session.user.role === 'SCHOOL') {
    const school = await prisma.school.findFirst({
      where: { email: session.user.email },
    })
    if (!school || school.id !== improvement.schoolId) {
      redirect('/unauthorized')
    }
  }

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
            <h1 className="text-3xl font-bold">{improvement.title}</h1>
            <p className="text-muted-foreground">{improvement.school.name}</p>
          </div>
          <Badge variant="outline">{statusLabels[improvement.status]}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดแผนพัฒนา</CardTitle>
            <CardDescription>
              สร้างเมื่อ {formatDateToBEWithMonth(improvement.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">สถานะ</p>
              <Badge variant="outline">{statusLabels[improvement.status]}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">รายละเอียด</p>
              <p className="whitespace-pre-wrap">{improvement.description}</p>
            </div>
            {improvement.fileUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">ไฟล์แนบ</p>
                <a
                  href={improvement.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ดาวน์โหลดไฟล์
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

