import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 20

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const page = parseInt((await searchParams).page || '1', 10)
  const skip = (page - 1) * ITEMS_PER_PAGE

  const [schools, totalCount] = await Promise.all([
    prisma.school.findMany({
      include: {
        supervisors: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        networkGroup: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            supervisions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.school.count(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">จัดการโรงเรียน</h1>
            <p className="text-muted-foreground">ทั้งหมด {schools.length} โรงเรียน</p>
          </div>
          <Button asChild>
            <Link href="/admin/schools/new">เพิ่มโรงเรียน</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการโรงเรียน</CardTitle>
            <CardDescription>ข้อมูลโรงเรียนทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อโรงเรียน</TableHead>
                  <TableHead>อำเภอ</TableHead>
                  <TableHead>กลุ่มเครือข่าย</TableHead>
                  <TableHead>จำนวนนักเรียน</TableHead>
                  <TableHead>จำนวนครู</TableHead>
                  <TableHead>ศึกษานิเทศก์</TableHead>
                  <TableHead>การนิเทศ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.code}</TableCell>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.district}</TableCell>
                    <TableCell>
                      {school.networkGroup ? (
                        <Badge variant="outline">
                          {school.networkGroup.code} - {school.networkGroup.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{school.studentCount || '-'}</TableCell>
                    <TableCell>{school.teacherCount || '-'}</TableCell>
                    <TableCell>
                      {school.supervisors.length > 0 ? (
                        <div className="space-y-1">
                          {school.supervisors.map((supervisor) => (
                            <Badge key={supervisor.id} variant="secondary" className="mr-1">
                              {supervisor.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{school._count.supervisions}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/schools/${school.id}`}>ดูรายละเอียด</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/schools/${school.id}/edit`}>แก้ไข</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

