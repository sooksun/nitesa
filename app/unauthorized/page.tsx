import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-red-600">ไม่ได้รับอนุญาต</CardTitle>
          <CardDescription>
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-muted-foreground">
            กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่าควรมีสิทธิ์เข้าถึงหน้านี้
          </p>
          <Button asChild className="w-full">
            <Link href="/">กลับหน้าหลัก</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

