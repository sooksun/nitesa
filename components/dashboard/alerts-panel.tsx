'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, School, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  type: 'low_performance' | 'unsupervised' | 'pending'
  school: {
    id: string
    name: string
    code: string
  }
  message: string
}

interface AlertsPanelProps {
  alerts: Alert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>แจ้งเตือน</CardTitle>
          <CardDescription>ไม่มีแจ้งเตือนในขณะนี้</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_performance':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'unsupervised':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <School className="h-4 w-4 text-blue-600" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'low_performance':
        return 'default'
      case 'unsupervised':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>แจ้งเตือน</CardTitle>
        <CardDescription>โรงเรียนที่ต้องติดตาม ({alerts.length} รายการ)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-medium">{alert.school.name}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <Badge variant={getBadgeVariant(alert.type)}>{alert.type}</Badge>
              </div>
              <Button variant="outline" size="sm" asChild className="ml-2">
                <Link href={`/schools/${alert.school.id}`}>ดู</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

