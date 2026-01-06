import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Supervision, School, User, Indicator, Attachment, Acknowledgement } from '@prisma/client'
import { formatDateToBEWithMonth, formatDateTimeToBE } from '@/lib/date-utils'
import { AttachmentThumbnails } from '@/components/supervision/attachment-thumbnails'
import Link from 'next/link'

interface SupervisionViewProps {
  supervision: Supervision & {
    school: School
    user: User
    indicators: Indicator[]
    attachments: Attachment[]
    acknowledgement: Acknowledgement | null
  }
  userRole: string
}

export function SupervisionView({ supervision, userRole }: SupervisionViewProps) {
  const statusLabels: Record<string, string> = {
    DRAFT: 'ร่าง',
    SUBMITTED: 'ส่งแล้ว',
    APPROVED: 'อนุมัติแล้ว',
    PUBLISHED: 'เผยแพร่แล้ว',
    NEEDS_IMPROVEMENT: 'ต้องปรับปรุง',
  }

  const levelLabels: Record<string, string> = {
    EXCELLENT: 'ดีเยี่ยม',
    GOOD: 'ดี',
    FAIR: 'พอใช้',
    NEEDS_WORK: 'ต้องพัฒนา',
  }

  const levelColors: Record<string, string> = {
    EXCELLENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    GOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    FAIR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    NEEDS_WORK: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            <Badge variant="outline">{statusLabels[supervision.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">โรงเรียน</p>
              <p className="font-medium">{supervision.school.name}</p>
              <p className="text-sm text-muted-foreground">{supervision.school.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ผู้นิเทศ</p>
              <p className="font-medium">{supervision.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่นิเทศ</p>
              <p className="font-medium">
                {formatDateToBEWithMonth(supervision.date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ประเภท</p>
              <p className="font-medium">{supervision.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตัวชี้วัด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supervision.indicators.map((indicator) => (
              <div key={indicator.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{indicator.name}</h4>
                  <Badge className={levelColors[indicator.level]}>
                    {levelLabels[indicator.level]}
                  </Badge>
                </div>
                {indicator.comment && (
                  <p className="text-sm text-muted-foreground mt-2">{indicator.comment}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สรุปผลการนิเทศ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{supervision.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อเสนอแนะ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{supervision.suggestions}</p>
        </CardContent>
      </Card>

      {supervision.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ไฟล์แนบ</CardTitle>
            <CardDescription>
              ทั้งหมด {supervision.attachments.length} ไฟล์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttachmentThumbnails attachments={supervision.attachments} />
          </CardContent>
        </Card>
      )}

      {supervision.acknowledgement && (
        <Card>
          <CardHeader>
            <CardTitle>การตอบรับ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">ตอบรับโดย</p>
              <p className="font-medium">{supervision.acknowledgement.acknowledgedBy}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่ตอบรับ</p>
              <p className="font-medium">
                {formatDateTimeToBE(supervision.acknowledgement.acknowledgedAt)}
              </p>
            </div>
            {supervision.acknowledgement.comment && (
              <div>
                <p className="text-sm text-muted-foreground">ความคิดเห็น</p>
                <p className="whitespace-pre-wrap">{supervision.acknowledgement.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {userRole === 'SCHOOL' &&
        supervision.status === 'APPROVED' &&
        !supervision.acknowledgement && (
          <Card>
            <CardHeader>
              <CardTitle>ตอบรับผลการนิเทศ</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/supervisions/${supervision.id}/acknowledge`}>ตอบรับ</Link>
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

