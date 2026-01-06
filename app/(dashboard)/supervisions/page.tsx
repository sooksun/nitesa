import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDateToBEWithMonth } from '@/lib/date-utils'
import { Pagination } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 20

export default async function SupervisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  let where: any = {}

  if (session.user.role === 'SUPERVISOR') {
    where = { userId: session.user.id }
  } else if (session.user.role === 'SCHOOL') {
    const school = await prisma.school.findFirst({
      where: { email: session.user.email },
    })
    if (school) {
      where = { schoolId: school.id }
    } else {
      return (
        <DashboardLayout>
          <Card>
            <CardHeader>
              <CardTitle>ไม่พบข้อมูล</CardTitle>
              <CardDescription>ไม่พบโรงเรียนที่เชื่อมโยงกับบัญชีของคุณ</CardDescription>
            </CardHeader>
          </Card>
        </DashboardLayout>
      )
    }
  }

  const page = parseInt((await searchParams).page || '1', 10)
  const skip = (page - 1) * ITEMS_PER_PAGE

  const [supervisions, totalCount] = await Promise.all([
    prisma.supervision.findMany({
      where,
      include: {
        school: true,
        user: true,
        indicators: true,
        attachments: true, // Include attachments to get thumbnail
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.supervision.count({ where }),
  ])

  const statusLabels: Record<string, string> = {
    DRAFT: 'ร่าง',
    SUBMITTED: 'ส่งแล้ว',
    APPROVED: 'อนุมัติแล้ว',
    PUBLISHED: 'เผยแพร่แล้ว',
    NEEDS_IMPROVEMENT: 'ต้องปรับปรุง',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">การนิเทศ</h1>
            <p className="text-muted-foreground">
              {session.user.role === 'SUPERVISOR'
                ? 'การนิเทศที่คุณสร้าง'
                : session.user.role === 'SCHOOL'
                  ? 'ผลการนิเทศของโรงเรียน'
                  : 'การนิเทศทั้งหมด'}
            </p>
          </div>
          {(session.user.role === 'SUPERVISOR' || session.user.role === 'ADMIN') && (
            <Button asChild>
              <Link href="/supervisions/new">สร้างการนิเทศใหม่</Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการการนิเทศ</CardTitle>
            <CardDescription>ทั้งหมด {supervisions.length} รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supervisions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  ยังไม่มีการนิเทศ
                </p>
              ) : (
                supervisions.map((supervision) => {
                  // Find first image attachment for thumbnail
                  const firstImage = supervision.attachments?.find((att) => {
                    const url = att.fileUrl.toLowerCase()
                    return (
                      url.endsWith('.jpg') ||
                      url.endsWith('.jpeg') ||
                      url.endsWith('.png') ||
                      url.endsWith('.gif') ||
                      url.endsWith('.webp') ||
                      url.endsWith('.bmp')
                    )
                  })

                  return (
                    <div
                      key={supervision.id}
                      className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Thumbnail - Clickable */}
                        {firstImage ? (
                          <Link
                            href={`/supervisions/${supervision.id}`}
                            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={firstImage.fileUrl}
                              alt={firstImage.filename}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          </Link>
                        ) : (
                          <Link
                            href={`/supervisions/${supervision.id}`}
                            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src="/images/cropped-Logo-1-e1742291098816-192x192.png"
                              alt="Logo"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          </Link>
                        )}

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{supervision.school.name}</h3>
                            <Badge variant="outline">{statusLabels[supervision.status]}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {supervision.type} - {supervision.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateToBEWithMonth(supervision.date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ตัวชี้วัด: {supervision.indicators.length} รายการ
                            {supervision.attachments && supervision.attachments.length > 0 && (
                              <> • ไฟล์แนบ: {supervision.attachments.length} ไฟล์</>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/supervisions/${supervision.id}`}>ดูรายละเอียด</Link>
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
            <Pagination
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={page}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

