import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Pagination } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 20

export default async function UsersPage({
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

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            assignedSchools: true,
            supervisions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.user.count(),
  ])

  const roleLabels: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    SUPERVISOR: 'ศึกษานิเทศก์',
    SCHOOL: 'โรงเรียน',
    EXECUTIVE: 'ผู้บริหารระดับสูง',
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    SUPERVISOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    SCHOOL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    EXECUTIVE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
            <p className="text-muted-foreground">ทั้งหมด {users.length} ผู้ใช้งาน</p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">เพิ่มผู้ใช้งาน</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการผู้ใช้งาน</CardTitle>
            <CardDescription>ข้อมูลผู้ใช้งานทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>โรงเรียนที่รับผิดชอบ</TableHead>
                  <TableHead>การนิเทศ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'SUPERVISOR' ? user._count.assignedSchools : '-'}
                    </TableCell>
                    <TableCell>{user._count.supervisions}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>แก้ไข</Link>
                      </Button>
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

