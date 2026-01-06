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
import { PolicyType } from '@prisma/client'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PolicyActions } from '@/components/policy/policy-actions'
import { Pagination } from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 20

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string
  }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const skip = (page - 1) * ITEMS_PER_PAGE

  const [policies, totalCount] = await Promise.all([
    prisma.policy.findMany({
      orderBy: { code: 'asc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.policy.count(),
  ])

  const typeLabels: Record<PolicyType, string> = {
    NAT_VALUES_LOYALTY: 'คุณธรรม จริยธรรม ความเป็นไทย และความภาคภูมิใจในความเป็นไทย',
    CIVIC_HISTORY_GEO: 'หน้าที่พลเมือง ประวัติศาสตร์ และภูมิศาสตร์',
    EDU_INNOV_TECH: 'การศึกษาเพื่อการพัฒนาทักษะในศตวรรษที่ 21 และนวัตกรรมเทคโนโลยี',
    READING_CULTURE: 'การส่งเสริมการอ่านและวัฒนธรรมการอ่าน',
    STUDENT_DEVELOPMENT: 'การพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา',
    SPECIAL_NEEDS_EDU: 'การจัดการศึกษาสำหรับผู้เรียนที่มีความต้องการพิเศษ',
    PERSONAL_EXCELLENCE: 'การส่งเสริมความเป็นเลิศของผู้เรียน',
    SCHOOL_SAFETY: 'ความปลอดภัยในสถานศึกษา',
    EDU_EQUITY_ACCESS: 'ความเสมอภาคทางการศึกษาและการเข้าถึงการศึกษา',
    TEACHER_UPSKILL: 'การพัฒนาครูและบุคลากรทางการศึกษา',
    PERSONALIZED_ASSESSMENT: 'การประเมินผลการเรียนรู้ที่หลากหลายและเหมาะสมกับผู้เรียน',
    SMART_GOVERNANCE: 'การบริหารจัดการสถานศึกษาอย่างมีประสิทธิภาพ',
    REDUCE_TEACHER_WORKLOAD: 'การลดภาระงานครู',
    TEACHER_WELFARE: 'สวัสดิการครูและบุคลากรทางการศึกษา',
    MORAL_QUALITY_LEARNING: 'คุณภาพการเรียนรู้ที่เน้นคุณธรรม',
  }

  const typeColors: Record<PolicyType, string> = {
    NAT_VALUES_LOYALTY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    CIVIC_HISTORY_GEO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    EDU_INNOV_TECH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    READING_CULTURE: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100',
    STUDENT_DEVELOPMENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    SPECIAL_NEEDS_EDU: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    PERSONAL_EXCELLENCE: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
    SCHOOL_SAFETY: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    EDU_EQUITY_ACCESS: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
    TEACHER_UPSKILL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    PERSONALIZED_ASSESSMENT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    SMART_GOVERNANCE: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
    REDUCE_TEACHER_WORKLOAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    TEACHER_WELFARE: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100',
    MORAL_QUALITY_LEARNING: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">จัดการนโยบาย</h1>
            <p className="text-muted-foreground">จัดการนโยบายทั้งหมด ({totalCount} รายการ)</p>
          </div>
          <Link href="/admin/policies/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มนโยบาย
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการนโยบาย</CardTitle>
            <CardDescription>ทั้งหมด {totalCount} รายการ</CardDescription>
          </CardHeader>
          <CardContent>
            {policies.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ชื่อนโยบาย</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.code}</TableCell>
                        <TableCell>
                          <Badge className={typeColors[policy.type]}>
                            {typeLabels[policy.type] || policy.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{policy.title}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {policy.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                            {policy.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <PolicyActions policy={policy} />
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
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                ยังไม่มีนโยบาย
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

