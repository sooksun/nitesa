import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTimeToBE } from '@/lib/date-utils'
import { Pagination } from '@/components/ui/pagination'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 20

export default async function AdminLogsPage({
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

  const [logs, totalCount] = await Promise.all([
    prisma.activityLog.findMany({
      include: {
        user: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.activityLog.count(),
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">บันทึกกิจกรรมทั้งหมดในระบบ</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการ Activity Logs</CardTitle>
            <CardDescription>ทั้งหมด {logs.length} รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>การกระทำ</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {formatDateTimeToBE(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.user.name}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity || '-'}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
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

