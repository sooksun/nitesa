import DashboardLayout from '@/components/layout/dashboard-layout'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateToBEWithMonth } from '@/lib/date-utils'

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params
  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      supervisors: true,
      networkGroup: true,
      supervisions: {
        include: {
          user: true,
          indicators: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
      improvements: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!school) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>ไม่พบข้อมูล</CardTitle>
            <CardDescription>ไม่พบโรงเรียนที่ต้องการ</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    )
  }

  // Check access permission
  if (session.user.role === 'SCHOOL') {
    const userSchool = await prisma.school.findFirst({
      where: { email: session.user.email },
    })
    if (!userSchool || userSchool.id !== school.id) {
      redirect('/unauthorized')
    }
  }

  if (session.user.role === 'SUPERVISOR') {
    const isAssigned = school.supervisors.some((s) => s.id === session.user.id)
    if (!isAssigned) {
      redirect('/unauthorized')
    }
  }

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
            <h1 className="text-3xl font-bold">{school.name}</h1>
            <p className="text-muted-foreground">รหัส: {school.code}</p>
          </div>
          <div className="flex gap-2">
            {session.user.role === 'ADMIN' && (
              <Button variant="default" asChild>
                <Link href={`/admin/schools/${school.id}/edit`}>แก้ไขข้อมูล</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/schools">กลับ</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">ข้อมูลโรงเรียน</TabsTrigger>
            <TabsTrigger value="supervisions">การนิเทศ</TabsTrigger>
            <TabsTrigger value="improvements">แผนพัฒนา</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {school.province && (
                    <div>
                      <p className="text-sm text-muted-foreground">จังหวัด</p>
                      <p className="font-medium">{school.province}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">อำเภอ</p>
                    <p className="font-medium">{school.district}</p>
                  </div>
                  {school.subDistrict && (
                    <div>
                      <p className="text-sm text-muted-foreground">ตำบล</p>
                      <p className="font-medium">{school.subDistrict}</p>
                    </div>
                  )}
                  {school.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">ที่อยู่</p>
                      <p className="font-medium">{school.address}</p>
                    </div>
                  )}
                  {school.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">โทรศัพท์</p>
                      <p className="font-medium">{school.phone}</p>
                    </div>
                  )}
                  {school.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">อีเมล</p>
                      <p className="font-medium">{school.email}</p>
                    </div>
                  )}
                  {school.principalName && (
                    <div>
                      <p className="text-sm text-muted-foreground">ผู้อำนวยการ</p>
                      <p className="font-medium">{school.principalName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนนักเรียน</p>
                    <p className="font-medium">{school.studentCount || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนครู</p>
                    <p className="font-medium">{school.teacherCount || '-'}</p>
                  </div>
                  {school.networkGroup && (
                    <div>
                      <p className="text-sm text-muted-foreground">กลุ่มเครือข่าย</p>
                      <p className="font-medium">
                        {school.networkGroup.code} - {school.networkGroup.name}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {school.supervisors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>ศึกษานิเทศก์ที่รับผิดชอบ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {school.supervisors.map((supervisor) => (
                      <div key={supervisor.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{supervisor.name}</p>
                          <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="supervisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการนิเทศ</CardTitle>
                <CardDescription>ทั้งหมด {school.supervisions.length} รายการ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {school.supervisions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      ยังไม่มีการนิเทศ
                    </p>
                  ) : (
                    school.supervisions.map((supervision) => (
                      <div
                        key={supervision.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{supervision.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDateToBEWithMonth(supervision.date)} -{' '}
                              {supervision.user.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{statusLabels[supervision.status]}</Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/supervisions/${supervision.id}`}>ดูรายละเอียด</Link>
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {supervision.summary}
                        </p>
                        <div className="flex gap-2">
                          {supervision.indicators.map((indicator) => (
                            <Badge key={indicator.id} variant="secondary" className="text-xs">
                              {indicator.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>แผนพัฒนา</CardTitle>
                <CardDescription>แผนพัฒนาตามข้อเสนอแนะ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {school.improvements.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      ยังไม่มีแผนพัฒนา
                    </p>
                  ) : (
                    school.improvements.map((improvement) => (
                      <div key={improvement.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{improvement.title}</h4>
                          <Badge variant="outline">{improvement.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDateToBEWithMonth(improvement.createdAt)}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{improvement.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

